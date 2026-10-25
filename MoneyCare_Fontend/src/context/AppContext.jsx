import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api';
import {
  MOCK_USER, MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_CATEGORIES,
  MOCK_BUDGETS, MOCK_SAVINGS_GOALS, MOCK_BILLS, MOCK_NOTIFICATIONS,
} from '../services/mockData';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ── helpers ──────────────────────────────────────────────────────────────────
export const fmt = (n) =>
  typeof n === 'number' ? Math.abs(n).toLocaleString('vi-VN') + ' đ' : '0 đ';

export const txType = (t) => {
  if (t === 'INCOME' || t === 'THU') return 'income';
  if (t === 'CHUYEN_TIEN') return 'transfer';
  return 'expense';
};

// ── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  // ── theme ──
  const [themeMode, setThemeModeRaw] = useState(
    () => localStorage.getItem('mc_theme') || 'system'
  );

  const applyTheme = useCallback((mode) => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const setThemeMode = (mode) => {
    setThemeModeRaw(mode);
    localStorage.setItem('mc_theme', mode);
    applyTheme(mode);
  };

  useEffect(() => {
    applyTheme(themeMode);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (themeMode === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode, applyTheme]);

  // ── backend / auth ──
  const [isLive, setIsLive]   = useState(false);
  const [backendUp, setBackendUp] = useState(false);
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('moneycare_user') || 'null'); } catch { return null; }
  });
  const [token, setToken]     = useState(() => localStorage.getItem('moneycare_jwt') || null);

  // ── balance privacy ──
  const [hideBalance, setHideBalance] = useState(false);

  // ── current screen ──
  const [screen, setScreen]   = useState('overview');

  // ── sidebar open (mobile) ──
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── data ──
  const [accounts,      setAccounts]      = useState(MOCK_ACCOUNTS);
  const [transactions,  setTransactions]  = useState(MOCK_TRANSACTIONS);
  const [categories,    setCategories]    = useState(MOCK_CATEGORIES);
  const [budgets,       setBudgets]       = useState(MOCK_BUDGETS);
  const [savingsGoals,  setSavingsGoals]  = useState(MOCK_SAVINGS_GOALS);
  const [bills,         setBills]         = useState(MOCK_BILLS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // ── loading ──
  const [loading, setLoading] = useState({});
  const setLoad = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  // ── toasts ──
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const toast = useCallback((msg, type = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // ── probe backend ──
  const probeBackend = useCallback(async () => {
    const up = await api.checkHealth();
    setBackendUp(up);
    if (up && token) {
      setIsLive(true);
    }
    return up;
  }, [token]);

  useEffect(() => { probeBackend(); }, [probeBackend]);

  // handle unauthorized event
  useEffect(() => {
    const handler = () => {
      setToken(null); setUser(null); setIsLive(false);
      localStorage.removeItem('moneycare_jwt'); localStorage.removeItem('moneycare_user');
      toast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
      loadDemo();
    };
    window.addEventListener('mc:unauthorized', handler);
    return () => window.removeEventListener('mc:unauthorized', handler);
  }, []);

  // ── sync from backend ──
  const syncAll = useCallback(async () => {
    if (!token) return;
    setLoad('sync', true);
    try {
      const [accs, txs, cats, buds, goals, bls, notifs] = await Promise.allSettled([
        api.getAccounts(), api.getTransactions(), api.getCategories(),
        api.getBudgets(), api.getSavingsGoals(), api.getBills(), api.getNotifications(),
      ]);
      if (accs.status === 'fulfilled') setAccounts(accs.value);
      if (txs.status  === 'fulfilled') setTransactions(txs.value);
      if (cats.status === 'fulfilled') setCategories(cats.value);
      if (buds.status === 'fulfilled') setBudgets(buds.value);
      if (goals.status=== 'fulfilled') setSavingsGoals(goals.value);
      if (bls.status  === 'fulfilled') setBills(bls.value);
      if (notifs.status==='fulfilled') setNotifications(notifs.value);
    } catch (e) {
      toast('Lỗi đồng bộ dữ liệu: ' + e.message, 'error');
    } finally {
      setLoad('sync', false);
    }
  }, [token]);

  const loadDemo = useCallback(() => {
    setAccounts(MOCK_ACCOUNTS);
    setTransactions(MOCK_TRANSACTIONS);
    setCategories(MOCK_CATEGORIES);
    setBudgets(MOCK_BUDGETS);
    setSavingsGoals(MOCK_SAVINGS_GOALS);
    setBills(MOCK_BILLS);
    setNotifications(MOCK_NOTIFICATIONS);
    setUser(null); setToken(null); setIsLive(false);
  }, []);

  // ── login ──
  const doLogin = useCallback(async (email, password) => {
    setLoad('auth', true);
    try {
      const res = await api.login(email, password);
      if (!res.accessToken) throw new Error('Không nhận được token');
      localStorage.setItem('moneycare_jwt', res.accessToken);
      localStorage.setItem('moneycare_user', JSON.stringify(res.user));
      setToken(res.accessToken);
      setUser(res.user);
      setIsLive(true);
      setBackendUp(true);
      // Ensure starter account exists
      const accs = await api.getAccounts();
      if (accs.length === 0) {
        await api.createAccount({
          accountName: 'Ví Tiền Mặt', accountType: 'TIEN_MAT',
          openingBalance: 0, balance: 0, currency: 'VND', description: 'Ví chi tiêu chính',
        });
      }
      await syncAll();
      toast(`Chào mừng ${res.user?.fullName || res.user?.email}! Đã kết nối Backend.`);
      return true;
    } catch (e) {
      toast('Đăng nhập thất bại: ' + e.message, 'error');
      return false;
    } finally {
      setLoad('auth', false);
    }
  }, [syncAll]);

  // ── register ──
  const doRegister = useCallback(async (data) => {
    setLoad('auth', true);
    try {
      await api.register(data);
      const ok = await doLogin(data.email, data.password);
      return ok;
    } catch (e) {
      toast('Đăng ký thất bại: ' + e.message, 'error');
      return false;
    } finally {
      setLoad('auth', false);
    }
  }, [doLogin]);

  // ── logout ──
  const doLogout = useCallback(() => {
    localStorage.removeItem('moneycare_jwt'); localStorage.removeItem('moneycare_user');
    setToken(null); setUser(null); setIsLive(false);
    loadDemo();
    toast('Đã đăng xuất. Đang dùng chế độ Demo.');
  }, [loadDemo]);

  // ── add transaction ──
  const addTransaction = useCallback(async (payload) => {
    setLoad('tx', true);
    try {
      if (isLive && token) {
        await api.createTransaction(payload);
        await syncAll();
      } else {
        // demo mode — in-memory
        const id = Date.now();
        setTransactions(prev => [{ ...payload, id, createdAt: new Date().toISOString() }, ...prev]);
        // adjust account balance
        const signedAmt = payload.type === 'INCOME' ? payload.amount : -payload.amount;
        setAccounts(prev => prev.map(a =>
          a.id === payload.accountId ? { ...a, balance: (a.balance || 0) + signedAmt } : a
        ));
      }
      toast('Đã lưu giao dịch thành công! 🎉');
    } catch (e) {
      toast('Lỗi: ' + e.message, 'error');
    } finally {
      setLoad('tx', false);
    }
  }, [isLive, token, syncAll]);

  // ── delete transaction ──
  const deleteTransaction = useCallback(async (tx) => {
    setLoad('delTx', true);
    try {
      if (isLive && token) {
        await api.deleteTransaction(tx.id);
        await syncAll();
      } else {
        setTransactions(prev => prev.filter(t => t.id !== tx.id));
        const signedAmt = tx.type === 'INCOME' ? -tx.amount : tx.amount;
        setAccounts(prev => prev.map(a =>
          a.id === tx.accountId ? { ...a, balance: (a.balance || 0) + signedAmt } : a
        ));
      }
      toast('Đã xóa giao dịch và cập nhật số dư.');
    } catch (e) {
      toast('Lỗi xóa: ' + e.message, 'error');
    } finally {
      setLoad('delTx', false);
    }
  }, [isLive, token, syncAll]);

  // ── add account ──
  const addAccount = useCallback(async (data) => {
    try {
      if (isLive && token) {
        await api.createAccount(data);
        const accs = await api.getAccounts();
        setAccounts(accs);
      } else {
        setAccounts(prev => [...prev, { ...data, id: Date.now(), status: 'ACTIVE' }]);
      }
      toast('Đã thêm tài khoản thành công!');
    } catch (e) {
      toast('Lỗi: ' + e.message, 'error');
    }
  }, [isLive, token]);

  // ── add budget ──
  const addBudget = useCallback(async (data) => {
    try {
      if (isLive && token) {
        await api.createBudget(data);
        const b = await api.getBudgets();
        setBudgets(b);
      } else {
        setBudgets(prev => [...prev, { ...data, id: Date.now() }]);
      }
      toast('Đã tạo ngân sách thành công!');
    } catch (e) {
      toast('Lỗi: ' + e.message, 'error');
    }
  }, [isLive, token]);

  // ── delete budget ──
  const deleteBudget = useCallback(async (id) => {
    try {
      if (isLive && token) {
        await api.deleteBudget(id);
        setBudgets(prev => prev.filter(b => b.id !== id));
      } else {
        setBudgets(prev => prev.filter(b => b.id !== id));
      }
      toast('Đã xóa ngân sách.');
    } catch (e) {
      toast('Lỗi: ' + e.message, 'error');
    }
  }, [isLive, token]);

  // ── add savings goal ──
  const addSavingsGoal = useCallback(async (data) => {
    try {
      if (isLive && token) {
        await api.createSavingsGoal(data);
        const g = await api.getSavingsGoals();
        setSavingsGoals(g);
      } else {
        setSavingsGoals(prev => [...prev, { ...data, id: Date.now(), currentAmount: 0, status: 'IN_PROGRESS' }]);
      }
      toast('Đã tạo mục tiêu tiết kiệm!');
    } catch (e) {
      toast('Lỗi: ' + e.message, 'error');
    }
  }, [isLive, token]);

  // ── deposit savings ──
  const depositSavings = useCallback(async (goalId, amount, accountId) => {
    try {
      if (isLive && token) {
        await api.createSavingsTx({ goalId, amount, accountId, transactionDate: new Date().toISOString() });
        await syncAll();
      } else {
        setSavingsGoals(prev => prev.map(g =>
          g.id === goalId ? { ...g, currentAmount: (g.currentAmount || 0) + amount } : g
        ));
        setAccounts(prev => prev.map(a =>
          a.id === accountId ? { ...a, balance: Math.max(0, (a.balance || 0) - amount) } : a
        ));
      }
      toast(`Đã nạp ${fmt(amount)} vào hũ tiết kiệm!`);
    } catch (e) {
      toast('Lỗi: ' + e.message, 'error');
    }
  }, [isLive, token, syncAll]);

  // ── add bill ──
  const addBill = useCallback(async (data) => {
    try {
      if (isLive && token) {
        await api.createBill(data);
        const b = await api.getBills();
        setBills(b);
      } else {
        setBills(prev => [...prev, { ...data, id: Date.now(), status: 'PENDING' }]);
      }
      toast('Đã thêm hóa đơn!');
    } catch (e) {
      toast('Lỗi: ' + e.message, 'error');
    }
  }, [isLive, token]);

  // ── pay bill ──
  const payBill = useCallback(async (bill) => {
    try {
      if (isLive && token) {
        await api.createBillPayment({ billId: bill.id, amount: bill.amount, paymentDate: new Date().toISOString() });
        await syncAll();
      } else {
        setBills(prev => prev.map(b => b.id === bill.id ? { ...b, status: 'PAID' } : b));
      }
      toast('Đã thanh toán hóa đơn!');
    } catch (e) {
      toast('Lỗi: ' + e.message, 'error');
    }
  }, [isLive, token, syncAll]);

  // ── mark notification read ──
  const markNotifRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  // ── computed stats ──
  const totalNetWorth = accounts.filter(a => a.status !== 'ARCHIVED').reduce((s, a) => s + (a.balance || 0), 0);
  const monthlyIncome = transactions
    .filter(t => txType(t.type) === 'income' && new Date(t.transactionDate).getMonth() === new Date().getMonth())
    .reduce((s, t) => s + (t.amount || 0), 0);
  const monthlyExpense = transactions
    .filter(t => txType(t.type) === 'expense' && new Date(t.transactionDate).getMonth() === new Date().getMonth())
    .reduce((s, t) => s + (t.amount || 0), 0);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider value={{
      // theme
      themeMode, setThemeMode,
      // auth / backend
      isLive, backendUp, user, token,
      doLogin, doRegister, doLogout, probeBackend, syncAll,
      // screen
      screen, setScreen,
      sidebarOpen, setSidebarOpen,
      // privacy
      hideBalance, setHideBalance,
      // data
      accounts, transactions, categories, budgets,
      savingsGoals, bills, notifications,
      // actions
      addTransaction, deleteTransaction,
      addAccount, addBudget, deleteBudget,
      addSavingsGoal, depositSavings,
      addBill, payBill,
      markNotifRead,
      // computed
      totalNetWorth, monthlyIncome, monthlyExpense,
      remaining: monthlyIncome - monthlyExpense,
      unreadCount,
      // ui helpers
      loading, toast,
      toasts, setToasts,
      fmt, txType,
    }}>
      {children}
    </AppContext.Provider>
  );
}
