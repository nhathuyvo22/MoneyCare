import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  CreditCard, BarChart3, Receipt, Settings,
  TrendingUp, X, PiggyBank, Shield,
} from 'lucide-react';

const NAV = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'transactions', label: 'Giao dịch', icon: ArrowLeftRight },
  { id: 'budget', label: 'Ngân sách', icon: PieChart },
  { id: 'goals', label: 'Mục tiêu tiết kiệm', icon: Target },
  { id: 'interest', label: 'Lãi tiết kiệm ', icon: PiggyBank, badge: '8%' },
  { id: 'accounts', label: 'Tài khoản & Ví', icon: CreditCard },
  { id: 'reports', label: 'Báo cáo & Phân tích', icon: BarChart3 },
  { id: 'bills', label: 'Hóa đơn định kỳ', icon: Receipt },
  { id: 'settings', label: 'Cá nhân & Cài đặt', icon: Settings },
];

export default function Sidebar() {
  const { screen, setScreen, sidebarOpen, setSidebarOpen, isAdmin, setAppMode } = useApp();

  const go = (id) => { setScreen(id); setSidebarOpen(false); };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="sidebar-logo-text">MoneyCare</div>
            <div className="sidebar-logo-sub">Hiểu tiền. Làm chủ tương lai.</div>
          </div>
          {/* Mobile close */}
          <button
            className="icon-btn ml-auto md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Admin Switch button for admin role */}
        {isAdmin && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => { setAppMode('admin'); setSidebarOpen(false); }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #5427B8 0%, #F23891 100%)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                padding: '9px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                boxShadow: '0 2px 8px rgba(84, 39, 184, 0.25)',
              }}
            >
              <Shield size={16} />
              <span>Trang Quản trị Admin 🛡️</span>
            </button>
          </div>
        )}

        {/* Nav */}
        <div className="flex-1 py-2 overflow-y-auto">
          <div className="sidebar-section">Menu chính</div>
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`nav-item w-full text-left${screen === id ? ' active' : ''}`}
              onClick={() => go(id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={18} />
                <span>{label}</span>
              </div>
              {badge && (
                <span style={{
                  background: '#FF3366',
                  color: '#fff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer version */}
        <div className="p-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MoneyCare v1.0 • Spring Boot API</span>
        </div>
      </aside>
    </>
  );
}
