import React, { useState } from 'react'
import { useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import BottomNav from './components/BottomNav'
import ToastContainer from './components/ToastContainer'
import AddTransactionModal from './components/AddTransactionModal'
import AuthModal from './components/AuthModal'

// Screens
import OverviewScreen from './screens/OverviewScreen'
import TransactionsScreen from './screens/TransactionsScreen'
import BudgetScreen from './screens/BudgetScreen'
import GoalsScreen from './screens/GoalsScreen'
import AccountsScreen from './screens/AccountsScreen'
import ReportsScreen from './screens/ReportsScreen'
import BillsScreen from './screens/BillsScreen'
import SettingsScreen from './screens/SettingsScreen'

function ScreenContent({ screen }) {
  switch (screen) {
    case 'overview':     return <OverviewScreen />
    case 'transactions': return <TransactionsScreen />
    case 'budget':       return <BudgetScreen />
    case 'goals':        return <GoalsScreen />
    case 'accounts':     return <AccountsScreen />
    case 'reports':      return <ReportsScreen />
    case 'bills':        return <BillsScreen />
    case 'settings':     return <SettingsScreen />
    default:             return <OverviewScreen />
  }
}

export default function App() {
  const { screen, user, toasts } = useApp()
  const [showAddTx, setShowAddTx] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab] = useState('login')

  const openAuth = (tab = 'login') => {
    setAuthTab(tab)
    setShowAuth(true)
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
          <ScreenContent screen={screen} />
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
