import React, { useState, useEffect } from 'react'
import { useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import BottomNav from './components/BottomNav'
import ToastContainer from './components/ToastContainer'
import AddTransactionModal from './components/AddTransactionModal'
import AuthModal from './components/AuthModal'
import AuthScreen from './screens/AuthScreen'
import AdminDashboardView from './admin/AdminDashboardView'

// Screens
import OverviewScreen from './screens/OverviewScreen'
import TransactionsScreen from './screens/TransactionsScreen'
import BudgetScreen from './screens/BudgetScreen'
import GoalsScreen from './screens/GoalsScreen'
import AccountsScreen from './screens/AccountsScreen'
import ReportsScreen from './screens/ReportsScreen'
import BillsScreen from './screens/BillsScreen'
import SettingsScreen from './screens/SettingsScreen'
import InterestCalculatorScreen from './screens/InterestCalculatorScreen'

function ScreenContent({ screen, onAddTx }) {
  switch (screen) {
    case 'overview':     return <OverviewScreen onAddTx={onAddTx} />
    case 'transactions': return <TransactionsScreen onAddTx={onAddTx} />
    case 'budget':       return <BudgetScreen />
    case 'goals':        return <GoalsScreen />
    case 'interest':     return <InterestCalculatorScreen />
    case 'accounts':     return <AccountsScreen />
    case 'reports':      return <ReportsScreen />
    case 'bills':        return <BillsScreen />
    case 'settings':     return <SettingsScreen />
    default:             return <OverviewScreen onAddTx={onAddTx} />
  }
}

export default function App() {
  const { screen, user, token, toasts, isAdmin, appMode, setAppMode, toast } = useApp()
  const [showAddTx, setShowAddTx] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab] = useState('login')

  // Security Route Guard: Nếu không phải Admin mà appMode là admin thì cưỡng chế đá về User
  useEffect(() => {
    if (user && !isAdmin && appMode === 'admin') {
      setAppMode('user')
      if (toast) {
        toast('Truy cập bị từ chối (403 Forbidden): Bạn không có quyền quản trị!', 'error')
      }
    }
  }, [user, isAdmin, appMode, setAppMode, toast])

  const openAuth = (tab = 'login') => {
    setAuthTab(tab)
    setShowAuth(true)
  }

  // Auth Guard: Chưa đăng nhập buộc phải ở màn hình AuthScreen
  if (!token || !user) {
    return (
      <>
        <AuthScreen />
        <ToastContainer toasts={toasts} />
      </>
    )
  }

  // Chế độ Quản trị (Admin Mode) dành riêng cho tài khoản có quyền Admin
  if (isAdmin && appMode === 'admin') {
    return (
      <>
        <AdminDashboardView />
        <ToastContainer toasts={toasts} />
      </>
    )
  }

  return (
    <div className="app-shell">
      {/* Sidebar — desktop */}
      <Sidebar onAuthClick={openAuth} />

      {/* Main content area */}
      <div className="main-content">
        <Topbar
          onAddTx={() => setShowAddTx(true)}
          onAuthClick={openAuth}
        />

        <main className="page-body">
          <ScreenContent screen={screen} onAddTx={() => setShowAddTx(true)} />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav onAddTx={() => setShowAddTx(true)} />

      {/* Modals */}
      {showAddTx && (
        <AddTransactionModal onClose={() => setShowAddTx(false)} />
      )}
      {showAuth && (
        <AuthModal defaultTab={authTab} onClose={() => setShowAuth(false)} />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
