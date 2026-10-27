import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import AnimatedNumber from '../components/AnimatedNumber';
import {
  Plus, X, CreditCard, Smartphone, Banknote, Building2,
  ArrowDownCircle, Loader, CheckCircle2, ShieldCheck
} from 'lucide-react';

const ACC_TYPE_MAP = {
  NGAN_HANG:    { label: 'Ngân hàng',      Icon: Building2,  bg: '#6339DB' },
  VI_DIEN_TU:   { label: 'Ví điện tử',     Icon: Smartphone, bg: '#A50064' },
  THE_TIN_DUNG: { label: 'Thẻ tín dụng',   Icon: CreditCard, bg: '#2D3748' },
  TIEN_MAT:     { label: 'Tiền mặt',        Icon: Banknote,   bg: '#16A085' },
};

const GRADIENTS = [
  'linear-gradient(135deg,#6339DB,#9B51E0)',
  'linear-gradient(135deg,#A50064,#D4206A)',
  'linear-gradient(135deg,#1B4D3E,#27AE60)',
  'linear-gradient(135deg,#2D3748,#4A5568)',
  'linear-gradient(135deg,#16A085,#1ABC9C)',
];

const DEPOSIT_SOURCES = [
  { id: 'Chuyển khoản (Napas 247)', label: 'Chuyển khoản Napas 247', icon: '🏦' },
  { id: 'Thẻ ATM / Visa / Master',  label: 'Thẻ ATM / Visa / Master', icon: '💳' },
  { id: 'Tiền mặt trực tiếp',       label: 'Tiền mặt trực tiếp',      icon: '💵' },
  { id: 'Ví điện tử liên kết',      label: 'Ví điện tử liên kết',     icon: '📱' },
];

const QUICK_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

