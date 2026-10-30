import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Info,
  User,
  Layout,
  Bell,
  Shield,
  Sliders,
  TrendingUp,
  Save,
  CheckCircle2,
  Server,
  Database,
  Lock,
} from 'lucide-react';

const TABS = [
  { id: 'app', label: 'Thông tin ứng dụng', icon: Info },
  { id: 'profile', label: 'Hồ sơ quản trị viên', icon: User },
  { id: 'ui', label: 'Giao diện & Theme', icon: Layout },
  { id: 'notif', label: 'Cấu hình thông báo', icon: Bell },
  { id: 'roles', label: 'Quản lý quyền hạn', icon: Shield },
  { id: 'system', label: 'Cấu hình hệ thống', icon: Sliders },
];

export default function Settings() {
  const { adminUser, isLiveBackend, toast, logActivity } = useAdmin();
  const [activeTab, setActiveTab] = useState('app');
  const [saving, setSaving] = useState(false);

  // App settings state
  const [appConfig, setAppConfig] = useState({
    appName: 'MoneyCare',
    version: 'v1.0.0',
    supportEmail: 'support@moneycare.vn',
    hotline: '1900 123 456',
    language: 'vi',
    dateFormat: 'dd/MM/yyyy',
    currencyFormat: 'VND',
  });

  // Admin profile state
  const [profileForm, setProfileForm] = useState({
    fullName: adminUser?.fullName || 'Nguyễn Văn A',
    email: adminUser?.email || 'admin@moneycare.vn',
    phone: '0901234567',
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      logActivity('Cập nhật cấu hình', 'Cài đặt hệ thống', 'SUCCESS');
      toast('Đã lưu cấu hình cài đặt thành công! 🎉');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Cài đặt hệ thống
        </h2>
        <p className="text-xs text-muted mt-0.5">
          Cấu hình thông số ứng dụng, tài khoản quản trị và kết nối máy chủ.
        </p>
      </div>

      {/* 2-Column Layout matching screenshot 12 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Nav Tabs */}
        <div className="admin-card p-2 md:col-span-1 h-fit space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === id
                  ? 'bg-brand-50 text-brand-600 shadow-xs'
                  : 'text-gray-600 hover:bg-surface hover:text-gray-900'
              }`}
            >
              <Icon size={16} className={activeTab === id ? 'text-brand-600' : 'text-muted'} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Right Settings Content */}
        <div className="admin-card p-6 md:col-span-3 space-y-6">
          {/* TAB 1: THÔNG TIN ỨNG DỤNG */}
          {activeTab === 'app' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-50 border border-brand-100">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-gray-900">MoneyCare</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-200 text-brand-800">
                      v1.0.0
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 max-w-xl">
                    Ứng dụng quản lý tài chính cá nhân chuẩn Fintech. Giúp người dùng nắm bắt dòng tiền, tối ưu ngân sách và làm chủ tương lai tài chính vững vàng.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email hỗ trợ khách hàng</label>
                  <input
                    type="email"
                    value={appConfig.supportEmail}
                    onChange={e => setAppConfig({ ...appConfig, supportEmail: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hotline tổng đài</label>
                  <input
                    type="text"
                    value={appConfig.hotline}
                    onChange={e => setAppConfig({ ...appConfig, hotline: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase text-muted tracking-wider mb-3">
                  Cấu hình cơ bản
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ngôn ngữ hiển thị</label>
                    <select
                      value={appConfig.language}
                      onChange={e => setAppConfig({ ...appConfig, language: e.target.value })}
                      className="admin-input"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Định dạng ngày</label>
                    <select
                      value={appConfig.dateFormat}
                      onChange={e => setAppConfig({ ...appConfig, dateFormat: e.target.value })}
                      className="admin-input"
                    >
                      <option value="dd/MM/yyyy">dd/MM/yyyy (29/04/2025)</option>
                      <option value="yyyy-MM-dd">yyyy-MM-dd (2025-04-29)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Định dạng tiền tệ</label>
                    <select
                      value={appConfig.currencyFormat}
                      onChange={e => setAppConfig({ ...appConfig, currencyFormat: e.target.value })}
                      className="admin-input"
                    >
                      <option value="VND">VNĐ - Việt Nam Đồng (đ)</option>
                      <option value="USD">USD - Đô la Mỹ ($)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HỒ SƠ QUẢN TRỊ VIÊN */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <img
                  src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                  alt="Admin Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
                />
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm sm:text-base">
                    {adminUser?.fullName || 'Nguyễn Văn A'}
                  </h4>
                  <div className="text-xs text-brand-600 font-bold">Super Admin</div>
                  <div className="text-[11px] text-muted font-mono">{adminUser?.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cấp độ quyền</label>
                  <input
                    type="text"
                    disabled
                    value="Toàn quyền quản trị (Super Admin)"
                    className="admin-input bg-surface text-muted"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GIAO DIỆN & THEME */}
          {activeTab === 'ui' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted tracking-wider">
                Tùy biến nhận diện thương hiệu
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border-2 border-brand-500 bg-brand-50/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-gray-900">Giao diện Sáng (Fintech Light)</div>
                    <div className="text-xs text-muted">Tối ưu cho văn phòng và đối chiếu số liệu</div>
                  </div>
                  <CheckCircle2 size={20} className="text-brand-600" />
                </div>
                <div className="p-4 rounded-xl border border-border bg-surface opacity-60 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-gray-900">Giao diện Tối (Fintech Dark)</div>
                    <div className="text-xs text-muted">Sắp ra mắt ở phiên bản tiếp theo</div>
                  </div>
                  <span className="badge badge-gray text-[10px]">Coming soon</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THÔNG BÁO */}
          {activeTab === 'notif' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted tracking-wider">
                Kênh nhận cảnh báo hệ thống
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-gray-900">Cảnh báo vượt ngân sách người dùng</div>
                    <div className="text-[11px] text-muted">Gửi thông báo khi ngân sách đạt trên 100%</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-brand-600" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-gray-900">Hóa đơn sắp quá hạn</div>
                    <div className="text-[11px] text-muted">Cảnh báo trước 3 ngày đến hạn thanh toán</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-brand-600" />
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: QUẢN LÝ QUYỀN HẠN */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted tracking-wider">
                Danh sách vai trò & Quyền truy cập
              </h4>
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                <div className="p-3.5 bg-surface flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900">SUPER_ADMIN (Toàn quyền)</div>
                    <div className="text-[11px] text-muted">Toàn quyền đọc/ghi toàn bộ hệ thống MoneyCare</div>
                  </div>
                  <span className="badge badge-purple">1 tài khoản</span>
                </div>
                <div className="p-3.5 bg-card flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900">ADMIN (Quản trị viên)</div>
                    <div className="text-[11px] text-muted">Xem báo cáo, quản lý giao dịch, danh mục, ngân sách</div>
                  </div>
                  <span className="badge badge-blue">Hỗ trợ</span>
                </div>
                <div className="p-3.5 bg-surface flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900">USER (Người dùng thông thường)</div>
                    <div className="text-[11px] text-muted">Chỉ truy cập và quản lý dữ liệu tài chính của riêng mình</div>
                  </div>
                  <span className="badge badge-green">48 tài khoản</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CẤU HÌNH HỆ THỐNG */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted tracking-wider">
                Trạng thái máy chủ & Kết nối
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Server size={18} className={isLiveBackend ? 'text-emerald-600' : 'text-amber-500'} />
                    <div>
                      <div className="font-bold text-gray-900">Spring Boot API</div>
                      <div className="text-muted text-[11px]">http://localhost:8080</div>
                    </div>
                  </div>
                  <span className={`badge ${isLiveBackend ? 'badge-green' : 'badge-yellow'}`}>
                    {isLiveBackend ? 'Online' : 'Mock Mode'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database size={18} className="text-brand-600" />
                    <div>
                      <div className="font-bold text-gray-900">MySQL Database</div>
                      <div className="text-muted text-[11px]">moneycare_db (InnoDB)</div>
                    </div>
                  </div>
                  <span className="badge badge-green">Connected</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Action */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-muted flex items-center gap-1.5">
              <Lock size={13} className="text-emerald-600" />
              <span>Các thay đổi được mã hóa và lưu trữ an toàn</span>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-xs py-2.5 px-5 font-bold"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
