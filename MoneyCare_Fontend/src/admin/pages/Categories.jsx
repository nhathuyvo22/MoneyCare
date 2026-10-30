import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { exportToCSV } from '../utils/format';
import {
  Tags,
  Plus,
  Download,
  Power,
  Palette,
  Check,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const PRESET_ICONS = ['💼', '🎁', '📈', '🍜', '🚗', '🛒', '🧾', '🎬', '❤️', '📚', '🏠', '✈️'];
const PRESET_COLORS = ['#16A34A', '#0EA5E9', '#F23891', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981'];

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus } = useAdmin();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Form State
  const [form, setForm] = useState({
    categoryName: '',
    type: 'EXPENSE',
    icon: '🍜',
    color: '#F23891',
    description: '',
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const ok = await addCategory(form);
    if (ok) {
      setShowAddModal(false);
      setForm({ categoryName: '', type: 'EXPENSE', icon: '🍜', color: '#F23891', description: '' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!showEditModal) return;
    const ok = await updateCategory(showEditModal.id, showEditModal);
    if (ok) setShowEditModal(null);
  };

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteCategory(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchType = typeFilter === 'ALL' || c.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchType && matchStatus;
    });
  }, [categories, typeFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      { label: 'Mã danh mục', key: 'code' },
      { label: 'Tên danh mục', key: 'categoryName' },
      { label: 'Loại', key: r => r.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu' },
      { label: 'Màu sắc', key: 'color' },
      { label: 'Số giao dịch', key: 'txCount' },
      { label: 'Trạng thái', key: r => r.status === 'ACTIVE' ? 'Đang dùng' : 'Tắt' },
    ];
    exportToCSV('Danh_sach_danh_muc_MoneyCare', headers, filteredCategories);
  };

  const columns = [
    {
      label: 'MÃ DM',
      key: 'code',
      sortable: true,
      render: (c) => <span className="font-mono text-xs font-bold text-brand-600">{c.code}</span>,
    },
    {
      label: 'TÊN DANH MỤC',
      key: 'categoryName',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{c.icon || '📌'}</span>
          <span className="font-bold text-gray-900 text-xs sm:text-sm">{c.categoryName}</span>
        </div>
      ),
    },
    {
      label: 'LOẠI',
      key: 'type',
      sortable: true,
      render: (c) => (
        <span className={`badge ${c.type === 'INCOME' ? 'badge-green' : 'badge-red'}`}>
          {c.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
        </span>
      ),
    },
    {
      label: 'ICON',
      key: 'icon',
      render: (c) => (
        <span className="inline-block p-1.5 rounded-lg bg-surface border border-border text-base">
          {c.icon || '📌'}
        </span>
      ),
    },
    {
      label: 'MÀU SẮC',
      key: 'color',
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ background: c.color }} />
          <span className="font-mono text-xs text-gray-600 uppercase">{c.color}</span>
        </div>
      ),
    },
    {
      label: 'SỐ GD',
      key: 'txCount',
      sortable: true,
      render: (c) => (
        <span className="font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs">
          {c.txCount || 0}
        </span>
      ),
    },
    {
      label: 'TRẠNG THÁI',
      key: 'status',
      render: (c) => (
        <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
          {c.status === 'ACTIVE' ? 'Đang dùng' : 'Tắt'}
        </span>
      ),
    },
    {
      label: 'THAO TÁC',
      key: 'actions',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowEditModal({ ...c })}
            className="btn-icon hover:text-amber-600"
            title="Chỉnh sửa danh mục"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => toggleCategoryStatus(c)}
            className={`btn-icon ${c.status === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
            title={c.status === 'ACTIVE' ? 'Tắt danh mục' : 'Bật lại danh mục'}
          >
            <Power size={15} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(c)}
            className="btn-icon hover:text-rose-600 text-gray-400"
            title="Xóa danh mục"
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
            Quản lý danh mục
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Cấu hình danh mục thu chi, màu sắc nhận diện và icon hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-xs py-2">
            <Download size={14} />
            <span>Xuất CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs py-2">
            <Plus size={14} />
            <span>+ Thêm danh mục</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        searchPlaceholder="Tìm kiếm tên danh mục..."
        searchKeys={['categoryName', 'code']}
        filterComponents={
          <>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="INCOME">Thu nhập</option>
              <option value="EXPENSE">Chi tiêu</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang dùng</option>
              <option value="INACTIVE">Tắt</option>
            </select>
          </>
        }
      />

      {/* Modal: Thêm danh mục mới */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm danh mục thu chi mới"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên danh mục *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Ăn uống, Tiền thưởng..."
              value={form.categoryName}
              onChange={e => setForm({ ...form, categoryName: e.target.value })}
              className="admin-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Loại danh mục</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'EXPENSE' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  form.type === 'EXPENSE'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-card border-border text-gray-600'
                }`}
              >
                Chi tiêu (Expense)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'INCOME' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  form.type === 'INCOME'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-card border-border text-gray-600'
                }`}
              >
                Thu nhập (Income)
              </button>
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Chọn Icon Emoji</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                    form.icon === ic
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-border bg-card hover:bg-surface'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Chọn Màu sắc nhận diện</label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    form.color === c ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ background: c }}
                >
                  {form.color === c && <Check size={14} className="text-white" />}
                </button>
              ))}
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
              Tạo danh mục
            </button>
          </div>
        </form>
      </Modal>
      {/* Modal: Chỉnh sửa danh mục */}
      {showEditModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(null)}
          title={`Chỉnh sửa danh mục: ${showEditModal.categoryName}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tên danh mục *</label>
              <input
                type="text"
                required
                value={showEditModal.categoryName || ''}
                onChange={e => setShowEditModal({ ...showEditModal, categoryName: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phân loại</label>
              <select
                value={showEditModal.type || 'EXPENSE'}
                onChange={e => setShowEditModal({ ...showEditModal, type: e.target.value })}
                className="admin-input"
              >
                <option value="EXPENSE">Chi tiêu (EXPENSE)</option>
                <option value="INCOME">Thu nhập (INCOME)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Chọn Icon đại diện</label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setShowEditModal({ ...showEditModal, icon: ic })}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                      showEditModal.icon === ic
                        ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                        : 'border-border bg-card hover:bg-surface'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
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

      {/* Modal: Xác nhận xóa danh mục */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Xác nhận xóa danh mục"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                Bạn có chắc chắn muốn xóa vĩnh viễn danh mục{' '}
                <strong>{showDeleteConfirm.categoryName}</strong>? Các giao dịch thuộc danh mục này có thể bị ảnh hưởng!
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
    </div>
  );
}
