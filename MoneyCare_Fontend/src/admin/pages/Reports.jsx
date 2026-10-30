import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { fmtMoney, exportToCSV } from '../utils/format';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Scale,
  ArrowLeftRight,
  Calculator,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  MOCK_CHART_INCOME_EXPENSE,
  MOCK_EXPENSE_PIE,
  MOCK_TOP_CATEGORIES,
} from '../mocks/mockData';

export default function Reports() {
  const [period, setPeriod] = useState('Tháng'); // 'Ngày' | 'Tuần' | 'Tháng' | 'Năm'
  const { transactions } = useAdmin();

  // 5 Stat metrics
  const totalIncome = 587320000;
  const totalExpense = 452110000;
  const netSavings = totalIncome - totalExpense; // 135.210.000 đ
  const totalTxCount = 1245;
  const avgTxValue = 792500;

  const handleExportReport = () => {
    const headers = [
      { label: 'Chỉ số tài chính', key: 'metric' },
      { label: 'Giá trị', key: 'value' },
      { label: 'Kỳ báo cáo', key: () => period },
    ];
    const data = [
      { metric: 'Tổng thu nhập', value: fmtMoney(totalIncome) },
      { metric: 'Tổng chi tiêu', value: fmtMoney(totalExpense) },
      { metric: 'Chênh lệch thu chi (Thặng dư)', value: fmtMoney(netSavings) },
      { metric: 'Số lượng giao dịch', value: totalTxCount },
      { metric: 'Giá trị giao dịch trung bình', value: fmtMoney(avgTxValue) },
    ];
    exportToCSV(`Bao_cao_tai_chinh_MoneyCare_${period}`, headers, data);
  };

  return (
    <div className="space-y-6">
      {/* Header with Period Tabs & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Báo cáo và thống kê
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Phân tích tổng quan thu chi, tỷ trọng danh mục và xu hướng tài chính hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector tabs matching screenshot */}
          <div className="flex bg-surface p-1 rounded-xl border border-border text-xs font-semibold">
            {['Ngày', 'Tuần', 'Tháng', 'Năm'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === p ? 'bg-card text-brand-600 shadow-sm font-bold' : 'text-muted hover:text-gray-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button onClick={handleExportReport} className="btn-primary text-xs py-2">
            <Download size={14} />
            <span>Xuất báo cáo CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Stat Cards matching screenshot 10 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1 */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-muted text-xs font-bold uppercase tracking-wider">
            <span>Tổng thu nhập</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-emerald-600">
              +{fmtMoney(totalIncome)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              +12% so với kỳ trước
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-muted text-xs font-bold uppercase tracking-wider">
            <span>Tổng chi tiêu</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-rose-600">
              -{fmtMoney(totalExpense)}
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
              +5% so với kỳ trước
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-muted text-xs font-bold uppercase tracking-wider">
            <span>Chênh lệch thu chi</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-brand-600">
              <Scale size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-brand-600">
              {fmtMoney(netSavings)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              +18% so với kỳ trước
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-muted text-xs font-bold uppercase tracking-wider">
            <span>Số lượng giao dịch</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ArrowLeftRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-gray-900">
              {totalTxCount.toLocaleString('vi-VN')}
            </div>
            <div className="text-[11px] text-muted font-medium mt-0.5">
              Giao dịch đã xác thực
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-muted text-xs font-bold uppercase tracking-wider">
            <span>Giá trị giao dịch TB</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Calculator size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-gray-900">
              {fmtMoney(avgTxValue)}
            </div>
            <div className="text-[11px] text-muted font-medium mt-0.5">
              Bình quân mỗi giao dịch
            </div>
          </div>
        </div>
      </div>

      {/* 3 Analytics Visualizations matching screenshot 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Xu hướng thu chi (Line Chart) */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Xu hướng thu chi</h3>
              <p className="text-[11px] text-muted">Diễn biến dòng tiền theo thời gian</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Thu
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Chi
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_CHART_INCOME_EXPENSE} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE5F5" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#77758B' }} stroke="#EAE5F5" />
                <YAxis tick={{ fontSize: 10, fill: '#77758B' }} stroke="#EAE5F5" />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                <Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#E11D48" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Phân bổ chi tiêu (Donut Chart) */}
        <div className="admin-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Phân bổ chi tiêu</h3>
            <p className="text-[11px] text-muted">Cơ cấu nhóm chi tiêu chính</p>
          </div>

          <div className="h-48 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_EXPENSE_PIE}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {MOCK_EXPENSE_PIE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Tỷ trọng']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {MOCK_EXPENSE_PIE.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Nhóm chi tiêu cao nhất (Bar list) */}
        <div className="admin-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Nhóm chi tiêu cao nhất</h3>
            <p className="text-[11px] text-muted">Top 5 danh mục có giá trị giao dịch lớn nhất</p>
          </div>

          <div className="space-y-3.5 my-auto py-2">
            {MOCK_TOP_CATEGORIES.map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-600">{fmtMoney(cat.amount)}</span>
                    <span className="text-muted text-[11px] font-semibold">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="progress-track" style={{ height: 6 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${cat.percentage}%`, background: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border/80 text-[11px] text-muted flex items-center justify-between">
            <span>Dữ liệu thống kê tháng 4/2025</span>
            <span className="font-bold text-brand-600">Tổng: {fmtMoney(totalExpense)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
