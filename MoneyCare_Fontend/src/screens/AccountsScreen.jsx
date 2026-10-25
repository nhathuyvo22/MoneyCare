import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, CreditCard, Smartphone, Banknote, Building2 } from 'lucide-react';

const ACC_TYPE_MAP = {
  NGAN_HANG:   { label: 'Ngân hàng',      Icon: Building2,  bg: '#6339DB' },
  VI_DIEN_TU:  { label: 'Ví điện tử',     Icon: Smartphone, bg: '#A50064' },
  THE_TIN_DUNG:{ label: 'Thẻ tín dụng',   Icon: CreditCard, bg: '#2D3748' },
  TIEN_MAT:    { label: 'Tiền mặt',        Icon: Banknote,   bg: '#16A085' },
};

const GRADIENTS = [
  'linear-gradient(135deg,#6339DB,#9B51E0)',
  'linear-gradient(135deg,#A50064,#D4206A)',
  'linear-gradient(135deg,#1B4D3E,#27AE60)',
  'linear-gradient(135deg,#2D3748,#4A5568)',
  'linear-gradient(135deg,#16A085,#1ABC9C)',
];

export default function AccountsScreen() {
  const { accounts, addAccount, hideBalance, fmt } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ accountName: '', accountType: 'NGAN_HANG', balance: '', description: '' });
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.accountName.trim()) e.accountName = 'Nhập tên tài khoản';
    const b = parseInt(form.balance.replace(/\D/g,''));
    if (form.balance && isNaN(b))  e.balance = 'Số dư không hợp lệ';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const balance = parseInt(form.balance.replace(/\D/g,'') || '0');
    await addAccount({
      accountName: form.accountName,
      accountType: form.accountType,
      openingBalance: balance,
      balance,
      currency: 'VND',
      description: form.description || form.accountName,
    });
    setForm({ accountName: '', accountType: 'NGAN_HANG', balance: '', description: '' });
    setShowAdd(false);
  };

  const totalBalance = accounts.filter(a => a.accountType !== 'THE_TIN_DUNG').reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Net worth bar */}
      <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--primary), #9B51E0)', color: 'white', border: 'none' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, opacity: .85, marginBottom: 6 }}>TỔNG TÀI SẢN</div>
        <div style={{ fontSize: '2rem', fontWeight: 800 }}>
          {hideBalance ? '•••••••• đ' : fmt(totalBalance)}
        </div>
        <div style={{ fontSize: '0.76rem', opacity: .75, marginTop: 4 }}>{accounts.length} tài khoản & ví</div>
      </div>

      {/* Account cards */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Danh sách tài khoản & ví</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Thêm tài khoản
          </button>
        </div>
        <div className="card-body">
          {accounts.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={36} className="empty-icon" />
              <div className="empty-title">Chưa có tài khoản nào</div>
              <div className="empty-desc">Thêm tài khoản ngân hàng hoặc ví điện tử để bắt đầu quản lý.</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Thêm tài khoản đầu tiên</button>
            </div>
          ) : (
            <div className="grid-2">
              {accounts.map((a, i) => {
                const meta = ACC_TYPE_MAP[a.accountType] || ACC_TYPE_MAP['TIEN_MAT'];
                const grad = GRADIENTS[i % GRADIENTS.length];
                const Icon = meta.Icon;
                return (
                  <div key={a.id} className="account-card" style={{ background: grad }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: .8, letterSpacing: '.5px', textTransform: 'uppercase' }}>{meta.label}</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: 2 }}>{a.accountName}</div>
                      </div>
                      <Icon size={22} style={{ opacity: .9 }} />
                    </div>
                    <div style={{ fontSize: '0.78rem', opacity: .75, marginBottom: 8 }}>{a.description}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                      {hideBalance ? '•••••••• đ' : fmt(a.balance)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Thêm tài khoản mới</h3>
              <button className="icon-btn" onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tên tài khoản</label>
                  <input className={`form-control${errors.accountName ? ' error' : ''}`} value={form.accountName} onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))} placeholder="VD: Vietcombank, Ví MoMo" />
                  {errors.accountName && <div className="form-error">{errors.accountName}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Loại tài khoản</label>
                  <select className="form-control" value={form.accountType} onChange={e => setForm(p => ({ ...p, accountType: e.target.value }))}>
                    <option value="NGAN_HANG">Ngân hàng</option>
                    <option value="VI_DIEN_TU">Ví điện tử</option>
                    <option value="TIEN_MAT">Tiền mặt</option>
                    <option value="THE_TIN_DUNG">Thẻ tín dụng</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Số dư hiện tại (đ)</label>
                  <input className={`form-control${errors.balance ? ' error' : ''}`} value={form.balance}
                    onChange={e => { const n = e.target.value.replace(/\D/g,''); setForm(p => ({ ...p, balance: n ? parseInt(n).toLocaleString('vi-VN') : '' })); }}
                    placeholder="VD: 5.000.000 đ"
                  />
                  {errors.balance && <div className="form-error">{errors.balance}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Ghi chú (số tài khoản, số thẻ…)</label>
                  <input className="form-control" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="VD: •••• 9821" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Thêm tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
