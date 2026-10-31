import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { fmtDateTime, fmtMoney, exportToCSV } from '../utils/format';
import {
  ArrowLeftRight,
  Download,
  Eye,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';

export default function Transactions() {
  const { transactions, deleteTransaction } = useAdmin();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteTransaction(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  // Thống kê động từ dữ liệu thật
  const totalTxCount = transactions.length;
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' || t.type === 'THU')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE' || t.type === 'CHI')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchType = typeFilter === 'ALL' || tx.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || (tx.status || 'COMPLETED') === statusFilter;
      return matchType && matchStatus;
    });
  }, [transactions, typeFilter, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      { label: 'Mã giao dịch', key: 'code' },
      { label: 'Người dùng', key: 'userName' },
      { label: 'Loại', key: r => r.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu' },
      { label: 'Danh mục', key: 'categoryName' },
      { label: 'Số tiền', key: 'amount' },
      { label: 'Thời gian', key: r => fmtDateTime(r.transactionDate) },
      { label: 'Phương thức thanh toán', key: 'paymentMethod' },
      { label: 'Trạng thái', key: r => r.status === 'COMPLETED' ? 'Hoàn thành' : r.status === 'PENDING' ? 'Đang xử lý' : 'Thất bại' },
    ];
    exportToCSV('Danh_sach_giao_dich_MoneyCare', headers, filteredTransactions);
  };

  const columns = [
    {
      label: 'MÃ GD',
      key: 'code',
      sortable: true,
      render: (tx) => <span className="font-mono text-xs font-bold text-brand-600">{tx.code}</span>,
    },
    {
      label: 'NGƯỜI DÙNG',
      key: 'userName',
      sortable: true,
      render: (tx) => <span className="font-semibold text-gray-900 text-xs sm:text-sm">{tx.userName}</span>,
    },
    {
      label: 'LOẠI',
      key: 'type',
      sortable: true,
      render: (tx) => (
        <span className={`badge ${tx.type === 'INCOME' ? 'badge-green' : 'badge-red'}`}>
          {tx.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
        </span>
      ),
    },
    {
      label: 'DANH MỤC',
      key: 'categoryName',
      sortable: true,
      render: (tx) => <span className="text-xs font-medium text-gray-700">{tx.categoryName}</span>,
    },
    {
      label: 'SỐ TIỀN',
      key: 'amount',
      sortable: true,
      render: (tx) => (
        <span className={`font-extrabold text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {tx.type === 'INCOME' ? '+' : '-'}{fmtMoney(tx.amount)}
        </span>
      ),
    },
    {
      label: 'NGÀY GIỜ',
      key: 'transactionDate',
      sortable: true,
      render: (tx) => <span className="text-xs text-muted font-mono">{fmtDateTime(tx.transactionDate)}</span>,
    },
    {
      label: 'PHƯƠNG THỨC',
      key: 'paymentMethod',
      render: (tx) => <span className="text-xs font-medium text-gray-600">{tx.paymentMethod}</span>,
    },
    {
      label: 'TRẠNG THÁI',
      key: 'status',
      render: (tx) => {
        const st = tx.status || 'COMPLETED';
        if (st === 'COMPLETED') return <span className="badge badge-green">Hoàn thành</span>;
        if (st === 'PENDING') return <span className="badge badge-yellow">Đang xử lý</span>;
        return <span className="badge badge-red">Thất bại</span>;
      },
    },
    {
      label: 'THAO TÁC',
      key: 'actions',
      render: (tx) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedTx(tx)}
            className="btn-icon hover:text-brand-600"
            title="Xem chi tiết giao dịch"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(tx)}
            className="btn-icon hover:text-rose-600 text-gray-400"
            title="Xóa giao dịch"
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
            Quản lý giao dịch
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Lịch sử toàn bộ dòng tiền, thu chi và biến động số dư trong hệ thống.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn-secondary text-xs py-2">
          <Download size={14} />
          <span>Xuất CSV</span>
        </button>
      </div>

      {/* 3 Top Stat Cards tính toán động từ CSDL thật */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-4 flex items-center justify-between border-l-4 border-brand-500">
          <div>
            <span className="text-xs text-muted font-medium block">Tổng giao dịch</span>
            <span className="text-xl font-black text-gray-900 mt-1 block">
              {totalTxCount.toLocaleString('vi-VN')} GD
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
            <ArrowLeftRight size={20} />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between border-l-4 border-emerald-500">
          <div>
            <span className="text-xs text-muted font-medium block">Tổng thu nhập</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">
              +{fmtMoney(totalIncome)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between border-l-4 border-rose-500">
          <div>
            <span className="text-xs text-muted font-medium block">Tổng chi tiêu</span>
            <span className="text-xl font-black text-rose-600 mt-1 block">
              -{fmtMoney(totalExpense)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <TrendingDown size={20} />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        searchPlaceholder="Tìm kiếm mã GD, người dùng, danh mục..."
        searchKeys={['code', 'userName', 'categoryName', 'paymentMethod']}
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
              <option value="COMPLETED">Hoàn thành</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </>
        }
      />

      {/* Modal: Chi tiết giao dịch */}
      {selectedTx && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTx(null)}
          title={`Chi tiết giao dịch: ${selectedTx.code}`}
        >
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl flex items-center justify-between ${
              selectedTx.type === 'INCOME' ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'
            }`}>
              <div>
                <span className="text-xs text-muted block">Số tiền giao dịch:</span>
                <span className={`text-2xl font-black ${selectedTx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedTx.type === 'INCOME' ? '+' : '-'}{fmtMoney(selectedTx.amount)}
                </span>
              </div>
              <span className={`badge ${selectedTx.type === 'INCOME' ? 'badge-green' : 'badge-red'}`}>
                {selectedTx.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Người thực hiện:</span>
                <span className="font-semibold text-gray-900">{selectedTx.userName}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Danh mục:</span>
                <span className="font-semibold text-gray-900">{selectedTx.categoryName}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Phương thức thanh toán:</span>
                <span className="font-semibold text-gray-900">{selectedTx.paymentMethod}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-muted block mb-0.5">Thời gian thực hiện:</span>
                <span className="font-mono text-gray-900">{fmtDateTime(selectedTx.transactionDate)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button onClick={() => setSelectedTx(null)} className="btn-secondary text-xs">
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Modal: Xác nhận xóa giao dịch */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Xác nhận xóa giao dịch"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                Bạn có chắc chắn muốn xóa vĩnh viễn giao dịch{' '}
                <strong>{showDeleteConfirm.code}</strong> ({fmtMoney(showDeleteConfirm.amount)}) của người dùng {showDeleteConfirm.userName}?
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary text-xs">
                Hủy bỏ
              </button>
              <button onClick={handleConfirmDelete} className="btn-danger text-xs">
                Xóa giao dịch
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
