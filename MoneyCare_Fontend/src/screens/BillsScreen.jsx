import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function BillsScreen() {
  const { bills, accounts, addBill, payBill, hideBalance, fmt, loading } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ billName: '', amount: '', dueDate: '', description: '' });
  const [errors, setErrors]   = useState({});
  const [confirm, setConfirm] = useState(null); // bill to pay
  const [paymentAccountId, setPaymentAccountId] = useState('');

  const validate = () => {
    const e = {};
    if (!form.billName.trim()) e.billName = 'Nhập tên hóa đơn';
    const amt = parseInt(form.amount.replace(/\D/g,''));
    if (!amt || amt <= 0)      e.amount   = 'Nhập số tiền hợp lệ';
    if (!form.dueDate)         e.dueDate  = 'Chọn ngày đến hạn';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const saved = await addBill({
      name: form.billName,
      expectedAmount: parseInt(form.amount.replace(/\D/g,'')),
      dueDate: form.dueDate,
      description: form.description,
      status: 'PENDING',
    });
    if (saved) {
      setForm({ billName: '', amount: '', dueDate: '', description: '' });
      setShowAdd(false);
    }
  };

  const pending = bills.filter(b => b.status === 'PENDING');
  const paid    = bills.filter(b => b.status === 'PAID');

  const BillRow = ({ b }) => {
    const isPending = b.status === 'PENDING';
    const due = new Date(b.dueDate);
    const daysLeft = Math.ceil((due - new Date()) / 86400000);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: isPending ? 'var(--warning-light)' : 'var(--success-light)', color: isPending ? 'var(--warning)' : 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isPending ? <Zap size={18} /> : <CheckCircle size={18} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{b.billName || b.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {b.description} • Ngày {due.toLocaleDateString('vi-VN')}
            {isPending && daysLeft >= 0 && <> • <span style={{ color: daysLeft <= 3 ? 'var(--danger)' : 'var(--warning)' }}>còn {daysLeft} ngày</span></>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{hideBalance ? '••••' : fmt(b.amount ?? b.expectedAmount)}</div>
          {isPending ? (
            <button
              className="btn btn-secondary btn-sm mt-1"
              onClick={() => {
                setPaymentAccountId(accounts.find(a => a.status === 'ACTIVE')?.id?.toString() || '');
                setConfirm(b);
              }}
            >
              Thanh toán
            </button>
          ) : (
            <span className="badge badge-green" style={{ marginTop: 4 }}>Đã thanh toán</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div className="grid-2">
        <div className="stat-card">
          <div className="stat-label">Chưa thanh toán</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{pending.length} hóa đơn</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tổng cần thanh toán</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {hideBalance ? '•••• đ' : fmt(pending.reduce((s, b) => s + Number(b.amount ?? b.expectedAmount ?? 0), 0))}
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Hóa đơn chưa thanh toán</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Thêm hóa đơn</button>
        </div>
        <div style={{ padding: '0 20px' }}>
          {pending.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={36} className="empty-icon" />
              <div className="empty-title">Không có hóa đơn chưa thanh toán</div>
              <div className="empty-desc">Tuyệt vời! Bạn đã thanh toán tất cả hóa đơn.</div>
            </div>
          ) : pending.map(b => <BillRow key={b.id} b={b} />)}
        </div>
      </div>

      {/* Paid */}
      {paid.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Đã thanh toán</span></div>
          <div style={{ padding: '0 20px' }}>
            {paid.map(b => <BillRow key={b.id} b={b} />)}
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Thêm hóa đơn mới</h3>
              <button className="icon-btn" onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tên hóa đơn</label>
                  <input className={`form-control${errors.billName ? ' error' : ''}`} value={form.billName} onChange={e => setForm(p => ({ ...p, billName: e.target.value }))} placeholder="VD: Tiền điện EVN, Netflix…" />
                  {errors.billName && <div className="form-error">{errors.billName}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Số tiền (đ)</label>
                  <input className={`form-control${errors.amount ? ' error' : ''}`} value={form.amount}
                    onChange={e => { const n = e.target.value.replace(/\D/g,''); setForm(p => ({ ...p, amount: n ? parseInt(n).toLocaleString('vi-VN') : '' })); }}
                    placeholder="VD: 1.120.000 đ"
                  />
                  {errors.amount && <div className="form-error">{errors.amount}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Ngày đến hạn</label>
                  <input type="date" className={`form-control${errors.dueDate ? ' error' : ''}`} value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                  {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mã/Ghi chú</label>
                  <input className="form-control" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Mã hóa đơn, gói dịch vụ…" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Thêm hóa đơn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm pay */}
      {confirm && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3 className="modal-title">Xác nhận thanh toán</h3>
              <button className="icon-btn" onClick={() => setConfirm(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Xác nhận đã thanh toán hóa đơn <strong>"{confirm.billName || confirm.name}"</strong> số tiền <strong>{fmt(confirm.amount ?? confirm.expectedAmount)}</strong>?
              </p>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Tài khoản thanh toán</label>
                <select
                  className="form-control"
                  value={paymentAccountId}
                  onChange={e => setPaymentAccountId(e.target.value)}
                  disabled={loading.billPayment}
                >
                  <option value="">-- Chọn tài khoản --</option>
                  {accounts.filter(a => a.status === 'ACTIVE').map(account => (
                    <option key={account.id} value={account.id}>
                      {account.accountName} ({fmt(account.balance)})
                    </option>
                  ))}
                </select>
                {accounts.filter(a => a.status === 'ACTIVE').length === 0 && (
                  <div className="form-error">Bạn chưa có tài khoản đang hoạt động để thanh toán.</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)} disabled={loading.billPayment}>Hủy</button>
              <button
                className="btn btn-primary"
                disabled={!paymentAccountId || loading.billPayment}
                onClick={async () => {
                  const paidSuccessfully = await payBill(confirm, Number(paymentAccountId));
                  if (paidSuccessfully) setConfirm(null);
                }}
              >
                {loading.billPayment ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
