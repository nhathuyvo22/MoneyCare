import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  Shield,
  Settings,
  LogOut,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

const BREADCRUMB_MAP = {
  dashboard: 'Tổng quan',
  users: 'Quản lý người dùng',
  accounts: 'Quản lý tài khoản',
  transactions: 'Quản lý giao dịch',
  categories: 'Quản lý danh mục',
  budgets: 'Quản lý ngân sách',
  'savings-goals': 'Mục tiêu tiết kiệm',
  bills: 'Quản lý hóa đơn',
  reports: 'Báo cáo và thống kê',
  'audit-logs': 'Nhật ký hoạt động',
  settings: 'Cài đặt hệ thống',
};

export default function Header({ onOpenMobile }) {
  const { adminUser, adminScreen, setAdminScreen, exitAdminMode, doLogout, globalSearch, setGlobalSearch, syncWithBackend, loading } = useAdmin();
  const currentTitle = BREADCRUMB_MAP[adminScreen] || 'Trang quản trị';
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-[68px] bg-white border-b border-border px-4 lg:px-8 flex items-center justify-between gap-4 shadow-xs">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-muted hover:bg-brand-50 hover:text-brand-500 lg:hidden"
          title="Mở menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <button onClick={() => setAdminScreen('dashboard')} className="hover:text-brand-500 font-medium transition-colors">
            Trang chủ
          </button>
          <ChevronRight size={14} className="text-border" />
          <span className="font-semibold text-brand-600" style={{ color: '#5427B8' }}>{currentTitle}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng, giao dịch, hóa đơn..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-surface border border-border focus:bg-white focus:border-brand-400 outline-none transition-all placeholder:text-muted/70"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-danger px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Switch Mode, Sync, Notification, Admin Profile */}
      <div className="flex items-center gap-2">
        {/* Switch back to Client App */}
        <button
          onClick={exitAdminMode}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors border border-brand-200"
          title="Quay lại giao diện ví & thu chi cá nhân"
          style={{ background: '#F3EEFF', color: '#5427B8', borderColor: '#E6DDFF' }}
        >
          <UserCheck size={14} />
          <span className="hidden sm:inline">Giao diện Người dùng</span>
        </button>

        {/* Sync Button */}
        <button
          onClick={syncWithBackend}
          disabled={loading.sync}
          className="btn-icon text-brand-600 hover:bg-brand-50 relative group"
          title="Đồng bộ lại dữ liệu với Backend"
        >
          <RefreshCw size={17} className={loading.sync ? 'animate-spin' : ''} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifMenu(p => !p); setShowProfileMenu(false); }}
            className="btn-icon relative"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500" />
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-gray-800">Thông báo hệ thống</span>
                <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">3 mới</span>
              </div>
              <div className="divide-y divide-border/60 text-xs">
                <div className="py-2.5 hover:bg-surface px-2 rounded-lg transition-colors cursor-pointer">
                  <div className="font-semibold text-gray-800">Cảnh báo ngân sách</div>
                  <div className="text-muted text-[11px]">Người dùng Lê Văn C đã vượt ngân sách Đi lại (115%).</div>
                  <div className="text-[10px] text-muted/60 mt-1">10 phút trước</div>
                </div>
                <div className="py-2.5 hover:bg-surface px-2 rounded-lg transition-colors cursor-pointer">
                  <div className="font-semibold text-gray-800">Hóa đơn quá hạn</div>
                  <div className="text-muted text-[11px]">Hóa đơn HD0004 (Viettel) của Phạm Thị D đã quá hạn thanh toán.</div>
                  <div className="text-[10px] text-muted/60 mt-1">1 giờ trước</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfileMenu(p => !p); setShowNotifMenu(false); }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-brand-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs text-white shadow-xs">
              {adminUser?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-gray-800 leading-tight">
                {adminUser?.fullName || 'Admin'}
              </div>
              <div className="text-[10px] font-semibold" style={{ color: '#F23891' }}>
                Super Admin
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border p-2 z-50">
              <div className="px-3 py-2 border-b border-border/60">
                <div className="text-xs font-bold text-gray-800">{adminUser?.fullName}</div>
                <div className="text-[11px] text-muted truncate">{adminUser?.email}</div>
              </div>
              <div className="py-1 text-xs">
                <button
                  onClick={() => { setAdminScreen('settings'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-brand-50 transition-colors text-left"
                >
                  <Settings size={15} />
                  <span>Cài đặt hệ thống</span>
                </button>
                <button
                  onClick={() => { exitAdminMode(); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-purple-700 hover:bg-purple-50 transition-colors text-left font-semibold"
                >
                  <UserCheck size={15} />
                  <span>Về giao diện người dùng</span>
                </button>
              </div>
              <div className="pt-1 border-t border-border/60">
                <button
                  onClick={() => { setShowProfileMenu(false); doLogout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
