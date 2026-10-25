import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  CreditCard, BarChart3, Receipt, Settings, Plus,
} from 'lucide-react';

const TABS = [
  { id: 'overview',     icon: LayoutDashboard, label: 'Tổng quan' },
  { id: 'transactions', icon: ArrowLeftRight,  label: 'Giao dịch' },
  { id: 'reports',      icon: BarChart3,       label: 'Báo cáo'   },
  { id: 'settings',     icon: Settings,        label: 'Cá nhân'   },
];

export default function BottomNav({ onAddTx }) {
  const { screen, setScreen } = useApp();

  return (
    <nav className="bottom-nav">
      {TABS.slice(0, 2).map(({ id, icon: Icon, label }) => (
        <button key={id} className={`bottom-tab${screen === id ? ' active' : ''}`} onClick={() => setScreen(id)}>
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}

      {/* FAB center */}
      <button className="bottom-tab-fab" onClick={onAddTx}>
        <Plus size={22} />
      </button>

      {TABS.slice(2).map(({ id, icon: Icon, label }) => (
        <button key={id} className={`bottom-tab${screen === id ? ' active' : ''}`} onClick={() => setScreen(id)}>
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
