import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const isDark = () => document.documentElement.classList.contains('dark');

export default function ReportsScreen() {
  const { transactions, categories, hideBalance, fmt, txType } = useApp();
  const [period, setPeriod] = useState('month');
  const [dark, setDark] = useState(isDark());

  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const textColor = dark ? '#A3AEC7' : '#737D96';
  const gridColor = dark ? '#303950' : '#E5E7EF';

  // Filter by period
  const now = new Date();
  const filtered = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    if (period === 'week') { const diff = (now - d) / 86400000; return diff <= 7; }
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'year')  return d.getFullYear() === now.getFullYear();
    return true;
  });

  const income  = filtered.filter(t => txType(t.type) === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => txType(t.type) === 'expense').reduce((s, t) => s + t.amount, 0);
  const saving  = income - expense;

  // Bar chart: by label
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - (5-i)); return d; });
  const barInc = months.map(m => transactions.filter(t => txType(t.type) === 'income' && new Date(t.transactionDate).getMonth() === m.getMonth()).reduce((s,t) => s+t.amount, 0));
  const barExp = months.map(m => transactions.filter(t => txType(t.type) === 'expense' && new Date(t.transactionDate).getMonth() === m.getMonth()).reduce((s,t) => s+t.amount, 0));

  const barData = {
    labels: months.map(d => `Th.${d.getMonth()+1}`),
    datasets: [
      { label: 'Thu nhập', data: barInc, backgroundColor: dark ? '#4DD4A4' : '#16A085', borderRadius: 6 },
      { label: 'Chi tiêu', data: barExp, backgroundColor: dark ? '#FF7C8A' : '#DC4444', borderRadius: 6 },
    ],
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor, callback: v => v >= 1e6 ? v/1e6+'M' : v/1e3+'K' }, grid: { color: gridColor } },
    },
  };

  // Doughnut: category expense
  const catMap = {};
  filtered.filter(t => txType(t.type) === 'expense').forEach(t => {
    const cat = categories.find(c => c.id === t.categoryId);
    const name = cat?.categoryName || 'Khác';
    catMap[name] = (catMap[name] || 0) + t.amount;
  });
  const catNames = Object.keys(catMap).sort((a,b) => catMap[b]-catMap[a]);
  const catAmts  = catNames.map(k => catMap[k]);
  const COLORS   = ['#6339DB','#DC4444','#E89B3B','#16A085','#2980B9','#8E44AD','#27AE60'];

  const doughnutData = {
    labels: catNames,
    datasets: [{ data: catAmts, backgroundColor: COLORS.slice(0, catNames.length), borderWidth: 2, borderColor: dark ? '#1B2337' : '#fff' }],
  };
  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: textColor, boxWidth: 12 } } },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Period selector */}
      <div className="card">
        <div className="card-body" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>Xem theo:</span>
          <div className="period-selector">
            {[['week','Tuần này'], ['month','Tháng này'], ['year','Năm nay'], ['all','Toàn bộ']].map(([v, l]) => (
              <button key={v} className={`period-btn${period === v ? ' active' : ''}`} onClick={() => setPeriod(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid-3">
        {[
          { label: 'Tổng thu', val: income,  color: 'var(--success)' },
          { label: 'Tổng chi', val: expense, color: 'var(--danger)'  },
          { label: 'Tiết kiệm', val: saving, color: saving >= 0 ? 'var(--primary)' : 'var(--danger)' },
        ].map(({ label, val, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{hideBalance ? '•••• đ' : fmt(val)}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Thu chi 6 tháng</span></div>
          <div className="card-body" style={{ height: 260 }}>
            <Bar data={barData} options={barOpts} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Cơ cấu chi tiêu</span></div>
          <div className="card-body" style={{ height: 260 }}>
            {catNames.length === 0 ? (
              <div className="empty-state"><div className="empty-desc">Chưa có dữ liệu chi tiêu trong kỳ này</div></div>
            ) : <Doughnut data={doughnutData} options={doughnutOpts} />}
          </div>
        </div>
      </div>

      {/* Top categories table */}
      {catNames.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Danh mục chi tiêu lớn nhất</span></div>
          <div style={{ padding: '0 20px' }}>
            {catNames.slice(0, 6).map((name, i) => {
              const pct = Math.round((catMap[name] / expense) * 100);
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < catNames.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text-primary)', marginBottom: 4 }}>{name}</div>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--danger)' }}>{hideBalance ? '••••' : fmt(catMap[name])}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
