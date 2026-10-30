import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { fmtMoney, fmtDate, exportToCSV } from '../utils/format';
import { Target, Plus, Download, Eye, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SavingsGoals() {
  const { savingsGoals, addSavingsGoal, deleteSavingsGoal, users } = useAdmin();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetail, setShowDetail] = useState(null);

  const [form, setForm] = useState({
    name: '',
    userId: users[0]?.id || 1,
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const tAmt = Number(String(form.targetAmount).replace(/\D/g, ''));
    const cAmt = Number(String(form.currentAmount).replace(/\D/g, '')) || 0;
    if (!tAmt || tAmt <= 0) return;

    const payload = {
      name: form.name,
      userId: Number(form.userId) || users[0]?.id || 1,
      targetAmount: tAmt,
      currentAmount: cAmt,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: form.targetDate || null,
      status: 'ACTIVE',
    };
    const ok = await addSavingsGoal(payload);
    if (ok) {
      setShowAddModal(false);
      setForm({
        name: '',
        userId: users[0]?.id || 1,
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteSavingsGoal(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const filteredGoals = useMemo(() => {
    if (statusFilter === 'ALL') return savingsGoals;
    return savingsGoals.filter(g => g.status === statusFilter);
  }, [savingsGoals, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      { label: 'Chủ sở hữu', key: 'userName' },
      { label: 'Tên mục tiêu', key: 'name' },
      { label: 'Số tiền mục tiêu', key: 'targetAmount' },
      { label: 'Hiện có', key: 'currentAmount' },
      { label: 'Tiến độ', key: r => `${Math.min(100, Math.round((r.currentAmount / r.targetAmount) * 100))}%` },
      { label: 'Ngày bắt đầu', key: r => fmtDate(r.startDate) },
      { label: 'Dự kiến hoàn thành', key: r => fmtDate(r.targetDate) },
      { label: 'Trạng thái', key: r => r.status === 'COMPLETED' ? 'Hoàn thành' : r.status === 'PAUSED' ? 'Tạm dừng' : 'Đang tiết kiệm' },
    ];
    exportToCSV('Muc_tieu_tiet_kiem_MoneyCare', headers, filteredGoals);
  };

  const columns = [
    {
      label: 'CHỦ SỞ HỮU',
      key: 'userName',
      sortable: true,
      render: (g) => <span className="font-semibold text-gray-900 text-xs sm:text-sm">{g.userName}</span>,
    },
    {
      label: 'TÊN MỤC TIÊU',
      key: 'name',
      sortable: true,
      render: (g) => <span className="font-bold text-gray-800 text-xs sm:text-sm">{g.name}</span>,
    },
    {
      label: 'SỐ TIỀN MỤC TIÊU',
      key: 'targetAmount',
      sortable: true,
      render: (g) => <span className="font-extrabold text-brand-600 text-xs sm:text-sm">{fmtMoney(g.targetAmount)}</span>,
    },
    {
      label: 'HIỆN CÓ',
      key: 'currentAmount',
      sortable: true,
      render: (g) => <span className="font-bold text-gray-800 text-xs sm:text-sm">{fmtMoney(g.currentAmount)}</span>,
    },
    {
      label: 'TIẾN ĐỘ',
      key: 'pct',
      render: (g) => {
        const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
        return (
          <div className="min-w-[120px]">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className={pct >= 100 ? 'text-emerald-600' : 'text-brand-600'}>{pct}%</span>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <div
                className={`progress-fill ${pct >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      label: 'NGÀY BẮT ĐẦU',
      key: 'startDate',
      sortable: true,
      render: (g) => <span className="text-xs text-muted font-mono">{fmtDate(g.startDate)}</span>,
    },
    {
      label: 'DỰ KIẾN HOÀN THÀNH',
      key: 'targetDate',
      sortable: true,
      render: (g) => <span className="text-xs text-muted font-mono">{fmtDate(g.targetDate)}</span>,
    },
    {
      label: 'TRẠNG THÁI',
      key: 'status',
      render: (g) => {
        if (g.status === 'COMPLETED') return <span className="badge badge-green">Hoàn thành</span>;
        if (g.status === 'PAUSED') return <span className="badge badge-gray">Tạm dừng</span>;
        return <span className="badge badge-purple">Đang tiết kiệm</span>;
      },
    },
    {
      label: 'THAO TÁC',
      key: 'actions',
      render: (g) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDetail(g)}
            className="btn-icon hover:text-brand-600"
            title="Xem chi tiết mục tiêu"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(g)}
            className="btn-icon hover:text-rose-600 text-gray-400"
            title="Xóa mục tiêu"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Mục tiêu tiết kiệm
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Quản lý các hũ tiết kiệm, tích lũy tài chính và tiến độ hoàn thành của người dùng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-xs py-2">
            <Download size={14} />
            <span>Xuất CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs py-2">
            <Plus size={14} />
            <span>+ Tạo mục tiêu</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredGoals}
        searchPlaceholder="Tìm kiếm tên mục tiêu, chủ sở hữu..."
        searchKeys={['name', 'userName']}
        filterComponents={
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang tiết kiệm</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="PAUSED">Tạm dừng</option>
          </select>
        }
      />

      {/* Modal: Tạo mục tiêu mới */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tạo mục tiêu tiết kiệm mới"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên mục tiêu *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Mua nhà, Quỹ khẩn cấp..."
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="admin-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Chủ sở hữu *</label>
            <select
              value={form.userId}
              onChange={e => setForm({ ...form, userId: Number(e.target.value) })}
              className="admin-input"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số tiền mục tiêu *</label>
              <input
                type="text"
                required
                placeholder="50.000.000 đ"
                value={form.targetAmount ? Number(form.targetAmount).toLocaleString('vi-VN') : ''}
                onChange={e => setForm({ ...form, targetAmount: e.target.value.replace(/\D/g, '') })}
                className="admin-input font-bold text-brand-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Đã có ban đầu</label>
              <input
                type="text"
                placeholder="0 đ"
                value={form.currentAmount ? Number(form.currentAmount).toLocaleString('vi-VN') : ''}
                onChange={e => setForm({ ...form, currentAmount: e.target.value.replace(/\D/g, '') })}
                className="admin-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Ngày dự kiến hoàn thành *</label>
            <input
              type="date"
              required
              value={form.targetDate}
              onChange={e => setForm({ ...form, targetDate: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-secondary text-xs"
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn-primary text-xs">
              Tạo mục tiêu
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Chi tiết mục tiêu */}
      {showDetail && (
        <Modal
          isOpen={true}
          onClose={() => setShowDetail(null)}
          title={`Chi tiết mục tiêu: ${showDetail.name}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted block">Tiến độ tích lũy:</span>
                <span className="text-2xl font-black text-brand-600">
                  {fmtMoney(showDetail.currentAmount)}
                </span>
                <span className="text-xs text-muted block mt-0.5">
                  Mục tiêu: {fmtMoney(showDetail.targetAmount)}
                </span>
              </div>
              <span className={`badge ${showDetail.status === 'COMPLETED' ? 'badge-green' : 'badge-purple'}`}>
                {showDetail.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang tiết kiệm'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Chủ sở hữu:</span>
                <span className="font-semibold text-gray-900">{showDetail.userName}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Tỷ lệ hoàn thành:</span>
                <span className="font-bold text-emerald-600">
                  {showDetail.targetAmount > 0 ? Math.min(100, Math.round((showDetail.currentAmount / showDetail.targetAmount) * 100)) : 0}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Ngày bắt đầu:</span>
                <span className="font-mono text-gray-900">{fmtDate(showDetail.startDate)}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Hạn mục tiêu:</span>
                <span className="font-mono text-gray-900">{fmtDate(showDetail.targetDate)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button onClick={() => setShowDetail(null)} className="btn-secondary text-xs">
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Modal: Xác nhận xóa mục tiêu */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Xác nhận xóa mục tiêu tiết kiệm"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                Bạn có chắc chắn muốn xóa mục tiêu{' '}
                <strong>{showDeleteConfirm.name}</strong> của người dùng {showDeleteConfirm.userName}?
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary text-xs">
                Hủy bỏ
              </button>
              <button onClick={handleConfirmDelete} className="btn-danger text-xs">
                Xóa mục tiêu
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
