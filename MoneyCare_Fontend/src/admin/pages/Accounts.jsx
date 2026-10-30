import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { fmtDate, fmtMoney, exportToCSV } from '../utils/format';
import {
  CreditCard,
  Plus,
  Download,
  Wallet,
  PiggyBank,
  Landmark,
  Power,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function Accounts() {
  const { accounts, users, addAccount, updateAccount, deleteAccount, toggleAccountStatus } = useAdmin();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);

  // Form State
  const [form, setForm] = useState({
    accountName: '',
    userId: users[0]?.id || 1,
    accountTypeId: 2, // 2: NGAN_HANG
    accountType: 'TK Thanh toán',
    balance: '',
    currency: 'VND',
    status: 'ACTIVE',
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      accountName: form.accountName,
      userId: Number(form.userId) || users[0]?.id || 1,
      accountTypeId: Number(form.accountTypeId) || 2,
      openingBalance: Number(String(form.balance).replace(/\D/g, '')) || 0,
      balance: Number(String(form.balance).replace(/\D/g, '')) || 0,
      currency: form.currency || 'VND',
      status: form.status || 'ACTIVE',
    };
    const ok = await addAccount(payload);
    if (ok) {
      setShowAddModal(false);
      setForm({
        accountName: '',
        userId: users[0]?.id || 1,
        accountTypeId: 2,
        accountType: 'TK Thanh toán',
        balance: '',
        currency: 'VND',
        status: 'ACTIVE',
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!showEditModal) return;
    const payload = {
      ...showEditModal,
      accountName: showEditModal.accountName,
      balance: Number(String(showEditModal.balance).replace(/\D/g, '')) || 0,
      status: showEditModal.status,
    };
    const ok = await updateAccount(showEditModal.id, payload);
    if (ok) setShowEditModal(null);
  };

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteAccount(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
      const matchType = typeFilter === 'ALL' || a.accountType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchType && matchStatus;
    });
  }, [accounts, typeFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      { label: 'Mã tài khoản', key: 'code' },
      { label: 'Chủ tài khoản', key: 'userName' },
      { label: 'Loại tài khoản', key: 'accountType' },
      { label: 'Tên tài khoản', key: 'accountName' },
      { label: 'Số dư hiện tại', key: r => r.balance },
      { label: 'Ngày tạo', key: r => fmtDate(r.createdAt) },
      { label: 'Trạng thái', key: r => r.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng' },
    ];
    exportToCSV('Danh_sach_tai_khoan_MoneyCare', headers, filteredAccounts);
  };

  const getAccountIcon = (type) => {
    if (type?.includes('Ví')) return <Wallet size={16} className="text-pink-500" />;
    if (type?.includes('Tiết kiệm')) return <PiggyBank size={16} className="text-amber-500" />;
    return <Landmark size={16} className="text-brand-500" />;
  };

  const columns = [
    {
      label: 'MÃ TK',
      key: 'code',
      sortable: true,
      render: (a) => <span className="font-mono text-xs font-bold text-brand-600">{a.code}</span>,
    },
    {
      label: 'CHỦ TÀI KHOẢN',
      key: 'userName',
      sortable: true,
      render: (a) => <span className="font-semibold text-gray-900 text-xs sm:text-sm">{a.userName}</span>,
    },
    {
      label: 'LOẠI TÀI KHOẢN',
      key: 'accountType',
      sortable: true,
      render: (a) => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
          {getAccountIcon(a.accountType)}
          <span>{a.accountType}</span>
        </div>
      ),
    },
    {
      label: 'TÊN TÀI KHOẢN',
      key: 'accountName',
      sortable: true,
      render: (a) => <span className="font-bold text-gray-800 text-xs sm:text-sm">{a.accountName}</span>,
    },
    {
      label: 'SỐ DƯ',
      key: 'balance',
      sortable: true,
      render: (a) => (
        <span className="font-extrabold text-sm text-brand-600">
          {fmtMoney(a.balance)}
        </span>
      ),
    },
    {
      label: 'NGÀY TẠO',
      key: 'createdAt',
      sortable: true,
      render: (a) => <span className="text-xs text-muted">{fmtDate(a.createdAt)}</span>,
    },
    {
      label: 'TRẠNG THÁI',
      key: 'status',
      render: (a) => (
        <span className={`badge ${a.status === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`}>
          {a.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}
        </span>
      ),
    },
    {
      label: 'THAO TÁC',
      key: 'actions',
      render: (a) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDetailModal(a)}
            className="btn-icon hover:text-brand-600"
            title="Chi tiết tài khoản"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setShowEditModal({ ...a })}
            className="btn-icon hover:text-amber-600"
            title="Chỉnh sửa tài khoản"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => toggleAccountStatus(a)}
            className={`btn-icon ${a.status === 'ACTIVE' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
            title={a.status === 'ACTIVE' ? 'Tạm ngưng ví' : 'Kích hoạt lại'}
          >
            <Power size={15} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(a)}
            className="btn-icon hover:text-rose-600 text-gray-400"
            title="Xóa tài khoản"
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
            Quản lý tài khoản
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Quản lý các tài khoản ngân hàng, ví điện tử và sổ tiết kiệm trong hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-xs py-2">
            <Download size={14} />
            <span>Xuất CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs py-2">
            <Plus size={14} />
            <span>+ Thêm tài khoản</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredAccounts}
        searchPlaceholder="Tìm kiếm tên ví, ngân hàng, chủ tài khoản..."
        searchKeys={['accountName', 'userName', 'code', 'accountType']}
        filterComponents={
          <>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="TK Thanh toán">TK Thanh toán</option>
              <option value="Ví điện tử">Ví điện tử</option>
              <option value="Tiết kiệm">Tiết kiệm</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="SUSPENDED">Tạm ngưng</option>
            </select>
          </>
        }
      />

      {/* Modal: Thêm tài khoản mới */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm tài khoản / ví mới"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Chủ tài khoản *</label>
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Loại tài khoản</label>
              <select
                value={form.accountType}
                onChange={e => {
                  const val = e.target.value;
                  const code = val === 'Ví điện tử' ? 'WALLET' : val === 'Tiết kiệm' ? 'SAVINGS' : 'PAYMENT';
                  setForm({ ...form, accountType: val, typeCode: code });
                }}
                className="admin-input"
              >
                <option value="TK Thanh toán">Tài khoản thanh toán</option>
                <option value="Ví điện tử">Ví điện tử</option>
                <option value="Tiết kiệm">Sổ tiết kiệm</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tên tài khoản / Ví *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: MB Bank, MoMo..."
                value={form.accountName}
                onChange={e => setForm({ ...form, accountName: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Số dư ban đầu (VNĐ) *</label>
            <input
              type="text"
              required
              placeholder="0 đ"
              value={form.balance ? Number(form.balance).toLocaleString('vi-VN') : ''}
              onChange={e => setForm({ ...form, balance: e.target.value.replace(/\D/g, '') })}
              className="admin-input font-bold text-brand-600"
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
              Tạo tài khoản
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Chỉnh sửa tài khoản */}
      {showEditModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(null)}
          title={`Chỉnh sửa tài khoản: ${showEditModal.accountName}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tên tài khoản / Ví *</label>
              <input
                type="text"
                required
                value={showEditModal.accountName || ''}
                onChange={e => setShowEditModal({ ...showEditModal, accountName: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số dư (VNĐ) *</label>
              <input
                type="text"
                required
                value={showEditModal.balance != null ? Number(showEditModal.balance).toLocaleString('vi-VN') : ''}
                onChange={e => setShowEditModal({ ...showEditModal, balance: e.target.value.replace(/\D/g, '') })}
                className="admin-input font-bold text-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Trạng thái</label>
              <select
                value={showEditModal.status || 'ACTIVE'}
                onChange={e => setShowEditModal({ ...showEditModal, status: e.target.value })}
                className="admin-input"
              >
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="SUSPENDED">Tạm ngưng (SUSPENDED)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                className="btn-secondary text-xs"
              >
                Hủy bỏ
              </button>
              <button type="submit" className="btn-primary text-xs">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Xác nhận xóa tài khoản */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Xác nhận xóa tài khoản"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản ví{' '}
                <strong>{showDeleteConfirm.accountName}</strong> (Mã: {showDeleteConfirm.code})? Hành động này sẽ ảnh hưởng đến lịch sử giao dịch liên quan!
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary text-xs">
                Hủy bỏ
              </button>
              <button onClick={handleConfirmDelete} className="btn-danger text-xs">
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Chi tiết tài khoản */}
      {showDetailModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDetailModal(null)}
          title={`Chi tiết: ${showDetailModal.accountName}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted block">Số dư hiện tại:</span>
                <span className="text-2xl font-black text-brand-600">
                  {fmtMoney(showDetailModal.balance)}
                </span>
              </div>
              <span className={`badge ${showDetailModal.status === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`}>
                {showDetailModal.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Mã tài khoản:</span>
                <span className="font-mono font-bold text-gray-900">{showDetailModal.code}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Chủ sở hữu:</span>
                <span className="font-semibold text-gray-900">{showDetailModal.userName}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Loại ví/thẻ:</span>
                <span className="font-semibold text-gray-900">{showDetailModal.accountType}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Ngày khởi tạo:</span>
                <span className="font-semibold text-gray-900">{fmtDate(showDetailModal.createdAt)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button onClick={() => setShowDetailModal(null)} className="btn-secondary text-xs">
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
