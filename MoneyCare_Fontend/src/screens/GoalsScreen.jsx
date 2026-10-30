import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import AnimatedNumber from '../components/AnimatedNumber';
import { Plus, X, Loader } from 'lucide-react';

export default function GoalsScreen() {
  const { savingsGoals, accounts, addSavingsGoal, depositSavings, hideBalance, fmt } = useApp();

  const [showAdd,   setShowAdd]   = useState(false);
  const [depositOf, setDepositOf] = useState(null); // goal object
  const [form,      setForm]      = useState({ goalName: '', targetAmount: '', targetDate: '', accountId: '' });
  const [depAmt,    setDepAmt]    = useState('');
  const [depAccId,  setDepAccId]  = useState(accounts[0]?.id || '');
  const [errors,    setErrors]    = useState({});

  const handleAddGoal = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.goalName.trim()) err.goalName = 'Nhập tên mục tiêu';
    const t = parseInt(form.targetAmount.replace(/\D/g,''));
    if (!t || t <= 0) err.targetAmount = 'Nhập số tiền mục tiêu hợp lệ';
    if (!form.targetDate) err.targetDate = 'Chọn ngày mục tiêu';
    setErrors(err);
    if (Object.keys(err).length) return;
    await addSavingsGoal({
      name: form.goalName.trim(),
      goalName: form.goalName.trim(),
      targetAmount: t,
      currentAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: form.targetDate,
      description: '',
      status: 'ACTIVE',
    });
    setForm({ goalName: '', targetAmount: '', targetDate: '', accountId: '' });
    setShowAdd(false);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amt = parseInt(depAmt.replace(/\D/g,''));
    if (!amt || amt <= 0) return;
    await depositSavings(depositOf.id, amt, Number(depAccId));
    setDepAmt('');
    setDepositOf(null);
  };

  const ICONS = ['🎯','💻','✈️','🚗','🏠','📚','❤️','🌍'];
  const goalsWithPct = savingsGoals.map(g => ({
    ...g,
    pct: g.targetAmount ? Math.min(100, Math.round(((g.currentAmount || 0) / g.targetAmount) * 100)) : 0,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Mục tiêu & Hũ tiết kiệm</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Thêm mục tiêu</button>
        </div>
        <div className="card-body">
          {goalsWithPct.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 40 }}>🎯</span>
              <div className="empty-title">Chưa có mục tiêu tiết kiệm nào</div>
              <div className="empty-desc">Tạo mục tiêu để có động lực tích lũy mỗi ngày!</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Tạo mục tiêu đầu tiên</button>
            </div>
          ) : (
            <div className="grid-3">
              {goalsWithPct.map((g, i) => (
                <div key={g.id} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: 20, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 10 }}>{ICONS[i % ICONS.length]}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 4 }}>{g.goalName || g.name}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 2 }}>
                    <AnimatedNumber value={g.currentAmount || 0} hideBalance={hideBalance} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    Mục tiêu: {hideBalance ? '•••• đ' : fmt(g.targetAmount)} • {g.targetDate ? `Đến ngày ${new Date(g.targetDate).toLocaleDateString('vi-VN')}` : 'Không thời hạn'}
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 6 }}>
                    <div className="progress-fill" style={{ width: `${g.pct}%`, background: g.pct >= 100 ? 'var(--success)' : 'var(--primary)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    <span>{g.pct}% hoàn thành</span>
                    <span>Còn thiếu: {hideBalance ? '••••' : fmt(Math.max(0, g.targetAmount - (g.currentAmount || 0)))}</span>
                  </div>
                  {g.pct < 100 && (
                    <button className="btn btn-secondary btn-sm btn-full" onClick={() => { setDepositOf(g); setDepAccId(accounts[0]?.id || ''); }}>
                      💰 Nạp tiền vào hũ
                    </button>
                  )}
                  {g.pct >= 100 && (
                    <div className="badge badge-green" style={{ justifyContent: 'center', padding: '6px 12px' }}>🎉 Đã đạt mục tiêu!</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAdd && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Tạo mục tiêu tiết kiệm</h3>
              <button className="icon-btn" onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddGoal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tên mục tiêu</label>
                  <input className={`form-control${errors.goalName ? ' error' : ''}`} value={form.goalName} onChange={e => setForm(p => ({ ...p, goalName: e.target.value }))} placeholder="VD: Mua MacBook M3 Pro" />
                  {errors.goalName && <div className="form-error">{errors.goalName}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Số tiền mục tiêu (đ)</label>
                  <input className={`form-control${errors.targetAmount ? ' error' : ''}`} value={form.targetAmount}
                    onChange={e => { const n = e.target.value.replace(/\D/g,''); setForm(p => ({ ...p, targetAmount: n ? parseInt(n).toLocaleString('vi-VN') : '' })); }}
                    placeholder="VD: 50.000.000 đ"
                  />
                  {errors.targetAmount && <div className="form-error">{errors.targetAmount}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Ngày mục tiêu</label>
                  <input type="date" className={`form-control${errors.targetDate ? ' error' : ''}`} value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} />
                  {errors.targetDate && <div className="form-error">{errors.targetDate}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo mục tiêu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositOf && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDepositOf(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Nạp tiền vào hũ</h3>
              <button className="icon-btn" onClick={() => setDepositOf(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{depositOf.goalName}</div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Số tiền muốn nạp (đ)</label>
                  <input className="form-control" value={depAmt}
                    onChange={e => { const n = e.target.value.replace(/\D/g,''); setDepAmt(n ? parseInt(n).toLocaleString('vi-VN') : ''); }}
                    placeholder="VD: 500.000 đ" style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Trích từ tài khoản</label>
                  <select className="form-control" value={depAccId} onChange={e => setDepAccId(e.target.value)}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName} ({fmt(a.balance)})</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setDepositOf(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Nạp tiền</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
