import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />,
  error:   <AlertCircle  size={16} style={{ color: 'var(--danger)',  flexShrink: 0 }} />,
  warning: <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />,
  info:    <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />,
};

export default function ToastContainer() {
  const { toasts, setToasts } = useApp();

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'success'}`}>
          {ICONS[t.type] || ICONS.success}
          <span style={{ flex: 1, wordBreak: 'break-word', lineHeight: 1.4 }}>{t.msg}</span>

          {/* Action Toast (Hoàn tác, Xem chi tiết, Thử lại...) */}
          {t.action && (
            <button
              type="button"
              className="toast-action-btn"
              onClick={() => {
                try {
                  if (typeof t.action.onClick === 'function') {
                    t.action.onClick();
                  }
                } finally {
                  dismiss(t.id);
                }
              }}
            >
              {t.action.label}
            </button>
          )}

          <button
            onClick={() => dismiss(t.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'color 120ms',
            }}
            title="Đóng thông báo"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
