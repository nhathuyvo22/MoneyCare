import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, X, AlertTriangle } from 'lucide-react';

export default function BudgetScreen() {
  const { budgets, transactions, categories, hideBalance, fmt, txType, addBudget, deleteBudget } = useApp();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ budgetName: '', categoryId: '', limitAmount: '' });
  const [errors, setErrors]   = useState({});
  const [toDelete, setToDelete] = useState(null);

  const budgetWithSpent = budgets.map(b => {
    const spent = transactions
      .filter(t => t.categoryId === b.categoryId && txType(t.type) === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const pct = b.limitAmount ? Math.min(100, Math.round((spent / b.limitAmount) * 100)) : 0;
    const left = Math.max(0, b.limitAmount - spent);
    return { ...b, spent, pct, left };
  });

  const totalBudget = budgets.reduce((s, b) => s + (b.limitAmount || 0), 0);
  const totalSpent  = budgetWithSpent.reduce((s, b) => s + b.spent, 0);

  const expCats = categories.filter(c => c.type === 'EXPENSE');

  const validate = () => {
    const e = {};
    if (!form.budgetName.trim()) e.budgetName = 'Nhập tên ngân sách';
    if (!form.categoryId)        e.categoryId = 'Chọn danh mục';
    const lim = parseInt(form.limitAmount.replace(/\D/g, ''));
    if (!lim || lim <= 0)        e.limitAmount = 'Nhập hạn mức hợp lệ';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const lim = parseInt(form.limitAmount.replace(/\D/g, ''));
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const end   = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    await addBudget({
      budgetName: form.budgetName,
      categoryId: Number(form.categoryId),
      limitAmount: lim,
      startDate: start,
      endDate: end,
    });
    setForm({ budgetName: '', categoryId: '', limitAmount: '' });
    setShowAdd(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary row */}
      <div className="grid-3">
        {[
          { label: 'Tổng hạn mức',   val: totalBudget,            color: 'var(--primary)' },
          { label: 'Đã chi',          val: totalSpent,             color: 'var(--danger)'  },
          { label: 'Còn lại',         val: totalBudget - totalSpent, color: 'var(--success)' },
        ].map(({ label, val, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{hideBalance ? '•••• đ' : fmt(val)}</div>
          </div>
        ))}
      </div>

      {/* Budget list */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Hạn mức chi tiêu theo danh mục</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Tạo ngân sách
          </button>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {budgetWithSpent.length === 0 ? (
            <div className="empty-state">
              <AlertTriangle size={36} className="empty-icon" />
              <div className="empty-title">Chưa có ngân sách nào</div>
              <div className="empty-desc">Tạo ngân sách để kiểm soát chi tiêu theo từng danh mục.</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Tạo ngân sách đầu tiên</button>
            </div>
          ) : budgetWithSpent.map(b => {
            const bar = b.pct >= 100 ? 'var(--danger)' : b.pct >= 80 ? 'var(--warning)' : 'var(--success)';
            return (
              <div key={b.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{b.budgetName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Đã chi: {hideBalance ? '••••' : fmt(b.spent)} / Hạn mức: {hideBalance ? '••••' : fmt(b.limitAmount)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {b.pct >= 100 && (
                      <span className="badge badge-red"><AlertTriangle size={10} /> Vượt hạn mức!</span>
                    )}
                    {b.pct >= 80 && b.pct < 100 && (
                      <span className="badge badge-orange"><AlertTriangle size={10} /> Gần hết hạn mức</span>
                    )}
                    <button
                      className="icon-btn"
                      style={{ width: 28, height: 28 }}
                      onClick={() => setToDelete(b)}
                      title="Xóa ngân sách"
                    >
                      <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${b.pct}%`, background: bar }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: '0.72rem', color: bar }}>{b.pct}% đã dùng</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Còn lại: {hideBalance ? '••••' : fmt(b.left)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Tạo ngân sách mới</h3>
              <button className="icon-btn" onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tên ngân sách</label>
                  <input className={`form-control${errors.budgetName ? ' error' : ''}`} value={form.budgetName} onChange={e => setForm(p => ({ ...p, budgetName: e.target.value }))} placeholder="VD: Ăn uống tháng 10" />
                  {errors.budgetName && <div className="form-error">{errors.budgetName}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Danh mục chi tiêu</label>
                  <select className={`form-control${errors.categoryId ? ' error' : ''}`} value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                    <option value="">-- Chọn danh mục --</option>
                    {expCats.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                  </select>
                  {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hạn mức (đ)</label>
                  <input className={`form-control${errors.limitAmount ? ' error' : ''}`} value={form.limitAmount}
                    onChange={e => {
                      const n = e.target.value.replace(/\D/g,'');
                      setForm(p => ({ ...p, limitAmount: n ? parseInt(n).toLocaleString('vi-VN') : '' }));
                    }}
                    placeholder="VD: 5.000.000 đ"
                  />
                  {errors.limitAmount && <div className="form-error">{errors.limitAmount}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo ngân sách</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {toDelete && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger)' }}><AlertTriangle size={16} style={{ marginRight: 6 }} />Xóa ngân sách</h3>
              <button className="icon-btn" onClick={() => setToDelete(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Bạn có chắc muốn xóa ngân sách <strong>"{toDelete.budgetName}"</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setToDelete(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => { deleteBudget(toDelete.id); setToDelete(null); }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
