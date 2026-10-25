import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, TrendingUp, TrendingDown, Trash2, X, AlertTriangle } from 'lucide-react';

export default function TransactionsScreen({ onAddTx }) {
  const { transactions, accounts, categories, hideBalance, fmt, txType, deleteTransaction, loading } = useApp();

  const [query,   setQuery]   = useState('');
  const [filter,  setFilter]  = useState('all');  // all | income | expense
  const [sortBy,  setSortBy]  = useState('date'); // date | amount
  const [detail,  setDetail]  = useState(null);
  const [confirm, setConfirm] = useState(false);

  const getAccName = (id) => accounts.find(a => a.id === id)?.accountName || `Tài khoản #${id}`;
  const getCatName = (id) => categories.find(c => c.id === id)?.categoryName || '–';

  const filtered = transactions
    .filter(t => {
      if (filter === 'income'  && txType(t.type) !== 'income')  return false;
      if (filter === 'expense' && txType(t.type) !== 'expense') return false;
      if (query) {
        const q = query.toLowerCase();
        return t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => sortBy === 'date'
      ? new Date(b.transactionDate) - new Date(a.transactionDate)
      : b.amount - a.amount
    );

  const handleDelete = async () => {
    await deleteTransaction(detail);
    setConfirm(false);
    setDetail(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div className="card">
        <div className="card-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div className="search-box" style={{ flex: '1 1 220px' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm giao dịch…" />
            {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={13} /></button>}
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all','Tất cả'], ['income','Thu nhập'], ['expense','Chi tiêu']].map(([v, l]) => (
              <button key={v} className={`chip${filter === v ? ' active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>

          {/* Sort */}
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 140 }}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="date">Sắp xếp: Mới nhất</option>
            <option value="amount">Sắp xếp: Số tiền</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={onAddTx}>+ Thêm mới</button>
        </div>
      </div>

      {/* List */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Danh sách giao dịch</span>
          <span className="badge badge-purple">{filtered.length} kết quả</span>
        </div>
        <div style={{ padding: '0 20px' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Search size={36} className="empty-icon" />
              <div className="empty-title">{query ? `Không tìm thấy "${query}"` : 'Chưa có giao dịch nào'}</div>
              <div className="empty-desc">
                {query ? 'Thử từ khóa khác.' : 'Hãy thêm khoản thu hoặc chi đầu tiên để bắt đầu theo dõi!'}
              </div>
              {!query && <button className="btn btn-primary btn-sm mt-2" onClick={onAddTx}>+ Ghi chép ngay</button>}
            </div>
          ) : filtered.map(tx => {
            const inc = txType(tx.type) === 'income';
            return (
              <div key={tx.id} className="tx-item" onClick={() => setDetail(tx)}>
                <div className="tx-icon" style={{ background: inc ? 'var(--success-light)' : 'var(--danger-light)', color: inc ? 'var(--success)' : 'var(--danger)' }}>
                  {inc ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tx-name truncate">{tx.title}</div>
                  <div className="tx-meta">
                    {new Date(tx.transactionDate).toLocaleDateString('vi-VN')} •
                    <span style={{ marginLeft: 4 }}>{getAccName(tx.accountId)}</span>
                    {tx.categoryId && <> • <span>{getCatName(tx.categoryId)}</span></>}
                  </div>
                </div>
                <div className={`tx-amount ${inc ? 'tx-income' : 'tx-expense'}`}>
                  {hideBalance ? '••••' : `${inc ? '+' : '−'}${fmt(tx.amount)}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 className="modal-title">Chi tiết giao dịch</h3>
              <button className="icon-btn" onClick={() => setDetail(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Amount hero */}
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  fontSize: '2rem', fontWeight: 800,
                  color: txType(detail.type) === 'income' ? 'var(--success)' : 'var(--danger)',
                }}>
                  {hideBalance ? '•••••• đ' : `${txType(detail.type) === 'income' ? '+' : '−'}${fmt(detail.amount)}`}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{detail.title}</div>
              </div>

              <div className="divider" />

              {[
                ['Loại giao dịch', txType(detail.type) === 'income' ? '💰 Thu nhập' : '💸 Chi tiêu'],
                ['Tài khoản',      getAccName(detail.accountId)],
                ['Danh mục',       detail.categoryId ? getCatName(detail.categoryId) : '–'],
                ['Ngày giao dịch', new Date(detail.transactionDate).toLocaleString('vi-VN')],
                ['Ghi chú',        detail.description || '–'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={() => setConfirm(true)}>
                <Trash2 size={13} /> Xóa
              </button>
              <button className="btn btn-outline" onClick={() => setDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirm && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} /> Xác nhận xóa
              </h3>
              <button className="icon-btn" onClick={() => setConfirm(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Bạn có chắc chắn muốn xóa giao dịch <strong>"{detail?.title}"</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Hủy</button>
              <button className="btn btn-danger" disabled={loading.delTx} onClick={handleDelete}>
                {loading.delTx ? 'Đang xóa…' : 'Xóa giao dịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
