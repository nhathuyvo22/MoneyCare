import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Shield, Database, Sun, LogIn, LogOut } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const TABS = [
  { id: 'profile',     label: 'Hồ sơ',     Icon: User     },
  { id: 'theme',       label: 'Giao diện',  Icon: Sun      },
  { id: 'security',    label: 'Bảo mật',    Icon: Shield   },
  { id: 'data',        label: 'Dữ liệu',    Icon: Database },
];

export default function SettingsScreen() {
  const {
    user, themeMode, setThemeMode,
    doLogout, toast,
    transactions, accounts,
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile');
  const [showAuth, setShowAuth]   = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', email: user?.email || '' });

  const isLoggedIn = !!user;

  const exportData = () => {
    const data = { app: 'MoneyCare', exportedAt: new Date().toISOString(), transactions, accounts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `moneycare-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast('Đã xuất dữ liệu thành công!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tab Pills */}
      <div className="card">
        <div className="card-body" style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`chip${activeTab === id ? ' active' : ''}`}
                onClick={() => setActiveTab(id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Thông tin tài khoản</span></div>
          <div className="card-body" style={{ maxWidth: 480 }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #9B51E0)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800
              }}>
                {(user?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  {user?.fullName || 'Tài khoản khách'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {user?.email || 'Chưa đăng nhập'}
                </div>
              </div>
            </div>

            {isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Họ và tên</label>
                  <input
                    className="form-control"
                    value={profileForm.fullName}
                    onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    value={profileForm.email}
                    disabled
                    style={{ opacity: 0.7 }}
                  />
                </div>
                <div>
                  <button className="btn btn-danger btn-sm" onClick={doLogout}>
                    <LogOut size={14} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                  Đăng nhập tài khoản MoneyCare để đồng bộ giao dịch, ngân sách và mục tiêu chi tiêu cá nhân.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>
                    <LogIn size={14} />
                    <span>Đăng nhập / Đăng ký</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Theme */}
      {activeTab === 'theme' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Tùy chỉnh giao diện</span></div>
          <div className="card-body" style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { mode: 'light',  label: 'Giao diện Sáng',        sub: 'Nền trắng sáng, dịu mắt ban ngày' },
                { mode: 'dark',   label: 'Giao diện Tối',         sub: 'Nền tối chống mỏi mắt ban đêm' },
                { mode: 'system', label: 'Tự động theo hệ thống', sub: 'Tự động đổi theo cài đặt thiết bị' },
              ].map(({ mode, label, sub }) => (
                <div
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: `2px solid ${themeMode === mode ? 'var(--primary)' : 'var(--border)'}`,
                    background: themeMode === mode ? 'var(--primary-light)' : 'var(--bg)',
                    transition: 'all 150ms',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{sub}</div>
                  </div>
                  {themeMode === mode && (
                    <div style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}>
                      ✓ Đang dùng
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Bảo mật tài khoản</span></div>
          <div className="card-body" style={{ maxWidth: 460 }}>
            {isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
                  Đổi mật khẩu tài khoản của bạn.
                </p>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <input type="password" className="form-control" placeholder="••••••••" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mật khẩu mới</label>
                  <input type="password" className="form-control" placeholder="Tối thiểu 6 ký tự" />
                </div>
                <button
                  className="btn btn-primary btn-sm w-fit"
                  onClick={() => toast('Chức năng đổi mật khẩu sắp ra mắt!', 'info')}
                >
                  Đổi mật khẩu
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Vui lòng đăng nhập để quản lý bảo mật tài khoản.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Data */}
      {activeTab === 'data' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Quản lý dữ liệu</span></div>
          <div className="card-body" style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Xuất toàn bộ dữ liệu giao dịch và tài khoản về file JSON để sao lưu.
            </div>
            <button className="btn btn-outline btn-sm w-fit" onClick={exportData}>
              <Database size={13} /> Xuất dữ liệu JSON
            </button>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
