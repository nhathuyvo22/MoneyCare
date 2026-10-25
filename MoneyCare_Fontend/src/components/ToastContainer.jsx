import React, { useEffect } from 'react';
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
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'success'}`}>
          {ICONS[t.type] || ICONS.success}
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button
            onClick={() => dismiss(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
