import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { fmtMoney, fmtDate, exportToCSV } from '../utils/format';
import { Receipt, Plus, Download, CheckCircle, Eye, AlertCircle, Trash2, AlertTriangle } from 'lucide-react';

export default function Bills() {
  const { bills, addBill, markBillPaid, deleteBill, users } = useAdmin();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetail, setShowDetail] = useState(null);

  const [form, setForm] = useState({
    name: '',
    userId: users[0]?.id || 1,
    provider: 'Điện lực EVN',
    amount: '',
    dueDate: '',
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(String(form.amount).replace(/\D/g, ''));
    if (!amt || amt <= 0) return;

    const payload = {
      name: form.name,
      userId: Number(form.userId) || users[0]?.id || 1,
      expectedAmount: amt,
      description: form.provider,
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: form.dueDate || null,
      status: 'ACTIVE',
    };

    const ok = await addBill(payload);
    if (ok) {
      setShowAddModal(false);
      setForm({
        name: '',
        userId: users[0]?.id || 1,
        provider: 'Điện lực EVN',
        amount: '',
        dueDate: '',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteBill(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchProvider = providerFilter === 'ALL' || b.provider === providerFilter;
      return matchStatus && matchProvider;
    });
  }, [bills, statusFilter, providerFilter]);

  const handleExportCSV = () => {
    const headers = [
      { label: 'Mã hóa đơn', key: 'code' },
      { label: 'Người dùng', key: 'userName' },
      { label: 'Tên hóa đơn', key: 'name' },
      { label: 'Nhà cung cấp', key: 'provider' },
      { label: 'Số tiền', key: 'amount' },
      { label: 'Hạn thanh toán', key: r => fmtDate(r.dueDate) },
      { label: 'Ngày thanh toán', key: r => fmtDate(r.paidDate) },
      { label: 'Trạng thái', key: r => r.status === 'PAID' ? 'Đã thanh toán' : r.status === 'PENDING' ? 'Chờ thanh toán' : r.status === 'UPCOMING' ? 'Sắp đến hạn' : 'Quá hạn' },
    ];
    exportToCSV('Danh_sach_hoa_don_MoneyCare', headers, filteredBills);
  };

  const getStatusBadge = (status) => {
    if (status === 'PAID') return <span className="badge badge-green">Đã thanh toán</span>;
    if (status === 'PENDING') return <span className="badge badge-gray">Chờ thanh toán</span>;
    if (status === 'UPCOMING') return <span className="badge badge-yellow">Sắp đến hạn</span>;
    return <span className="badge badge-red">Quá hạn</span>;
  };

  const columns = [
    {
      label: 'MÃ HĐ',
      key: 'code',
      sortable: true,
      render: (b) => <span className="font-mono text-xs font-bold text-brand-600">{b.code}</span>,
    },
    {
      label: 'NGƯỜI DÙNG',
      key: 'userName',
      sortable: true,
      render: (b) => <span className="font-semibold text-gray-900 text-xs sm:text-sm">{b.userName}</span>,
    },
    {
      label: 'TÊN HÓA ĐƠN',
      key: 'name',
      sortable: true,
      render: (b) => <span className="font-bold text-gray-800 text-xs sm:text-sm">{b.name}</span>,
    },
    {
      label: 'NHÀ CUNG CẤP',
      key: 'provider',
      sortable: true,
      render: (b) => <span className="text-xs font-medium text-gray-600">{b.provider}</span>,
    },
    {
      label: 'SỐ TIỀN',
      key: 'amount',
      sortable: true,
      render: (b) => <span className="font-extrabold text-brand-600 text-xs sm:text-sm">{fmtMoney(b.amount)}</span>,
    },
    {
      label: 'HẠN TT',
      key: 'dueDate',
      sortable: true,
      render: (b) => <span className="text-xs text-muted font-mono">{fmtDate(b.dueDate)}</span>,
    },
    {
      label: 'NGÀY TT',
      key: 'paidDate',
      sortable: true,
      render: (b) => <span className="text-xs text-muted font-mono">{b.paidDate ? fmtDate(b.paidDate) : '—'}</span>,
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
            title="Xem chi tiết hóa đơn"
          >
            <Eye size={15} />
          </button>
          {b.status !== 'PAID' && (
            <button
              onClick={() => markBillPaid(b)}
              className="btn-icon text-emerald-600 hover:bg-emerald-50"
              title="Đánh dấu đã thanh toán"
            >
              <CheckCircle size={15} />
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(b)}
            className="btn-icon hover:text-rose-600 text-gray-400"
            title="Xóa hóa đơn"
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
            Quản lý hóa đơn
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Theo dõi hóa đơn định kỳ, tiền điện nước, internet và cảnh báo đến hạn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-xs py-2">
            <Download size={14} />
            <span>Xuất CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs py-2">
            <Plus size={14} />
            <span>+ Thêm hóa đơn</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredBills}
        searchPlaceholder="Tìm kiếm tên hóa đơn, người dùng, nhà cung cấp..."
        searchKeys={['name', 'userName', 'provider', 'code']}
        filterComponents={
          <>
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
            >
              <option value="ALL">Tất cả nhà cung cấp</option>
              <option value="Điện lực EVN">Điện lực EVN</option>
              <option value="Cấp nước Sawaco">Cấp nước Sawaco</option>
              <option value="VNPT Telecom">VNPT Telecom</option>
              <option value="Viettel Telecom">Viettel Telecom</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="UPCOMING">Sắp đến hạn</option>
              <option value="OVERDUE">Quá hạn</option>
            </select>
          </>
        }
      />

      {/* Modal: Thêm hóa đơn mới */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm hóa đơn định kỳ mới"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên hóa đơn *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Tiền điện tháng 5..."
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
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
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nhà cung cấp</label>
              <select
                value={form.provider}
                onChange={e => setForm({ ...form, provider: e.target.value })}
                className="admin-input"
              >
                <option value="Điện lực EVN">Điện lực EVN</option>
                <option value="Cấp nước Sawaco">Cấp nước Sawaco</option>
                <option value="VNPT Telecom">VNPT Telecom</option>
                <option value="Viettel Telecom">Viettel Telecom</option>
                <option value="BQL Tòa nhà">BQL Tòa nhà</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số tiền dự kiến (VNĐ) *</label>
              <input
                type="text"
                required
                placeholder="500.000 đ"
                value={form.amount ? Number(form.amount).toLocaleString('vi-VN') : ''}
                onChange={e => setForm({ ...form, amount: e.target.value.replace(/\D/g, '') })}
                className="admin-input font-bold text-brand-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hạn thanh toán *</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="admin-input"
              />
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
              Tạo hóa đơn
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Chi tiết hóa đơn */}
      {showDetail && (
        <Modal
          isOpen={true}
          onClose={() => setShowDetail(null)}
          title={`Chi tiết: ${showDetail.name}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted block">Số tiền cần thanh toán:</span>
                <span className="text-2xl font-black text-brand-600">
                  {fmtMoney(showDetail.amount)}
                </span>
              </div>
              {getStatusBadge(showDetail.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Mã hóa đơn:</span>
                <span className="font-mono font-bold text-gray-900">{showDetail.code}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Khách hàng:</span>
                <span className="font-semibold text-gray-900">{showDetail.userName}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Nhà cung cấp:</span>
                <span className="font-semibold text-gray-900">{showDetail.provider}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Hạn thanh toán:</span>
                <span className="font-mono font-semibold text-gray-900">{fmtDate(showDetail.dueDate)}</span>
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
      {/* Modal: Xác nhận xóa hóa đơn */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Xác nhận xóa hóa đơn"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                Bạn có chắc chắn muốn xóa hóa đơn{' '}
                <strong>{showDeleteConfirm.name}</strong> ({showDeleteConfirm.code}) của người dùng {showDeleteConfirm.userName}?
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary text-xs">
                Hủy bỏ
              </button>
              <button onClick={handleConfirmDelete} className="btn-danger text-xs">
                Xóa hóa đơn
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
