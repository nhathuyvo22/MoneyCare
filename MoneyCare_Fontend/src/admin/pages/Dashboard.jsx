import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { fmtMoney } from '../utils/format';
import {
  Users,
  CreditCard,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Bảng màu cho biểu đồ danh mục
const PIE_COLORS = ['#5427B8', '#F23891', '#06B6D4', '#F59E0B', '#10B981', '#EC4899', '#6366F1', '#16A34A'];

export default function Dashboard() {
  const { users, accounts, transactions, activityLogs, categories } = useAdmin();
  const [txBarMode, setTxBarMode] = useState('count');

  // ── Thống kê tổng hợp từ dữ liệu thực ──
  const totalUsers = users.length;
  const totalAccounts = accounts.length;
  const totalTransactions = transactions.length;
  const totalTxValue = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  // ── Số liệu Income vs Expense ──
  const incomeTotal = transactions.filter(t => t.type === 'INCOME' || t.type === 'THU').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const expenseTotal = transactions.filter(t => t.type !== 'INCOME' && t.type !== 'THU').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  // ── Biểu đồ Line: nhóm theo ngày ──
  const lineData = useMemo(() => {
    const map = {};
    transactions.forEach(tx => {
      const day = (tx.transactionDate || tx.date || '').split('T')[0] || (tx.transactionDate || tx.date || '').split(' ')[0];
      if (!day) return;
      if (!map[day]) map[day] = { name: day.slice(5), income: 0, expense: 0 };
      if (tx.type === 'INCOME' || tx.type === 'THU') map[day].income += Number(tx.amount) / 1_000_000;
      else map[day].expense += Number(tx.amount) / 1_000_000;
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name)).slice(-10);
  }, [transactions]);

  // ── Biểu đồ Bar: số lượng / giá trị theo ngày ──
  const barData = useMemo(() => {
    const map = {};
    transactions.forEach(tx => {
      const day = (tx.transactionDate || tx.date || '').split('T')[0] || (tx.transactionDate || tx.date || '').split(' ')[0];
      if (!day) return;
      if (!map[day]) map[day] = { name: day.slice(5), count: 0, value: 0 };
      map[day].count += 1;
      map[day].value += Number(tx.amount) / 1_000_000;
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name)).slice(-7);
  }, [transactions]);

  // ── Biểu đồ Donut: phân bổ chi tiêu theo danh mục ──
  const pieData = useMemo(() => {
    const expense = transactions.filter(t => t.type !== 'INCOME' && t.type !== 'THU');
    const map = {};
    expense.forEach(tx => {
      const cat = tx.categoryName || 'Khác';
      map[cat] = (map[cat] || 0) + Number(tx.amount);
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map)
      .map(([name, value], i) => ({ name, value: Math.round(value / total * 100), color: PIE_COLORS[i % PIE_COLORS.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  // ── Giao dịch gần nhất ──
  const recentTx = [...transactions]
    .sort((a, b) => new Date(b.transactionDate || b.date || 0) - new Date(a.transactionDate || a.date || 0))
    .slice(0, 5);

  // ── Nhật ký hoạt động gần nhất ──
  const recentLogs = activityLogs.slice(0, 5);

  const EmptyChart = ({ label }) => (
    <div className="h-64 flex flex-col items-center justify-center text-muted gap-2">
      <BarChart2 size={32} className="opacity-30" />
      <span className="text-xs">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Tổng quan hệ thống</h2>
        <p className="text-xs text-muted mt-0.5">Báo cáo thời gian thực về người dùng, tài khoản và dòng tiền MoneyCare.</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Tổng người dùng</span>
            <div className="p-2 rounded-xl bg-purple-50 text-brand-600"><Users size={18} /></div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalUsers}</div>
          <div className="text-xs text-muted font-medium mt-1">Đăng ký trong hệ thống</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Tổng tài khoản</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><CreditCard size={18} /></div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalAccounts}</div>
          <div className="text-xs text-muted font-medium mt-1">Ví & tài khoản ngân hàng</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Tổng giao dịch</span>
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600"><ArrowLeftRight size={18} /></div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalTransactions.toLocaleString('vi-VN')}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <TrendingUp size={13} />
            <span>Thu: {fmtMoney(incomeTotal)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Tổng giá trị GD</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Wallet size={18} /></div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-brand-600 tracking-tight mt-2">{fmtMoney(totalTxValue)}</div>
          <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold mt-1">
            <TrendingDown size={13} />
            <span>Chi: {fmtMoney(expenseTotal)}</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 admin-card p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border/80 gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Thu nhập & Chi tiêu</h3>
              <p className="text-[11px] text-muted">So sánh dòng tiền theo ngày (đơn vị: triệu đồng)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Thu nhập</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Chi tiêu</span>
              </div>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full pt-4">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE5F5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#77758B' }} stroke="#EAE5F5" />
                  <YAxis tick={{ fontSize: 11, fill: '#77758B' }} stroke="#EAE5F5" />
                  <Tooltip
                    formatter={(val, name) => [`${Number(val).toFixed(1)} tr đ`, name === 'income' ? 'Thu nhập' : 'Chi tiêu']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #EAE5F5', fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="expense" stroke="#E11D48" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Chưa có dữ liệu giao dịch" />
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between pb-4 border-b border-border/80">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Giao dịch theo ngày</h3>
              <p className="text-[11px] text-muted">Mật độ phát sinh gần đây</p>
            </div>
            <div className="flex rounded-lg bg-surface p-0.5 border border-border text-[11px]">
              <button onClick={() => setTxBarMode('count')} className={`px-2 py-0.5 rounded-md font-semibold transition-all ${txBarMode === 'count' ? 'bg-card text-brand-600 shadow-sm' : 'text-muted'}`}>Số lượng</button>
              <button onClick={() => setTxBarMode('value')} className={`px-2 py-0.5 rounded-md font-semibold transition-all ${txBarMode === 'value' ? 'bg-card text-brand-600 shadow-sm' : 'text-muted'}`}>Giá trị</button>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full pt-4">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE5F5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#77758B' }} stroke="#EAE5F5" />
                  <YAxis tick={{ fontSize: 11, fill: '#77758B' }} stroke="#EAE5F5" />
                  <Tooltip
                    formatter={(val) => [txBarMode === 'count' ? `${val} GD` : `${Number(val).toFixed(1)} tr đ`, txBarMode === 'count' ? 'Số giao dịch' : 'Tổng giá trị']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #EAE5F5', fontSize: 12 }}
                  />
                  <Bar dataKey={txBarMode} fill="#5427B8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Chưa có dữ liệu" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Pie + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="admin-card p-5 flex flex-col">
          <h3 className="text-sm font-bold text-gray-900">Phân bổ chi tiêu</h3>
          <p className="text-[11px] text-muted mb-2">Tỷ trọng các danh mục chi tiêu</p>
          {pieData.length > 0 ? (
            <>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Tỷ trọng']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/80 text-xs mt-auto">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-gray-700 truncate">{item.name}</span>
                    <span className="ml-auto font-bold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyChart label="Chưa có dữ liệu chi tiêu" />
          )}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 admin-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Giao dịch gần đây</h3>
              <p className="text-[11px] text-muted">Các phát sinh thu chi mới nhất trong hệ thống</p>
            </div>
          </div>
          {recentTx.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="admin-table mt-2">
                <thead>
                  <tr>
                    <th>Mã GD</th>
                    <th>Danh mục</th>
                    <th>Số tiền</th>
                    <th>Ngày</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map(tx => (
                    <tr key={tx.id}>
                      <td className="font-mono text-xs font-semibold text-brand-600">{tx.code || `GD${String(tx.id).padStart(5,'0')}`}</td>
                      <td>{tx.categoryName || '—'}</td>
                      <td className={`font-bold ${tx.type === 'INCOME' || tx.type === 'THU' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'INCOME' || tx.type === 'THU' ? '+' : '-'}{fmtMoney(tx.amount)}
                      </td>
                      <td className="text-xs text-muted">{(tx.transactionDate || tx.date || '').split('T')[0]}</td>
                      <td>
                        <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-green' : tx.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}`}>
                          {tx.status === 'COMPLETED' ? 'Hoàn thành' : tx.status === 'PENDING' ? 'Đang xử lý' : tx.status || 'Hoàn thành'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted gap-2">
              <ArrowLeftRight size={32} className="opacity-25" />
              <span className="text-sm">Chưa có giao dịch nào trong hệ thống</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
