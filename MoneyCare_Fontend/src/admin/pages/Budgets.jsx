import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { fmtMoney, fmtDate, exportToCSV } from '../utils/format';
import { PieChart as PieIcon, Plus, Download, Eye, Trash2, AlertTriangle } from 'lucide-react';

export default function Budgets() {
  const { budgets, addBudget, deleteBudget, users, categories } = useAdmin();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetail, setShowDetail] = useState(null);

  const [form, setForm] = useState({
    budgetName: '',
    userId: users[0]?.id || 1,
    amount: '',
    startDate: '',
    endDate: '',
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(String(form.amount).replace(/\D/g, ''));
    if (!amt || amt <= 0) return;
    const payload = {
      budgetName: form.budgetName,
      userId: Number(form.userId) || users[0]?.id || 1,
      amount: amt,
      startDate: form.startDate,
      endDate: form.endDate,
      status: 'ACTIVE',
    };
    const ok = await addBudget(payload);
    if (ok) {
      setShowAddModal(false);
      setForm({ budgetName: '', userId: users[0]?.id || 1, amount: '', startDate: '', endDate: '' });
    }
  };

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteBudget(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const filteredBudgets = useMemo(() => {
    if (statusFilter === 'ALL') return budgets;
    return budgets.filter(b => b.status === statusFilter);
  }, [budgets, statusFilter]);

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'bg-rose-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusBadge = (status) => {
    if (status === 'EXCEEDED') return <span className="badge badge-red">Vượt ngân sách</span>;
    if (status === 'WARNING') return <span className="badge badge-yellow">Cảnh báo</span>;
    return <span className="badge badge-green">Bình thường</span>;
  };

  const handleExportCSV = () => {
    const headers = [
      { label: 'Người dùng', key: 'userName' },
      { label: 'Tên ngân sách', key: 'budgetName' },
      { label: 'Danh mục', key: 'categoryName' },
      { label: 'Hạn mức', key: 'amount' },
      { label: 'Đã chi', key: 'spent' },
      { label: 'Tỷ lệ', key: r => `${Math.min(100, Math.round((r.spent / r.amount) * 100))}%` },
      { label: 'Thời gian', key: 'period' },
      { label: 'Trạng thái', key: r => r.status === 'EXCEEDED' ? 'Vượt ngân sách' : r.status === 'WARNING' ? 'Cảnh báo' : 'Bình thường' },
    ];
    exportToCSV('Quan_ly_ngan_sach_MoneyCare', headers, filteredBudgets);
  };

  const columns = [
    {
      label: 'NGƯỜI DÙNG',
      key: 'userName',
      sortable: true,
      render: (b) => <span className="font-semibold text-gray-900 text-xs">{b.userName}</span>,
    },
    {
      label: 'TÊN NGÂN SÁCH',
      key: 'budgetName',
      sortable: true,
      render: (b) => <span className="font-bold text-gray-800">{b.budgetName}</span>,
    },
    {
      label: 'DANH MỤC',
      key: 'categoryName',
      render: (b) => <span className="text-xs font-medium text-gray-600">{b.categoryName}</span>,
    },
    {
      label: 'HẠN MỨC',
      key: 'amount',
      sortable: true,
      render: (b) => <span className="font-bold text-brand-600 text-xs">{fmtMoney(b.amount)}</span>,
    },
    {
      label: 'ĐÃ CHI',
      key: 'spent',
      sortable: true,
      render: (b) => <span className={`font-bold text-xs ${b.spent > b.amount ? 'text-rose-600' : 'text-gray-800'}`}>{fmtMoney(b.spent)}</span>,
    },
    {
      label: 'TỶ LỆ SỬ DỤNG',
      key: 'percent',
      render: (b) => {
        const pct = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
        const clampedPct = Math.min(100, pct);
        return (
          <div className="min-w-[100px]">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className={`font-bold ${pct >= 100 ? 'text-rose-600' : pct >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}%</span>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <div className={`progress-fill ${getProgressColor(pct)}`} style={{ width: `${clampedPct}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      label: 'THỜI GIAN',
      key: 'period',
      render: (b) => <span className="text-xs text-muted font-mono">{b.period}</span>,
    },
    {
      label: 'TRẠNG THÁI',
      key: 'status',
      render: (b) => getStatusBadge(b.status),
    },
    {
      label: 'THAO TÁC',
      key: 'actions',
      render: (b) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDetail(b)}
            className="btn-icon hover:text-brand-600"
            title="Chi tiết ngân sách"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(b)}
            className="btn-icon hover:text-rose-600 text-gray-400"
            title="Xóa ngân sách"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản lý ngân sách
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Theo dõi hạn mức chi tiêu và tỷ lệ sử dụng ngân sách theo danh mục.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-xs py-2">
            <Download size={14} />
            <span>Xuất CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs py-2">
            <Plus size={14} />
            <span>+ Tạo ngân sách</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredBudgets}
        searchPlaceholder="Tìm kiếm tên ngân sách, người dùng, danh mục..."
        searchKeys={['budgetName', 'userName', 'categoryName']}
        filterComponents={
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="NORMAL">Bình thường</option>
            <option value="WARNING">Cảnh báo</option>
            <option value="EXCEEDED">Vượt ngân sách</option>
          </select>
        }
      />

      {/* Modal: Tạo ngân sách mới */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tạo ngân sách mới">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên ngân sách *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Ăn uống tháng 5..."
              value={form.budgetName}
              onChange={e => setForm({ ...form, budgetName: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Người dùng *</label>
              <select
                value={form.userId}
                onChange={e => setForm({ ...form, userId: Number(e.target.value) })}
                className="admin-input"
              >
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Danh mục liên quan</label>
              <select
                value={form.categoryName}
                onChange={e => setForm({ ...form, categoryName: e.target.value })}
                className="admin-input"
              >
                {categories.filter(c => c.type === 'EXPENSE').map(c => (
                  <option key={c.id} value={c.categoryName}>{c.icon} {c.categoryName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Hạn mức ngân sách *</label>
            <input
              type="text"
              required
              placeholder="5.000.000 đ"
              value={form.amount ? Number(form.amount).toLocaleString('vi-VN') : ''}
              onChange={e => setForm({ ...form, amount: e.target.value.replace(/\D/g, '') })}
              className="admin-input font-bold text-brand-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày bắt đầu *</label>
              <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="admin-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày kết thúc *</label>
              <input type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="admin-input" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs">Hủy bỏ</button>
            <button type="submit" className="btn-primary text-xs">Tạo ngân sách</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Chi tiết ngân sách */}
      {showDetail && (
        <Modal isOpen={true} onClose={() => setShowDetail(null)} title={`Chi tiết: ${showDetail.budgetName}`}>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted">Tỷ lệ sử dụng:</span>
                <span className="text-sm font-black text-gray-900">
                  {showDetail.amount > 0 ? Math.round((showDetail.spent / showDetail.amount) * 100) : 0}%
                </span>
              </div>
              <div className="progress-track" style={{ height: 10 }}>
                <div
                  className={`progress-fill ${getProgressColor(showDetail.amount > 0 ? Math.round((showDetail.spent / showDetail.amount) * 100) : 0)}`}
                  style={{ width: `${Math.min(100, showDetail.amount > 0 ? Math.round((showDetail.spent / showDetail.amount) * 100) : 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-muted">Đã chi: <strong className="text-rose-600">{fmtMoney(showDetail.spent)}</strong></span>
                <span className="text-muted">Hạn mức: <strong className="text-brand-600">{fmtMoney(showDetail.amount)}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Chủ ngân sách:</span>
                <span className="font-semibold text-gray-900">{showDetail.userName}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Danh mục:</span>
                <span className="font-semibold text-gray-900">{showDetail.categoryName}</span>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Thời gian áp dụng:</span>
                <span className="font-mono font-semibold text-gray-900">{showDetail.period}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button onClick={() => setShowDetail(null)} className="btn-secondary text-xs">Đóng</button>
            </div>
          </div>
        </Modal>
      )}
      {/* Modal: Xác nhận xóa ngân sách */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Xác nhận xóa ngân sách"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                Bạn có chắc chắn muốn xóa ngân sách{' '}
                <strong>{showDeleteConfirm.budgetName}</strong> của người dùng {showDeleteConfirm.userName}?
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary text-xs">
                Hủy bỏ
              </button>
              <button onClick={handleConfirmDelete} className="btn-danger text-xs">
                Xóa ngân sách
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
