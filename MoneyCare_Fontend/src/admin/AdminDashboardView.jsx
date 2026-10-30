import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';


import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import SavingsGoals from './pages/SavingsGoals';
import Bills from './pages/Bills';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import { AlertCircle } from 'lucide-react';

function AdminContent() {
  const { adminScreen } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderScreen = () => {
    switch (adminScreen) {
      case 'dashboard':     return <Dashboard />;
      case 'users':         return <Users />;
      case 'accounts':      return <Accounts />;
      case 'transactions':  return <Transactions />;
      case 'categories':    return <Categories />;
      case 'budgets':       return <Budgets />;
      case 'savings-goals': return <SavingsGoals />;
      case 'bills':         return <Bills />;
      case 'reports':       return <Reports />;
      case 'audit-logs':    return <AuditLogs />;
      case 'settings':      return <Settings />;
      default:              return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3FF] flex text-[#24213D]">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Header onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardView() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
}
