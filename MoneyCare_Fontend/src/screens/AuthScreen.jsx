import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp, LogIn, UserPlus, Eye, EyeOff, Loader,
  ShieldCheck, Wallet, PieChart, Sparkles, CheckCircle2
} from 'lucide-react';

export default function AuthScreen() {
  const { doLogin, doRegister, loading } = useApp();
  const [tab, setTab]   = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors]   = useState({});

  const setField = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) {
      setErrors(prev => ({ ...prev, [k]: null }));
    }
  };

  const validateLogin = () => {
    const errs = {};
    if (!form.email?.trim()) errs.email = 'Vui lòng nhập email';
    else if (!form.email.includes('@')) errs.email = 'Email không hợp lệ';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs = {};
    if (!form.fullName?.trim()) errs.fullName = 'Vui lòng nhập họ và tên';
    if (!form.email?.trim()) errs.email = 'Vui lòng nhập email';
    else if (!form.email.includes('@')) errs.email = 'Email không hợp lệ';
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
    await doLogin(form.email.trim(), form.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    await doRegister({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'stretch',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      fontFamily: "'Be Vietnam Pro', Inter, sans-serif"
    }}>
      {/* CỘT TRÁI: BRANDING BANNER (Ẩn trên mobile, hiện từ màn hình tablet/desktop) */}
      <div
        className="hidden lg:flex"
        style={{
          flex: '1.1',
          background: 'linear-gradient(145deg, #4B24B3 0%, #6339DB 40%, #8E44AD 100%)',
          color: '#FFFFFF',
          padding: '60px 50px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow decoration */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Top Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <TrendingUp size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>MoneyCare</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Quản lý tài chính cá nhân</div>
          </div>
        </div>

        {/* Center Content */}
        <div style={{ zIndex: 1, maxWidth: 480 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 99,
            background: 'rgba(255,255,255,0.15)',
            fontSize: '0.78rem', fontWeight: 700, marginBottom: 20
          }}>
            <Sparkles size={14} /> Trải nghiệm quản lý tài chính chuẩn Fintech
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.25, marginBottom: 16 }}>
            Hiểu tiền của bạn.<br />Làm chủ tương lai.
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.6, marginBottom: 32 }}>
            Đồng bộ dữ liệu ngân hàng, quản lý thu chi, ngân sách và mục tiêu tiết kiệm một cách tự động, bảo mật và chính xác.
          </p>

          {/* Feature points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={16} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Quản lý đa tài khoản, ví điện tử & thẻ ngân hàng</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChart size={16} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Báo cáo dòng tiền, phân tích danh mục trực quan</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Bảo mật dữ liệu tài khoản với mã hóa JWT & Spring Boot</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '0.75rem', opacity: 0.7, zIndex: 1 }}>
          © 2026 MoneyCare • Nền tảng quản lý tài chính thông minh
        </div>
      </div>

      {/* CỘT PHẢI: FORM ĐĂNG NHẬP / ĐĂNG KÝ */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--surface)',
          padding: '36px 32px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)'
        }}>

          {/* Mobile Logo (chỉ hiện trên màn hình nhỏ) */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), #9B51E0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <TrendingUp size={20} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--primary)' }}>MoneyCare</span>
          </div>

          {/* Form Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.45rem', color: 'var(--text-primary)' }}>
              {tab === 'login' ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới'}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {tab === 'login'
                ? 'Đăng nhập để xem và quản lý tài chính của bạn'
                : 'Bắt đầu hành trình làm chủ tài chính cá nhân'}
            </p>
          </div>

          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            marginBottom: 24,
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              className="flex-1"
              onClick={() => { setTab('login'); setErrors({}); }}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: tab === 'login' ? 'var(--surface)' : 'transparent',
                color: tab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: tab === 'login' ? 700 : 500,
                boxShadow: tab === 'login' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: '0.86rem'
              }}
            >
              <LogIn size={15} />
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              className="flex-1"
              onClick={() => { setTab('register'); setErrors({}); }}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: tab === 'register' ? 'var(--surface)' : 'transparent',
                color: tab === 'register' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: tab === 'register' ? 700 : 500,
                boxShadow: tab === 'register' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: '0.86rem'
              }}
            >
              <UserPlus size={15} />
              <span>Đăng ký</span>
            </button>
          </div>

          {/* FORM: ĐĂNG NHẬP */}
          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
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
                <label className="form-label" htmlFor="auth-pwd">Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="auth-pwd"
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
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading.auth}
                style={{ padding: '12px', fontSize: '0.92rem', fontWeight: 700, marginTop: 4 }}
              >
                {loading.auth ? <Loader size={16} className="spin" /> : <LogIn size={16} />}
                <span>{loading.auth ? 'Đang xác thực...' : 'Đăng nhập'}</span>
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrors({}); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          ) : (
            /* FORM: ĐĂNG KÝ */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Họ tên */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="reg-fullname">Họ và tên</label>
                <input
                  id="reg-fullname"
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

              {/* Số điện thoại */}
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

              {/* Mật khẩu */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="reg-password">Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
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
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading.auth}
                style={{ padding: '12px', fontSize: '0.92rem', fontWeight: 700, marginTop: 4 }}
              >
                {loading.auth ? <Loader size={16} className="spin" /> : <UserPlus size={16} />}
                <span>{loading.auth ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}</span>
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrors({}); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* Security badge */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginTop: 24, fontSize: '0.74rem', color: 'var(--text-muted)'
          }}>
            <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
            <span>Kết nối bảo mật 256-bit mã hóa Spring Security</span>
          </div>

        </div>
      </div>
    </div>
  );
}
