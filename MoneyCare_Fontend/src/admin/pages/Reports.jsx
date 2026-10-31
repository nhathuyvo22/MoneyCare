import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { fmtMoney, exportToCSV } from '../utils/format';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Scale,
  ArrowLeftRight,
  Calculator,
  BarChart2,
  PieChart as PieChartIcon,
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

const PALETTE = [
  '#5427B8', // Tím chủ đạo
  '#F23891', // Hồng điểm nhấn
  '#06B6D4', // Cyan
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
];

function EmptyChart({ label }) {
  return (
    <div className="h-48 flex flex-col items-center justify-center text-muted gap-2 text-center">
      <BarChart2 size={32} className="opacity-30 text-brand-400" />
      <span className="text-xs text-muted/80">{label}</span>
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState('Tháng'); // 'Ngày' | 'Tuần' | 'Tháng' | 'Năm'
  const { transactions, categories } = useAdmin();

  // Tạo map tra cứu tên danh mục nhanh
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(c => {
      if (c.id) map[c.id] = c.categoryName;
    });
    return map;
  }, [categories]);

  // Chuẩn hóa tên danh mục cho từng giao dịch
  const resolvedTransactions = useMemo(() => {
    return transactions.map(tx => ({
      ...tx,
      categoryName: categoryMap[tx.categoryId] || tx.categoryName || 'Khác',
      dateObj: tx.transactionDate ? new Date(tx.transactionDate) : new Date(),
    }));
  }, [transactions, categoryMap]);

  // 1. Thống kê 5 chỉ số tài chính tổng hợp từ giao dịch thực
  const totalIncome = useMemo(() => {
    return resolvedTransactions
      .filter(t => t.type === 'INCOME' || t.type === 'THU')
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  }, [resolvedTransactions]);

  const totalExpense = useMemo(() => {
    return resolvedTransactions
      .filter(t => t.type !== 'INCOME' && t.type !== 'THU')
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  }, [resolvedTransactions]);

  const netSavings = totalIncome - totalExpense;
  const totalTxCount = resolvedTransactions.length;
  const avgTxValue = totalTxCount > 0 ? Math.round((totalIncome + totalExpense) / totalTxCount) : 0;

  // 2. Nhóm dữ liệu cho Biểu đồ Đường (Xu hướng thu chi) theo Tab Thời gian
  const trendChartData = useMemo(() => {
    if (resolvedTransactions.length === 0) return [];

    const map = {};

    resolvedTransactions.forEach(tx => {
      const d = tx.dateObj;
      let key = '';

      if (period === 'Ngày') {
        // Nhóm theo ngày: DD/MM
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        key = `${day}/${month}`;
      } else if (period === 'Tuần') {
        // Nhóm theo tuần trong tháng
        const weekNum = Math.ceil(d.getDate() / 7);
        key = `Tuần ${weekNum} (T${d.getMonth() + 1})`;
      } else if (period === 'Tháng') {
        // Nhóm theo tháng: Tháng M
        key = `Tháng ${d.getMonth() + 1}`;
      } else {
        // Nhóm theo năm: YYYY
        key = `Năm ${d.getFullYear()}`;
      }

      if (!map[key]) {
        map[key] = { name: key, income: 0, expense: 0, rawDate: d.getTime() };
      }

      const amt = Number(tx.amount) || 0;
      if (tx.type === 'INCOME' || tx.type === 'THU') {
        map[key].income += amt;
      } else {
        map[key].expense += amt;
      }
    });

    // Sắp xếp dữ liệu theo thứ tự thời gian
    const result = Object.values(map).sort((a, b) => a.rawDate - b.rawDate);
    return result.slice(-12); // Lấy tối đa 12 điểm gần nhất
  }, [resolvedTransactions, period]);

  // 3. Nhóm dữ liệu cho Biểu đồ Tròn (Phân bổ chi tiêu) & Top 5 Danh mục
  const expenseStats = useMemo(() => {
    const expenseTx = resolvedTransactions.filter(t => t.type !== 'INCOME' && t.type !== 'THU');
    const catMap = {};

    expenseTx.forEach(tx => {
      const cat = tx.categoryName && tx.categoryName !== '—' ? tx.categoryName : 'Khác';
      catMap[cat] = (catMap[cat] || 0) + (Number(tx.amount) || 0);
    });

    const sumExp = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;

    // Danh sách tất cả danh mục đã sắp xếp giảm dần theo số tiền
    const sorted = Object.entries(catMap)
      .map(([name, amount], idx) => {
        const percentage = Math.round((amount / sumExp) * 1000) / 10;
        return {
          name,
          amount,
          percentage,
          color: PALETTE[idx % PALETTE.length],
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      total: sumExp,
      categories: sorted,
      pieData: sorted.slice(0, 6), // Top 6 cho biểu đồ tròn
      top5: sorted.slice(0, 5),    // Top 5 cho danh sách tiến trình
    };
  }, [resolvedTransactions]);

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
          {/* Period selector tabs */}
          <div className="flex bg-surface p-1 rounded-xl border border-border text-xs font-semibold">
            {['Ngày', 'Tuần', 'Tháng', 'Năm'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  period === p ? 'bg-card text-brand-600 shadow-sm font-bold' : 'text-muted hover:text-gray-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button onClick={handleExportReport} className="btn-primary text-xs py-2 cursor-pointer">
            <Download size={14} />
            <span>Xuất báo cáo CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Stat Cards */}
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
              Từ {resolvedTransactions.filter(t => t.type === 'INCOME' || t.type === 'THU').length} GD thu nhập
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
              Từ {resolvedTransactions.filter(t => t.type !== 'INCOME' && t.type !== 'THU').length} GD chi tiêu
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
              {netSavings >= 0 ? `+${fmtMoney(netSavings)}` : `-${fmtMoney(Math.abs(netSavings))}`}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {netSavings >= 0 ? 'Thặng dư ngân sách' : 'Thâm hụt ngân sách'}
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
              Giao dịch toàn hệ thống
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

      {/* 3 Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Xu hướng thu chi (Line Chart) */}
        <div className="admin-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Xu hướng thu chi</h3>
              <p className="text-[11px] text-muted">Diễn biến dòng tiền theo {period.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Thu
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Chi
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE5F5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#77758B' }} stroke="#EAE5F5" />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#77758B' }}
                    stroke="#EAE5F5"
                    tickFormatter={(val) => val >= 1_000_000 ? `${(val / 1_000_000).toFixed(0)}Tr` : val >= 1_000 ? `${(val / 1_000).toFixed(0)}k` : val}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #EAE5F5', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                    formatter={(val, name) => [fmtMoney(val), name === 'income' ? 'Thu nhập' : 'Chi tiêu']}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Thu nhập"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10B981' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Chi tiêu"
                    stroke="#E11D48"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#E11D48' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Chưa có dữ liệu giao dịch trong kỳ này" />
            )}
          </div>
        </div>

        {/* 2. Phân bổ chi tiêu (Pie / Donut Chart) */}
        <div className="admin-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Phân bổ chi tiêu</h3>
            <p className="text-[11px] text-muted">Cơ cấu nhóm chi tiêu theo danh mục</p>
          </div>

          <div className="h-48 w-full my-1">
            {expenseStats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseStats.pieData}
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="name"
                  >
                    {expenseStats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${fmtMoney(val)} (${item?.payload?.percentage || 0}%)`,
                      name,
                    ]}
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #EAE5F5' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Chưa có chi tiêu nào được ghi nhận" />
            )}
          </div>

          <div className="space-y-1.5 text-xs max-h-36 overflow-y-auto pr-1">
            {expenseStats.pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-gray-700 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 flex-shrink-0 ml-2">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Nhóm chi tiêu cao nhất (Top 5 Progress bar) */}
        <div className="admin-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Nhóm chi tiêu cao nhất</h3>
            <p className="text-[11px] text-muted">Top 5 danh mục có giá trị giao dịch lớn nhất</p>
          </div>

          <div className="space-y-3.5 my-auto py-2">
            {expenseStats.top5.length > 0 ? (
              expenseStats.top5.map(cat => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-brand-600" style={{ color: '#5427B8' }}>
                        {fmtMoney(cat.amount)}
                      </span>
                      <span className="text-muted text-[11px] font-semibold">({cat.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full overflow-hidden" style={{ height: 7 }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(cat.percentage, 100)}%`, background: cat.color }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyChart label="Chưa có dữ liệu danh mục chi tiêu" />
            )}
          </div>

          <div className="pt-2 border-t border-border/80 text-[11px] text-muted flex items-center justify-between">
            <span>Dữ liệu thống kê hệ thống</span>
            <span className="font-bold text-brand-600" style={{ color: '#5427B8' }}>
              Tổng chi: {fmtMoney(totalExpense)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