export default function AccountsScreen() {
  const { accounts, addAccount, depositAccount, hideBalance, fmt, loading } = useApp();

  // Add account modal state
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ accountName: '', accountType: 'NGAN_HANG', balance: '', description: '' });
  const [errors, setErrors]   = useState({});

  // Deposit modal state
  const [showDeposit, setShowDeposit]   = useState(false);
  const [depositForm, setDepositForm]   = useState({
    accountId: accounts[0]?.id || '',
    amount: '',
    source: DEPOSIT_SOURCES[0].id,
    note: '',
  });
  const [depositErrors, setDepositErrors] = useState({});

  // Validate Add Account
  const validateAdd = () => {
    const e = {};
    if (!form.accountName.trim()) e.accountName = 'Nhập tên tài khoản';
    const b = parseInt(form.balance.replace(/\D/g,''));
    if (form.balance && isNaN(b))  e.balance = 'Số dư không hợp lệ';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdd()) return;
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

  // Open Deposit Modal for a specific account or default first
  const openDeposit = (targetAccId = null) => {
    const accId = targetAccId || accounts[0]?.id || '';
    setDepositForm({
      accountId: accId,
      amount: '',
      source: DEPOSIT_SOURCES[0].id,
      note: '',
    });
    setDepositErrors({});
    setShowDeposit(true);
  };

  const addQuickDeposit = (val) => {
    const cur = parseFloat(depositForm.amount.replace(/\D/g, '') || '0');
    setDepositForm(p => ({
      ...p,
      amount: (cur + val).toLocaleString('vi-VN')
    }));
  };

  const validateDeposit = () => {
    const e = {};
    const amt = parseFloat(depositForm.amount.replace(/\D/g, ''));
    if (!depositForm.accountId) e.accountId = 'Vui lòng chọn ví nhận tiền';
    if (!amt || amt <= 0) e.amount = 'Vui lòng nhập số tiền hợp lệ (> 0)';
    setDepositErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!validateDeposit()) return;
    const amt = parseFloat(depositForm.amount.replace(/\D/g, ''));
    const success = await depositAccount({
      accountId: depositForm.accountId,
      amount: amt,
      source: depositForm.source,
      note: depositForm.note,
    });
    if (success) {
      setShowDeposit(false);
    }
  };

  const totalBalance = accounts
    .filter(a => a.accountType !== 'THE_TIN_DUNG')
    .reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Net worth banner with Quick Actions */}
      <div
        className="stat-card"
        style={{
          background: 'linear-gradient(135deg, var(--primary), #9B51E0)',
          color: 'white',
          border: 'none',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '24px 28px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.85, letterSpacing: '0.5px', marginBottom: 6 }}>
            TỔNG TÀI SẢN KHẢ DỤNG
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            <AnimatedNumber value={totalBalance} hideBalance={hideBalance} />
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 4 }}>
            Đang quản lý {accounts.length} tài khoản & ví tiền
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{
              background: '#FFFFFF',
              color: 'var(--primary)',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
            }}
            onClick={() => openDeposit()}
          >
            <ArrowDownCircle size={18} style={{ color: 'var(--success)' }} />
            <span>Nạp tiền vào ví</span>
          </button>
          <button
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.18)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.3)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
            }}
            onClick={() => setShowAdd(true)}
          >
            <Plus size={16} />
            <span>Thêm ví mới</span>
          </button>
        </div>
      </div>

      {/* Account cards */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="card-title">Danh sách tài khoản & ví</span>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Chạm "Nạp tiền" trên thẻ ví để nạp thêm số dư bất kỳ lúc nào
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => openDeposit()}>
              <ArrowDownCircle size={14} style={{ color: 'var(--success)' }} />
              <span>Nạp tiền</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} />
              <span>Thêm ví</span>
            </button>
          </div>
        </div>

        <div className="card-body">
          {accounts.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={36} className="empty-icon" />
              <div className="empty-title">Chưa có tài khoản nào</div>
              <div className="empty-desc">Thêm tài khoản ngân hàng hoặc ví điện tử để bắt đầu quản lý.</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                + Thêm tài khoản đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid-2">
              {accounts.map((a, i) => {
                const meta = ACC_TYPE_MAP[a.accountType] || ACC_TYPE_MAP['TIEN_MAT'];
                const grad = GRADIENTS[i % GRADIENTS.length];
                const Icon = meta.Icon;
                return (
                  <div
                    key={a.id}
                    className="account-card"
                    style={{
                      background: grad,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 170,
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.85, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                            {meta.label}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '1.15rem', marginTop: 2 }}>
                            {a.accountName}
                          </div>
                        </div>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={20} style={{ opacity: 0.95 }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.8, marginBottom: 10 }}>
                        {a.description || 'Ví tài chính'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>Số dư hiện tại</div>
                        <div style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                          <AnimatedNumber value={a.balance} hideBalance={hideBalance} />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeposit(a.id);
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.25)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          backdropFilter: 'blur(4px)',
                          transition: 'all 150ms',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                      >
                        <ArrowDownCircle size={14} />
                        <span>Nạp tiền</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: NẠP TIỀN VÀO VÍ ================= */}
      {showDeposit && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowDeposit(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }}>
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--success), #27AE60)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  <ArrowDownCircle size={22} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>Nạp tiền vào ví</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Tăng số dư khả dụng và tự động ghi nhận vào lịch sử
                  </p>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setShowDeposit(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleDepositSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Chọn tài khoản / ví nhận tiền */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Chọn ví nhận tiền</label>
                  <select
                    className={`form-control${depositErrors.accountId ? ' error' : ''}`}
                    value={depositForm.accountId}
                    onChange={e => setDepositForm(p => ({ ...p, accountId: e.target.value }))}
                    style={{ fontWeight: 600 }}
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.accountName} (Hiện có: {fmt(a.balance)})
                      </option>
                    ))}
                  </select>
                  {depositErrors.accountId && <div className="form-error">{depositErrors.accountId}</div>}
                </div>

                {/* Nhập số tiền nạp */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Số tiền cần nạp</label>
                  <input
                    className={`form-control${depositErrors.amount ? ' error' : ''}`}
                    value={depositForm.amount}
                    onChange={e => {
                      const n = e.target.value.replace(/\D/g, '');
                      setDepositForm(p => ({
                        ...p,
                        amount: n ? parseInt(n, 10).toLocaleString('vi-VN') : ''
                      }));
                    }}
                    placeholder="0 đ"
                    style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', color: 'var(--success)' }}
                    autoFocus
                  />
                  {depositErrors.amount && <div className="form-error">{depositErrors.amount}</div>}

                  {/* Phím gợi ý số tiền nhanh */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {QUICK_AMOUNTS.map(v => (
                      <button
                        key={v}
                        type="button"
                        className="chip"
                        onClick={() => addQuickDeposit(v)}
                        style={{ fontSize: '0.78rem' }}
                      >
                        +{v >= 1000000 ? v / 1000000 + 'tr' : v / 1000 + 'k'}
                      </button>
                    ))}
                    {depositForm.amount && (
                      <button
                        type="button"
                        className="chip"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        onClick={() => setDepositForm(p => ({ ...p, amount: '' }))}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                {/* Nguồn tiền nạp */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phương thức / Nguồn tiền nạp</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {DEPOSIT_SOURCES.map(s => {
                      const active = depositForm.source === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setDepositForm(p => ({ ...p, source: s.id }))}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                            background: active ? 'var(--primary-light)' : 'var(--bg)',
                            color: active ? 'var(--primary)' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: '0.8rem',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 120ms',
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                          <span className="truncate">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ghi chú */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Ghi chú (tùy chọn)</label>
                  <input
                    className="form-control"
                    placeholder="VD: Nạp tiền chi tiêu tuần này, Tiền lương..."
                    value={depositForm.note}
                    onChange={e => setDepositForm(p => ({ ...p, note: e.target.value }))}
                  />
                </div>

                {/* Notice */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  fontSize: '0.74rem', color: 'var(--text-muted)'
                }}>
                  <ShieldCheck size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span>Giao dịch nạp tiền an toàn, số dư được cộng ngay và lưu lại vào nhật ký thu chi.</span>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowDeposit(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading.deposit}
                  style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                >
                  {loading.deposit ? <Loader size={15} className="spin" /> : <CheckCircle2 size={16} />}
                  <span>{loading.deposit ? 'Đang nạp tiền...' : 'Xác nhận nạp tiền'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM TÀI KHOẢN MỚI ================= */}
      {showAdd && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Thêm tài khoản mới</h3>
              <button className="icon-btn" onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tên tài khoản</label>
                  <input
                    className={`form-control${errors.accountName ? ' error' : ''}`}
                    value={form.accountName}
                    onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))}
                    placeholder="VD: Vietcombank, Ví MoMo"
                  />
                  {errors.accountName && <div className="form-error">{errors.accountName}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Loại tài khoản</label>
                  <select
                    className="form-control"
                    value={form.accountType}
                    onChange={e => setForm(p => ({ ...p, accountType: e.target.value }))}
                  >
                    <option value="NGAN_HANG">Ngân hàng</option>
                    <option value="VI_DIEN_TU">Ví điện tử</option>
                    <option value="TIEN_MAT">Tiền mặt</option>
                    <option value="THE_TIN_DUNG">Thẻ tín dụng</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Số dư hiện tại (đ)</label>
                  <input
                    className={`form-control${errors.balance ? ' error' : ''}`}
                    value={form.balance}
                    onChange={e => {
                      const n = e.target.value.replace(/\D/g,'');
                      setForm(p => ({ ...p, balance: n ? parseInt(n, 10).toLocaleString('vi-VN') : '' }));
                    }}
                    placeholder="VD: 5.000.000 đ"
                  />
                  {errors.balance && <div className="form-error">{errors.balance}</div>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Ghi chú (số tài khoản, số thẻ…)</label>
                  <input
                    className="form-control"
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="VD: •••• 9821"
                  />
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
