import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/common/DataTable';
import { exportToCSV } from '../utils/format';
import { History, Download, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AuditLogs() {
  const { activityLogs } = useAdmin();
  const [resultFilter, setResultFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchResult = resultFilter === 'ALL' || log.result === resultFilter;
      const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
      return matchResult && matchAction;
    });
  }, [activityLogs, resultFilter, actionFilter]);

  const handleExportCSV = () => {
    const headers = [
      { label: 'Thời gian', key: 'timestamp' },
      { label: 'Tài khoản thực hiện', key: 'actor' },
      { label: 'Hành động', key: 'action' },
      { label: 'Đối tượng tác động', key: 'target' },
      { label: 'Kết quả', key: r => r.result === 'SUCCESS' ? 'Thành công' : 'Thất bại' },
      { label: 'Thông tin bổ sung / IP', key: 'details' },
    ];
    exportToCSV('Nhat_ky_hoat_dong_MoneyCare', headers, filteredLogs);
  };

  const columns = [
    {
      label: 'THỜI GIAN',
      key: 'timestamp',
      sortable: true,
      render: (log) => <span className="font-mono text-xs text-muted">{log.timestamp}</span>,
    },
    {
      label: 'TÀI KHOẢN THỰC HIỆN',
      key: 'actor',
      sortable: true,
      render: (log) => <span className="font-semibold text-gray-800 text-xs sm:text-sm">{log.actor}</span>,
    },
    {
      label: 'HÀNH ĐỘNG',
      key: 'action',
      sortable: true,
      render: (log) => <span className="font-bold text-gray-900 text-xs sm:text-sm">{log.action}</span>,
    },
    {
      label: 'ĐỐI TƯỢNG TÁC ĐỘNG',
      key: 'target',
      sortable: true,
      render: (log) => <span className="font-mono text-xs font-semibold text-brand-600">{log.target}</span>,
    },
    {
      label: 'KẾT QUẢ',
      key: 'result',
      render: (log) => (
        <span className={`badge ${log.result === 'SUCCESS' ? 'badge-green' : 'badge-red'}`}>
          {log.result === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
        </span>
      ),
    },
    {
      label: 'THÔNG TIN BỔ SUNG / IP',
      key: 'details',
      render: (log) => <span className="text-xs text-gray-600">{log.details || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Nhật ký hoạt động
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Lưu vết toàn bộ thao tác quản trị viên và sự kiện quan trọng trong hệ thống.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn-secondary text-xs py-2">
          <Download size={14} />
          <span>Xuất log CSV</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        searchPlaceholder="Tìm kiếm hành động, đối tượng, IP..."
        searchKeys={['action', 'target', 'actor', 'details']}
        filterComponents={
          <>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
            >
              <option value="ALL">Tất cả hành động</option>
              <option value="Thêm người dùng">Thêm người dùng</option>
              <option value="Khóa tài khoản">Khóa tài khoản</option>
              <option value="Cập nhật danh mục">Cập nhật danh mục</option>
              <option value="Tạo ngân sách">Tạo ngân sách</option>
              <option value="Đăng nhập">Đăng nhập</option>
              <option value="Xuất báo cáo">Xuất báo cáo</option>
            </select>

            <select
              value={resultFilter}
              onChange={e => setResultFilter(e.target.value)}
              className="admin-input py-1.5 px-3 text-xs w-auto font-medium"
            >
              <option value="ALL">Tất cả kết quả</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </>
        }
      />
    </div>
  );
}
