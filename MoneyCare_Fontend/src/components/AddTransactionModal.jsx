import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Loader } from 'lucide-react';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function AddTransactionModal({ onClose }) {
  const { accounts, categories, addTransaction, loading, fmt } = useApp();

  const [type,      setType]      = useState('EXPENSE');
  const [amount,    setAmount]    = useState('');
  const [catId,     setCatId]     = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [destAccId, setDestAccId] = useState('');
  const [note,      setNote]      = useState('');
  const [date,      setDate]      = useState(new Date().toISOString().split('T')[0]);
  const [errors,    setErrors]    = useState({});

  const cats = categories.filter(category => {
    const categoryType = String(category.type || category.categoryType || '').toUpperCase();
    const isSelectedType = type === 'INCOME'
      ? categoryType === 'INCOME' || categoryType === 'THU'
      : categoryType === 'EXPENSE' || categoryType === 'CHI';
    return isSelectedType && (!category.status || category.status === 'ACTIVE');
  });

  useEffect(() => {
    if (!cats.some(category => String(category.id) === String(catId))) {
      setCatId(cats[0]?.id ?? '');
    }
  }, [cats, catId]);

  const validate = () => {
    const e = {};
    const num = parseFloat(amount.replace(/\D/g, ''));
    if (!num || num <= 0) e.amount = 'Vui lòng nhập số tiền hợp lệ (> 0)';
    if (!accountId)        e.account = 'Vui lòng chọn tài khoản';
    if (type !== 'CHUYEN_TIEN' && !cats.some(category => String(category.id) === String(catId))) {
      e.category = 'Vui lòng chọn danh mục phù hợp';
    }
    if (type === 'CHUYEN_TIEN' && !destAccId) e.dest = 'Vui lòng chọn tài khoản đích';
    if (type === 'CHUYEN_TIEN' && destAccId === String(accountId)) e.dest = 'Tài khoản đích phải khác tài khoản nguồn';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const num = parseFloat(amount.replace(/\D/g, ''));
    await addTransaction({
      accountId:       Number(accountId),
      targetAccountId: type === 'CHUYEN_TIEN' ? Number(destAccId) : null,
      categoryId:      type === 'CHUYEN_TIEN' ? null : catId,
      type,
      amount: num,
      title: note || (cats.find(c => String(c.id) === String(catId))?.categoryName ?? 'Giao dịch'),
      description: note,
      transactionDate: `${date}T${new Date().toTimeString().slice(0,5)}:00`,
    });
    onClose();
  };

  const addQuick = (v) => {
    const cur = parseFloat(amount.replace(/\D/g, '') || '0');
    setAmount((cur + v).toLocaleString('vi-VN'));
  };

  const fmtInput = (raw) => {
    const n = raw.replace(/\D/g, '');
    return n ? parseInt(n, 10).toLocaleString('vi-VN') : '';
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3 className="modal-title">Thêm giao dịch mới</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Type switcher */}
            <div className="type-switcher">
              {[
                { v: 'EXPENSE',     label: '💸 Chi tiêu',   cls: 'active-expense'  },
                { v: 'INCOME',      label: '💰 Thu nhập',   cls: 'active-income'   },
                { v: 'CHUYEN_TIEN', label: '🔄 Chuyển ví',  cls: 'active-transfer' },
              ].map(({ v, label, cls }) => (
                <button key={v} type="button"
                  className={`type-btn${type === v ? ' ' + cls : ''}`}
                  onClick={() => setType(v)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Số tiền</label>
              <input
                className={`form-control${errors.amount ? ' error' : ''}`}
                value={amount}
                onChange={e => setAmount(fmtInput(e.target.value))}
                placeholder="0 đ"
                style={{ fontSize: '1.3rem', fontWeight: 700, textAlign: 'center' }}
              />
              {errors.amount && <div className="form-error">{errors.amount}</div>}
              {/* Quick chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {QUICK_AMOUNTS.map(v => (
                  <button key={v} type="button" className="chip" onClick={() => addQuick(v)}>
                    +{v >= 1000000 ? v/1000000 + 'tr' : v/1000 + 'k'}
                  </button>
                ))}
                {amount && (
                  <button type="button" className="chip" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setAmount('')}>
                    Xóa
                  </button>
                )}
              </div>
            </div>

            {/* Category (not for transfer) */}
            {type !== 'CHUYEN_TIEN' && (
              <div>
                <label className="form-label">Danh mục</label>
                <div className="cat-grid">
                  {cats.map(c => (
                    <button key={c.id} type="button"
                      className={`cat-btn${String(catId) === String(c.id) ? ' selected' : ''}`}
                      onClick={() => setCatId(c.id)}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{c.emoji || '🏷️'}</span>
                      <span>{c.categoryName}</span>
                    </button>
                  ))}
                  {cats.length === 0 && (
                    <div className="form-error">Chưa có danh mục cho loại giao dịch này.</div>
                  )}
                </div>
                {errors.category && <div className="form-error">{errors.category}</div>}
              </div>
            )}

            {/* Account */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                {type === 'CHUYEN_TIEN' ? 'Tài khoản nguồn' : 'Tài khoản'}
              </label>
              <select
                className={`form-control${errors.account ? ' error' : ''}`}
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.accountName} ({fmt(a.balance)})</option>
                ))}
              </select>
              {errors.account && <div className="form-error">{errors.account}</div>}
            </div>

            {/* Destination account (transfer) */}
            {type === 'CHUYEN_TIEN' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tài khoản đích</label>
                <select
                  className={`form-control${errors.dest ? ' error' : ''}`}
                  value={destAccId}
                  onChange={e => setDestAccId(e.target.value)}
                >
                  <option value="">-- Chọn tài khoản đích --</option>
                  {accounts.filter(a => String(a.id) !== String(accountId)).map(a => (
                    <option key={a.id} value={a.id}>{a.accountName}</option>
                  ))}
                </select>
                {errors.dest && <div className="form-error">{errors.dest}</div>}
              </div>
            )}

            {/* Date & Note */}
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ngày giao dịch</label>
                <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ghi chú</label>
                <input
                  className="form-control"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Mô tả ngắn..."
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading.tx}
            >
              {loading.tx ? <Loader size={15} className="spin" /> : null}
              {loading.tx ? 'Đang lưu...' : 'Lưu giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
