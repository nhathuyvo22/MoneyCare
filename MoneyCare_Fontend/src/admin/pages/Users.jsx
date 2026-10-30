import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { fmtDate, maskEmail, maskPhone, exportToCSV } from '../utils/format';
import {
  UserPlus,
  Lock,
  Unlock,
  Eye,
  Pencil,
  Trash2,
  Download,
  AlertTriangle,
  Shield,
  CheckCircle,
} from 'lucide-react';

export default function Users() {
  const { users, addUser, updateUser, deleteUser, toggleUserLock } = useAdmin();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null); // target user to edit
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // target user to delete
  const [showDetailModal, setShowDetailModal] = useState(null); // selected user
  const [showLockConfirm, setShowLockConfirm] = useState(null); // target user to lock/unlock

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER',
    status: 'ACTIVE',
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      roleId: form.role === 'ADMIN' ? 1 : 2,
      status: form.status,
    };
    const ok = await addUser(payload);
    if (ok) {
      setShowAddModal(false);
      setForm({ fullName: '', email: '', phone: '', password: '', role: 'USER', status: 'ACTIVE' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!showEditModal) return;
    const payload = {
      ...showEditModal,
      fullName: showEditModal.fullName,
      email: showEditModal.email,
      phone: showEditModal.phone,
      roleId: showEditModal.role === 'ADMIN' ? 1 : 2,
      status: showEditModal.status,
    };
    const ok = await updateUser(showEditModal.id, payload);
    if (ok) setShowEditModal(null);
  };

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteUser(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const handleConfirmLock = () => {
    if (showLockConfirm) {
      toggleUserLock(showLockConfirm);
      setShowLockConfirm(null);
    }
  };

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    if (statusFilter === 'ALL') return users;
    return users.filter(u => u.status === statusFilter);
  }, [users, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      { label: 'Mã người dùng', key: 'code' },
      { label: 'Họ và tên', key: 'fullName' },
      { label: 'Email', key: 'email' },
      { label: 'Số điện thoại', key: 'phone' },
      { label: 'Ngày đăng ký', key: r => fmtDate(r.createdAt) },
      { label: 'Số tài khoản', key: 'accountsCount' },
      { label: 'Trạng thái', key: r => r.status === 'ACTIVE' ? 'Hoạt động' : r.status === 'PENDING' ? 'Chờ xác minh' : 'Đã khóa' },
      { label: 'Vai trò', key: 'role' },
    ];
    exportToCSV('Danh_sach_nguoi_dung_MoneyCare', headers, filteredUsers);
  };

  const columns = [
    {
      label: 'MÃ ND',
      key: 'code',
      sortable: true,
      render: (u) => <span className="font-mono text-xs font-bold text-brand-600">{u.code}</span>,
    },
    {
      label: 'HỌ TÊN',
      key: 'fullName',
      sortable: true,
      render: (u) => {
        const initials = (u.fullName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const isAdmin = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN';
        return (
          <div className="flex items-center gap-3">
            {/* Avatar chữ cái đầu */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: isAdmin ? '#5427B8' : '#06B6D4' }}
            >
              {initials}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">{u.fullName}</div>
              <div className={`text-[11px] font-semibold ${isAdmin ? 'text-brand-600' : 'text-muted'}`}>
                {isAdmin ? 'Admin' : 'Người dùng'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      label: 'EMAIL',
      key: 'email',
      render: (u) => <span className="font-mono text-xs text-gray-600">{maskEmail(u.email)}</span>,
    },
    {
      label: 'SĐT',
      key: 'phone',
      render: (u) => <span className="font-mono text-xs text-gray-600">{maskPhone(u.phone)}</span>,
    },
    {
      label: 'NGÀY ĐĂNG KÝ',
      key: 'createdAt',
      sortable: true,
      render: (u) => <span className="text-xs text-gray-600">{fmtDate(u.createdAt)}</span>,
    },
    {
      label: 'SỐ TK',
      key: 'accountsCount',
      sortable: true,
      render: (u) => (
        <span className="font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs">
          {u.accountsCount || 0}
        </span>
      ),
    },
    {
      label: 'TRẠNG THÁI',
      key: 'status',
      render: (u) => {
        if (u.status === 'ACTIVE') return <span className="badge badge-green">Hoạt động</span>;
        if (u.status === 'PENDING') return <span className="badge badge-yellow">Chờ xác minh</span>;
        return <span className="badge badge-red">Đã khóa</span>;
      },
    },
    {
      label: 'THAO TÁC',
      key: 'actions',
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDetailModal(u)}
            className="btn-icon hover:text-brand-600"
            title="Xem hồ sơ chi tiết"
          >
            <Eye size={15} />
          </button>

          <button
            onClick={() => setShowEditModal({ ...u })}
            className="btn-icon hover:text-amber-600"
            title="Chỉnh sửa người dùng"
          >
            <Pencil size={15} />
          </button>

          <button
            onClick={() => setShowLockConfirm(u)}
            className={`btn-icon ${u.status === 'LOCKED' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-500 hover:bg-rose-50'}`}
            title={u.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
          >
            {u.status === 'LOCKED' ? <Unlock size={15} /> : <Lock size={15} />}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(u)}
            className="btn-icon hover:text-rose-600 text-gray-400"
            title="Xóa người dùng"
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
            Quản lý người dùng
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Danh sách tất cả thành viên đăng ký, trạng thái tài khoản và phân quyền.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-xs py-2">
            <Download size={14} />
            <span>Xuất CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs py-2">
            <UserPlus size={14} />
            <span>+ Thêm người dùng</span>
          </button>
        </div>
      </div>

      {/* Main Table with filter slots */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        searchPlaceholder="Tìm kiếm tên, email, số điện thoại..."
        searchKeys={['fullName', 'email', 'phone', 'code']}
        filterComponents={
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="PENDING">Chờ xác minh</option>
            <option value="LOCKED">Đã khóa</option>
          </select>
        }
      />

      {/* Modal: Thêm người dùng mới */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm người dùng mới vào hệ thống"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email đăng nhập *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                required
                placeholder="0912345678"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu ban đầu *</label>
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Vai trò</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="admin-input"
              >
                <option value="USER">Người dùng thường (USER)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
              </select>
            </div>
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
              Tạo người dùng
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Xem chi tiết người dùng */}
      {showDetailModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDetailModal(null)}
          title={`Hồ sơ người dùng: ${showDetailModal.fullName}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-50 border border-brand-100">
              <img
                src={showDetailModal.avatar}
                alt={showDetailModal.fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-brand-400"
              />
              <div>
                <h4 className="font-extrabold text-base text-gray-900">{showDetailModal.fullName}</h4>
                <div className="text-xs text-muted font-mono">{showDetailModal.code}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`badge ${
                    showDetailModal.status === 'ACTIVE' ? 'badge-green' : 'badge-red'
                  }`}>
                    {showDetailModal.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                  </span>
                  <span className="badge badge-purple">{showDetailModal.role}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Email đầy đủ:</span>
                <span className="font-semibold text-gray-900">{showDetailModal.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Số điện thoại:</span>
                <span className="font-semibold text-gray-900">{showDetailModal.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Ngày tham gia:</span>
                <span className="font-semibold text-gray-900">{fmtDate(showDetailModal.createdAt)}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Số ví/tài khoản:</span>
                <span className="font-semibold text-brand-600">{showDetailModal.accountsCount || 1} tài khoản</span>
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

      {/* Modal: Chỉnh sửa người dùng */}
      {showEditModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(null)}
          title={`Chỉnh sửa: ${showEditModal.fullName}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên *</label>
              <input
                type="text"
                required
                value={showEditModal.fullName || ''}
                onChange={e => setShowEditModal({ ...showEditModal, fullName: e.target.value })}
                className="admin-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  value={showEditModal.email || ''}
                  onChange={e => setShowEditModal({ ...showEditModal, email: e.target.value })}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={showEditModal.phone || ''}
                  onChange={e => setShowEditModal({ ...showEditModal, phone: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vai trò</label>
                <select
                  value={showEditModal.roleId === 1 || showEditModal.role === 'ADMIN' ? 'ADMIN' : 'USER'}
                  onChange={e => setShowEditModal({ ...showEditModal, role: e.target.value, roleId: e.target.value === 'ADMIN' ? 1 : 2 })}
                  className="admin-input"
                >
                  <option value="USER">Người dùng thường (USER)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={showEditModal.status || 'ACTIVE'}
                  onChange={e => setShowEditModal({ ...showEditModal, status: e.target.value })}
                  className="admin-input"
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="PENDING">Chờ xác minh (PENDING)</option>
                  <option value="LOCKED">Đã khóa (LOCKED)</option>
                </select>
              </div>
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

      {/* Modal: Xác nhận xóa người dùng */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Xác nhận xóa người dùng"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                Bạn có chắc chắn muốn xóa vĩnh viễn người dùng{' '}
                <strong>{showDeleteConfirm.fullName}</strong> ({showDeleteConfirm.email})? Hành động này không thể hoàn tác!
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

      {/* Modal: Xác nhận khóa/mở khóa */}
      {showLockConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowLockConfirm(null)}
          title={showLockConfirm.status === 'LOCKED' ? 'Mở khóa người dùng' : 'Xác nhận khóa người dùng'}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                Bạn có chắc chắn muốn {showLockConfirm.status === 'LOCKED' ? 'mở khóa tài khoản' : 'khóa tài khoản'} của{' '}
                <strong>{showLockConfirm.fullName}</strong> ({showLockConfirm.email})?
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowLockConfirm(null)} className="btn-secondary text-xs">
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmLock}
                className={showLockConfirm.status === 'LOCKED' ? 'btn-primary text-xs' : 'btn-danger text-xs'}
              >
                {showLockConfirm.status === 'LOCKED' ? 'Xác nhận mở khóa' : 'Khóa tài khoản'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
