import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu, Search, Eye, EyeOff, Bell, Sun, Moon, Laptop,
  Plus, ChevronDown, LogOut, Settings, User,
  LogIn, UserPlus, Check,
} from 'lucide-react';

const SCREENS = [
  { id: 'overview',     label: 'Tổng quan'          },
  { id: 'transactions', label: 'Giao dịch'           },
  { id: 'budget',       label: 'Ngân sách'           },
  { id: 'goals',        label: 'Mục tiêu tiết kiệm' },
  { id: 'accounts',     label: 'Tài khoản & Ví'     },
  { id: 'reports',      label: 'Báo cáo'             },
  { id: 'bills',        label: 'Hóa đơn'             },
  { id: 'settings',     label: 'Cài đặt'             },
];

const TITLE = {
  overview:     'Tổng quan tài chính',
  transactions: 'Lịch sử giao dịch',
  budget:       'Quản lý ngân sách',
  goals:        'Mục tiêu tiết kiệm',
  accounts:     'Tài khoản & Ví',
  reports:      'Báo cáo & Phân tích',
  bills:        'Hóa đơn định kỳ',
  settings:     'Cá nhân & Cài đặt',
};

export default function Topbar({ onAddTx, onAuthClick }) {
  const {
    screen, setScreen, setSidebarOpen,
    themeMode, setThemeMode,
    hideBalance, setHideBalance,
    user, isLive, doLogout,
    notifications, unreadCount, markNotifRead,
  } = useApp();

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef  = useRef();
  const notifRef   = useRef();
  const profileRef = useRef();

  // close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setHideBalance(p => !p);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setHideBalance]);

  // search results
  const searchResults = searchQuery.length > 1
    ? SCREENS.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const isLoggedIn = !!user;

  return (
    <header className="topbar">
      {/* Mobile hamburger */}
      <button className="icon-btn md:hidden" onClick={() => setSidebarOpen(true)}>
        <Menu size={18} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="topbar-title truncate">{TITLE[screen]}</div>
      </div>

      {/* Search bar */}
      <div className="relative hidden sm:block">
        {searchOpen ? (
          <div className="search-box" style={{ minWidth: 280 }}>
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm màn hình… (Ctrl K)"
              onBlur={() => { setTimeout(() => { setSearchOpen(false); setSearchQuery(''); }, 200); }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>×</button>
            )}
          </div>
        ) : (
          <button
            className="search-box cursor-pointer"
            style={{ minWidth: 200, color: 'var(--text-muted)', fontSize: '0.82rem' }}
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
          >
            <Search size={14} />
            <span>Tìm kiếm… </span>
            <kbd style={{ fontSize: '0.68rem', padding: '1px 5px', background: 'var(--elevated)', borderRadius: 4, border: '1px solid var(--border)' }}>Ctrl K</kbd>
          </button>
        )}

        {/* Search dropdown */}
        {searchOpen && searchResults.length > 0 && (
          <div className="card absolute top-full left-0 right-0 mt-1 py-1 z-50" style={{ minWidth: 240 }}>
            {searchResults.map(s => (
              <button
                key={s.id}
                className="w-full text-left px-3 py-2 hover:bg-[var(--elevated)] text-sm font-medium rounded-md"
                style={{ color: 'var(--text-primary)' }}
                onMouseDown={() => { setScreen(s.id); setSearchOpen(false); setSearchQuery(''); }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        {/* Theme switcher */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--elevated)', borderRadius: 'var(--radius-md)', padding: 2, border: '1px solid var(--border)' }}>
          {[
            { mode: 'light',  Icon: Sun,    title: 'Sáng'     },
            { mode: 'dark',   Icon: Moon,   title: 'Tối'      },
            { mode: 'system', Icon: Laptop, title: 'Tự động'  },
          ].map(({ mode, Icon, title }) => (
            <button
              key={mode}
              className="icon-btn"
              title={title}
              style={{
                width: 30, height: 30, fontSize: '0.7rem',
                background: themeMode === mode ? 'var(--primary-light)' : 'transparent',
                color: themeMode === mode ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none',
              }}
              onClick={() => setThemeMode(mode)}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        {/* Hide balance */}
        <button
          className="icon-btn"
          title={`${hideBalance ? 'Hiển thị' : 'Ẩn'} số dư (Ctrl H)`}
          onClick={() => setHideBalance(p => !p)}
        >
          {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="icon-btn relative"
            onClick={() => setNotifOpen(p => !p)}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--danger)',
              }} />
            )}
          </button>

          {notifOpen && (
            <div className="card absolute right-0 top-full mt-2 z-50" style={{ width: 340, maxHeight: 420, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <span className="card-title">Thông báo</span>
                <span className="badge badge-purple">{unreadCount} mới</span>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                  <div className="empty-state py-8">
                    <Bell size={32} className="empty-icon" />
                    <div className="empty-desc">Không có thông báo nào</div>
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    className="flex gap-3 p-3 cursor-pointer hover:bg-[var(--elevated)] transition-colors"
                    style={{ borderBottom: '1px solid var(--border)', opacity: n.isRead ? .6 : 1 }}
                    onClick={() => markNotifRead(n.id)}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: n.type === 'SUCCESS' ? 'var(--success-light)' : n.type === 'DANGER' ? 'var(--danger-light)' : 'var(--warning-light)',
                      color: n.type === 'SUCCESS' ? 'var(--success)' : n.type === 'DANGER' ? 'var(--danger)' : 'var(--warning)',
                    }}>
                      {n.isRead ? <Check size={14} /> : <Bell size={14} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Transaction */}
        <button className="btn btn-primary btn-sm hidden sm:flex" onClick={onAddTx}>
          <Plus size={15} />
          <span>Thêm giao dịch</span>
        </button>

        {/* Login/Register buttons when not logged in */}
        {!isLoggedIn && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onAuthClick && onAuthClick('login')}
            >
              <LogIn size={14} />
              <span>Đăng nhập</span>
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onAuthClick && onAuthClick('register')}
            >
              <UserPlus size={14} />
              <span>Đăng ký</span>
            </button>
          </div>
        )}

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2 cursor-pointer"
            style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: 'var(--radius-md)' }}
            onClick={() => setProfileOpen(p => !p)}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #9B51E0)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
            }}>
              {(user?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-semibold truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
              {user?.fullName || 'Tài khoản'}
            </span>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          </button>

          {profileOpen && (
            <div className="card absolute right-0 top-full mt-2 z-50 py-1" style={{ width: 220 }}>
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {user?.fullName || 'Khách'}
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                  {user?.email || 'Chưa đăng nhập'}
                </div>
              </div>

              {isLoggedIn ? (
                <>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--elevated)] transition-colors"
                    style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setScreen('settings'); setProfileOpen(false); }}
                  >
                    <Settings size={15} style={{ color: 'var(--text-muted)' }} /> Cài đặt tài khoản
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--danger-light)] transition-colors"
                    style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { doLogout(); setProfileOpen(false); }}
                  >
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--elevated)] transition-colors"
                    style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { onAuthClick && onAuthClick('login'); setProfileOpen(false); }}
                  >
                    <LogIn size={15} style={{ color: 'var(--primary)' }} /> Đăng nhập
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--elevated)] transition-colors"
                    style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { onAuthClick && onAuthClick('register'); setProfileOpen(false); }}
                  >
                    <UserPlus size={15} style={{ color: 'var(--primary)' }} /> Đăng ký
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--elevated)] transition-colors"
                    style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setScreen('settings'); setProfileOpen(false); }}
                  >
                    <Settings size={15} style={{ color: 'var(--text-muted)' }} /> Cài đặt
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
