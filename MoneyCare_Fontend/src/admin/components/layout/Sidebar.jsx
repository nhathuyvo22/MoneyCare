import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  Tags,
  PieChart,
  Target,
  Receipt,
  BarChart3,
  History,
  Settings,
  LogOut,
  TrendingUp,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'users', label: 'Quản lý người dùng', icon: Users },
  { id: 'accounts', label: 'Quản lý tài khoản', icon: CreditCard },
  { id: 'transactions', label: 'Quản lý giao dịch', icon: ArrowLeftRight },
  { id: 'categories', label: 'Quản lý danh mục', icon: Tags },
  { id: 'budgets', label: 'Quản lý ngân sách', icon: PieChart },
  { id: 'savings-goals', label: 'Mục tiêu tiết kiệm', icon: Target },
  { id: 'bills', label: 'Quản lý hóa đơn', icon: Receipt },
  { id: 'reports', label: 'Báo cáo và thống kê', icon: BarChart3 },
  { id: 'audit-logs', label: 'Nhật ký hoạt động', icon: History },
  { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
];

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { adminUser, adminScreen, setAdminScreen, exitAdminMode, doLogout } = useAdmin();

  const handleNav = (id) => {
    setAdminScreen(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col justify-between text-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #3B1A8C 0%, #2A1068 100%)',
          boxShadow: '4px 0 24px rgba(42, 16, 104, 0.25)',
        }}
      >
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #5427B8 0%, #F23891 100%)' }}
            >
              <TrendingUp size={22} className="text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight leading-tight flex items-center gap-2">
                MoneyCare
                <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: '#F23891' }}>
                  Admin
                </span>
              </div>
              <div className="text-[11px] text-white/60">Quản trị hệ thống tài chính</div>
            </div>
          </div>

          {/* Switch to User Mode Button */}
          <div className="px-4 py-3">
            <button
              onClick={exitAdminMode}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-xs"
            >
              <UserCheck size={15} className="text-pink-300" />
              <span>Về giao diện Người dùng 👤</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-1 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = adminScreen === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`sidebar-link group ${active ? 'active' : ''}`}
                >
                  <Icon size={18} className="transition-transform group-hover:scale-110 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin profile & logout */}
        <div className="p-4 border-t border-white/10 bg-black/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm text-white shadow-sm flex-shrink-0">
              {adminUser?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-white truncate">
                {adminUser?.fullName || 'Admin User'}
              </div>
              <div className="text-[11px] font-semibold flex items-center gap-1" style={{ color: '#F23891' }}>
                <ShieldCheck size={12} />
                <span>Super Admin</span>
              </div>
            </div>
          </div>

          <button
            onClick={doLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
