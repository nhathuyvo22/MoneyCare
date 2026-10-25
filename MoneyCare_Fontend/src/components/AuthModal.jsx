import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Loader, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const { doLogin, doRegister, loading } = useApp();
  const [tab, setTab]   = useState(defaultTab);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateLogin = () => {
    const errs = {};
    if (!form.email?.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!form.email.includes('@')) {
      errs.email = 'Email không hợp lệ';
    }
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs = {};
    if (!form.fullName?.trim()) errs.fullName = 'Vui lòng nhập họ và tên';
    if (!form.email?.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!form.email.includes('@')) {
      errs.email = 'Email không hợp lệ';
    }
    if (!form.phone?.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    if (!form.password || form.password.length < 6) {
      errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    const ok = await doLogin(form.email.trim(), form.password);
    if (ok) onClose();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    const ok = await doRegister({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
    });
    if (ok) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 440 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), #9B51E0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              {tab === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {tab === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {tab === 'login' ? 'Truy cập dữ liệu tài chính cá nhân' : 'Bắt đầu quản lý chi tiêu thông minh'}
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 20px 4px' }}>
          <button
            type="button"
            className={`tab-pill flex-1${tab === 'login' ? ' active' : ''}`}
            onClick={() => { setTab('login'); setErrors({}); }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`tab-pill flex-1${tab === 'register' ? ' active' : ''}`}
            onClick={() => { setTab('register'); setErrors({}); }}
          >
            Đăng ký
          </button>
        </div>

        {/* Form Body */}
        <div className="modal-body" style={{ paddingTop: 16 }}>
          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className={`form-control${errors.email ? ' error' : ''}`}
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              {/* Password */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="login-pwd">Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-pwd"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`form-control${errors.password ? ' error' : ''}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                    }}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full mt-2"
                disabled={loading.auth}
              >
                {loading.auth ? <Loader size={16} className="spin" /> : <LogIn size={16} />}
                <span>{loading.auth ? 'Đang xác thực...' : 'Đăng nhập'}</span>
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrors({}); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Full Name */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="reg-name">Họ và tên</label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  className={`form-control${errors.fullName ? ' error' : ''}`}
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={e => setField('fullName', e.target.value)}
                />
                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
              </div>

              {/* Email */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  className={`form-control${errors.email ? ' error' : ''}`}
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              {/* Phone */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="reg-phone">Số điện thoại</label>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  className={`form-control${errors.phone ? ' error' : ''}`}
                  placeholder="0912345678"
                  value={form.phone}
                  onChange={e => setField('phone', e.target.value)}
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>

              {/* Password */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="reg-pwd">Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-pwd"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`form-control${errors.password ? ' error' : ''}`}
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                    }}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full mt-2"
                disabled={loading.auth}
              >
                {loading.auth ? <Loader size={16} className="spin" /> : <UserPlus size={16} />}
                <span>{loading.auth ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}</span>
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrors({}); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
