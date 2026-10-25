import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  CreditCard, BarChart3, Receipt, Settings,
  TrendingUp, X,
} from 'lucide-react';

const NAV = [
  { id: 'overview',      label: 'Tổng quan',           icon: LayoutDashboard },
  { id: 'transactions',  label: 'Giao dịch',            icon: ArrowLeftRight  },
  { id: 'budget',        label: 'Ngân sách',            icon: PieChart        },
  { id: 'goals',         label: 'Mục tiêu tiết kiệm',  icon: Target          },
  { id: 'accounts',      label: 'Tài khoản & Ví',      icon: CreditCard      },
  { id: 'reports',       label: 'Báo cáo & Phân tích', icon: BarChart3       },
  { id: 'bills',         label: 'Hóa đơn định kỳ',     icon: Receipt         },
  { id: 'settings',      label: 'Cá nhân & Cài đặt',   icon: Settings        },
];

export default function Sidebar() {
  const { screen, setScreen, sidebarOpen, setSidebarOpen } = useApp();

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

        {/* Nav */}
        <div className="flex-1 py-2 overflow-y-auto">
          <div className="sidebar-section">Menu chính</div>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item w-full text-left${screen === id ? ' active' : ''}`}
              onClick={() => go(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
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
