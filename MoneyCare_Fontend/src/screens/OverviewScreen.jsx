import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp, TrendingDown, Wallet, DollarSign,
  ArrowRight, AlertTriangle, Target, Receipt, Zap,
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// helper to detect dark mode
const isDark = () => document.documentElement.classList.contains('dark');

function StatCard({ label, value, icon: Icon, iconBg, color, hideBalance, fmt }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || 'var(--text-primary)' }}>
        {hideBalance ? '•••••• đ' : fmt(value)}
      </div>
      <div className="stat-icon-bg" style={{ background: iconBg }}><Icon size={22} style={{ opacity: 1, color: iconBg }} /></div>
    </div>
  );
}

export default function OverviewScreen() {
  const {
    totalNetWorth, monthlyIncome, monthlyExpense, remaining,
    transactions, accounts, budgets, savingsGoals, bills,
    hideBalance, fmt, setScreen, txType,
    categories,
  } = useApp();

  const [dark, setDark] = useState(isDark());
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const textColor   = dark ? '#A3AEC7' : '#737D96';
  const gridColor   = dark ? '#303950' : '#E5E7EF';

  // --- Chart: monthly bar (last 6 months) ---
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return d;
  });

  const incomeByMonth  = months.map(m =>
    transactions.filter(t => txType(t.type) === 'income' && new Date(t.transactionDate).getMonth() === m.getMonth()).reduce((s, t) => s + t.amount, 0)
  );
  const expenseByMonth = months.map(m =>
    transactions.filter(t => txType(t.type) === 'expense' && new Date(t.transactionDate).getMonth() === m.getMonth()).reduce((s, t) => s + t.amount, 0)
  );

  const barData = {
    labels: months.map(d => `Th.${d.getMonth() + 1}`),
    datasets: [
      { label: 'Thu nhập',  data: incomeByMonth,  backgroundColor: dark ? '#4DD4A4' : '#16A085', borderRadius: 6 },
      { label: 'Chi tiêu',  data: expenseByMonth, backgroundColor: dark ? '#FF7C8A' : '#DC4444', borderRadius: 6 },
    ],
  };

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: textColor, font: { size: 12 } } } },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor, callback: v => (v >= 1e6 ? v/1e6 + 'M' : v/1e3 + 'K') }, grid: { color: gridColor } },
    },
  };

  // --- Chart: category doughnut ---
  const expTx = transactions.filter(t => txType(t.type) === 'expense');
  const catMap = {};
  expTx.forEach(t => {
    const cat = categories.find(c => c.id === t.categoryId);
    const name = cat?.categoryName || 'Khác';
    catMap[name] = (catMap[name] || 0) + t.amount;
  });
  const catNames = Object.keys(catMap);
  const catAmts  = catNames.map(k => catMap[k]);
  const PIE_COLORS = ['#6339DB','#DC4444','#E89B3B','#16A085','#2980B9','#8E44AD','#27AE60','#E74C3C'];

  const doughnutData = {
    labels: catNames,
    datasets: [{ data: catAmts, backgroundColor: PIE_COLORS.slice(0, catNames.length), borderWidth: 2, borderColor: dark ? '#1B2337' : '#fff' }],
  };
  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12, font: { size: 11 } } },
    },
  };

  // recent 5 transactions
  const recent = [...transactions].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)).slice(0, 5);

  // budgets spent (mock compute from transactions)
  const budgetWithSpent = budgets.map(b => {
    const spent = transactions
      .filter(t => t.categoryId === b.categoryId && txType(t.type) === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const pct = b.limitAmount ? Math.min(100, Math.round((spent / b.limitAmount) * 100)) : 0;
    return { ...b, spent, pct };
  });

  // pending bills
  const pendingBills = bills.filter(b => b.status === 'PENDING').slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Greeting */}
      <div>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
          Chào bạn! 👋 Tài chính tháng này đang ổn định.
        </h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Hôm nay, {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard label="Tổng tài sản"   value={totalNetWorth}   icon={Wallet}      iconBg="var(--primary)"  color="var(--primary)" hideBalance={hideBalance} fmt={fmt} />
        <StatCard label="Tổng thu"       value={monthlyIncome}   icon={TrendingUp}   iconBg="var(--success)"  color="var(--success)" hideBalance={hideBalance} fmt={fmt} />
        <StatCard label="Tổng chi"       value={monthlyExpense}  icon={TrendingDown} iconBg="var(--danger)"   color="var(--danger)"  hideBalance={hideBalance} fmt={fmt} />
        <StatCard label="Số dư còn lại"  value={remaining}       icon={DollarSign}   iconBg="var(--warning)"  color={remaining >= 0 ? 'var(--text-primary)' : 'var(--danger)'} hideBalance={hideBalance} fmt={fmt} />
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Thu chi 6 tháng gần đây</span>
          </div>
          <div className="card-body" style={{ height: 220 }}>
            {transactions.length === 0 ? (
              <div className="empty-state"><TrendingUp size={32} className="empty-icon" /><div className="empty-desc">Chưa có dữ liệu giao dịch</div></div>
            ) : <Bar data={barData} options={barOpts} />}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Cơ cấu chi tiêu theo danh mục</span>
          </div>
          <div className="card-body" style={{ height: 220 }}>
            {catNames.length === 0 ? (
              <div className="empty-state"><DollarSign size={32} className="empty-icon" /><div className="empty-desc">Chưa có chi tiêu nào</div></div>
            ) : <Doughnut data={doughnutData} options={doughnutOpts} />}
          </div>
        </div>
      </div>

      {/* Recent Transactions + Budget Progress */}
      <div className="grid-2">
        {/* Recent transactions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Giao dịch gần đây</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen('transactions')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Xem tất cả <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body" style={{ padding: '0 20px' }}>
            {recent.length === 0 ? (
              <div className="empty-state">
                <Receipt size={32} className="empty-icon" />
                <div className="empty-title">Chưa có giao dịch nào</div>
                <div className="empty-desc">Bạn chưa có giao dịch nào. Hãy ghi lại khoản thu hoặc chi đầu tiên!</div>
              </div>
            ) : recent.map(tx => {
              const inc = txType(tx.type) === 'income';
              return (
                <div key={tx.id} className="tx-item">
                  <div className="tx-icon" style={{ background: inc ? 'var(--success-light)' : 'var(--danger-light)', color: inc ? 'var(--success)' : 'var(--danger)' }}>
                    {inc ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tx-name truncate">{tx.title}</div>
                    <div className="tx-meta">{new Date(tx.transactionDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div className={`tx-amount ${inc ? 'tx-income' : 'tx-expense'}`}>
                    {hideBalance ? '••••••' : `${inc ? '+' : '-'}${fmt(tx.amount)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget progress */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tiến độ ngân sách</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen('budget')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Quản lý <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {budgetWithSpent.length === 0 ? (
              <div className="empty-state">
                <Target size={32} className="empty-icon" />
                <div className="empty-desc">Chưa có ngân sách. Hãy tạo ngân sách đầu tiên!</div>
              </div>
            ) : budgetWithSpent.slice(0, 4).map(b => {
              const color = b.pct >= 100 ? 'var(--danger)' : b.pct >= 80 ? 'var(--warning)' : 'var(--success)';
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>{b.budgetName}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {hideBalance ? '••••' : fmt(b.spent)} / {hideBalance ? '••••' : fmt(b.limitAmount)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${b.pct}%`, background: color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span style={{ fontSize: '0.72rem', color }}>{b.pct}%</span>
                    {b.pct >= 90 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <AlertTriangle size={11} /> {b.pct >= 100 ? 'Đã vượt hạn mức!' : 'Gần hết hạn mức!'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Mục tiêu tiết kiệm</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setScreen('goals')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Xem tất cả <ArrowRight size={13} />
          </button>
        </div>
        <div className="card-body">
          {savingsGoals.length === 0 ? (
            <div className="empty-state">
              <Target size={32} className="empty-icon" />
              <div className="empty-desc">Chưa có mục tiêu tiết kiệm nào.</div>
            </div>
          ) : (
            <div className="grid-3">
              {savingsGoals.slice(0, 3).map(g => {
                const pct = g.targetAmount ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                return (
                  <div key={g.id} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 16, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.87rem', color: 'var(--text-primary)', marginBottom: 8 }}>{g.goalName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                      {hideBalance ? '••••' : fmt(g.currentAmount)} / {hideBalance ? '••••' : fmt(g.targetAmount)}
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--success)' : 'var(--primary)' }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>{pct}% hoàn thành</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming bills */}
      {pendingBills.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hóa đơn sắp đến hạn</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen('bills')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Xem tất cả <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingBills.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{b.billName}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Đến hạn: {new Date(b.dueDate).toLocaleDateString('vi-VN')}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '0.9rem' }}>
                  {hideBalance ? '••••' : fmt(b.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
