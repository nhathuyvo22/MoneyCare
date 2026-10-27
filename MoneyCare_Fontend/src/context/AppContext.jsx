import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api';

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

const DEFAULT_CATEGORIES = [
  { id: 1, categoryName: 'Lương', type: 'INCOME', emoji: '💼' },
  { id: 2, categoryName: 'Ăn uống', type: 'EXPENSE', emoji: '🍜' },
  { id: 3, categoryName: 'Mua sắm', type: 'EXPENSE', emoji: '🛒' },
  { id: 4, categoryName: 'Giải trí', type: 'EXPENSE', emoji: '🎬' },
  { id: 5, categoryName: 'Di chuyển', type: 'EXPENSE', emoji: '🚗' },
  { id: 6, categoryName: 'Hóa đơn', type: 'EXPENSE', emoji: '🧾' },
  { id: 7, categoryName: 'Sức khỏe', type: 'EXPENSE', emoji: '❤️' },
  { id: 8, categoryName: 'Học tập', type: 'EXPENSE', emoji: '📚' },
  { id: 9, categoryName: 'Thưởng', type: 'INCOME', emoji: '🎁' },
  { id: 10, categoryName: 'Đầu tư', type: 'INCOME', emoji: '📈' },
  { id: 11, categoryName: 'Khác', type: 'EXPENSE', emoji: '📌' },
];

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

  // ── data (100% dữ liệu thực từ Backend, mặc định rỗng []) ──
  const [accounts,      setAccounts]      = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [categories,    setCategories]    = useState(DEFAULT_CATEGORIES);
  const [budgets,       setBudgets]       = useState([]);
  const [savingsGoals,  setSavingsGoals]  = useState([]);
  const [bills,         setBills]         = useState([]);
  const [notifications, setNotifications] = useState([]);

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
      setToken(null);
      setUser(null);
      setIsLive(false);
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setSavingsGoals([]);
      setBills([]);
      setNotifications([]);
      localStorage.removeItem('moneycare_jwt');
      localStorage.removeItem('moneycare_user');
      toast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
    };
    window.addEventListener('mc:unauthorized', handler);
    return () => window.removeEventListener('mc:unauthorized', handler);
  }, [toast]);

  // ── sync from backend ──
  const syncAll = useCallback(async () => {
    if (!token) return;
    setLoad('sync', true);
    try {
      const [accs, txs, cats, buds, goals, bls, notifs] = await Promise.allSettled([
        api.getAccounts(), api.getTransactions(), api.getCategories(),
        api.getBudgets(), api.getSavingsGoals(), api.getBills(), api.getNotifications(),
      ]);
      if (accs.status === 'fulfilled' && Array.isArray(accs.value)) setAccounts(accs.value);
      if (txs.status  === 'fulfilled' && Array.isArray(txs.value)) setTransactions(txs.value);
      if (cats.status === 'fulfilled' && Array.isArray(cats.value) && cats.value.length > 0) setCategories(cats.value);
      if (buds.status === 'fulfilled' && Array.isArray(buds.value)) setBudgets(buds.value);
      if (goals.status=== 'fulfilled' && Array.isArray(goals.value)) setSavingsGoals(goals.value);
      if (bls.status  === 'fulfilled' && Array.isArray(bls.value)) setBills(bls.value);
      if (notifs.status==='fulfilled' && Array.isArray(notifs.value)) setNotifications(notifs.value);
    } catch (e) {
      toast('Lỗi đồng bộ dữ liệu: ' + e.message, 'error');
    } finally {
      setLoad('sync', false);
    }
  }, [token, toast]);

  // Tự động đồng bộ dữ liệu thực khi có token
  useEffect(() => {
    if (token) {
      setIsLive(true);
      syncAll();
    } else {
      setIsLive(false);
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setSavingsGoals([]);
      setBills([]);
      setNotifications([]);
    }
  }, [token, syncAll]);

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

      // Đồng bộ dữ liệu tài khoản từ backend
      await syncAll();
      toast(`Chào mừng ${res.user?.fullName || res.user?.email}!`);
      return true;
    } catch (e) {
      toast('Đăng nhập thất bại: ' + e.message, 'error');
      return false;
    } finally {
      setLoad('auth', false);
    }
  }, [syncAll, toast]);

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
  }, [doLogin, toast]);

  // ── logout ──
  const doLogout = useCallback(() => {
    localStorage.removeItem('moneycare_jwt');
    localStorage.removeItem('moneycare_user');
    setToken(null);
    setUser(null);
    setIsLive(false);
    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setBills([]);
    setNotifications([]);
    toast('Đã đăng xuất thành công.');
  }, [toast]);

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

  // ── deposit / top up account ──
  const depositAccount = useCallback(async ({ accountId, amount, note, source }) => {
    setLoad('deposit', true);
    try {
      const acc = accounts.find(a => a.id === Number(accountId));
      const accName = acc?.accountName || 'Ví';
      const numAmt = Number(amount);
      const title = note || `Nạp tiền vào ${accName}`;

      const payload = {
        accountId: Number(accountId),
        amount: numAmt,
        type: 'INCOME',
        categoryId: categories.find(c => c.categoryType === 'THU' || c.type === 'INCOME')?.id || 1,
        title,
        description: note || `Nạp tiền qua ${source || 'Chuyển khoản'}`,
        transactionDate: new Date().toISOString(),
      };

      if (isLive && token) {
        await api.createTransaction(payload);
        await syncAll();
      } else {
        const id = Date.now();
        setTransactions(prev => [{ ...payload, id, createdAt: new Date().toISOString() }, ...prev]);
        setAccounts(prev => prev.map(a =>
          a.id === Number(accountId) ? { ...a, balance: (a.balance || 0) + numAmt } : a
        ));
      }
      toast(`Nạp thành công +${numAmt.toLocaleString('vi-VN')} đ vào ${accName}! 🎉`);
      return true;
    } catch (e) {
      toast('Lỗi nạp tiền: ' + e.message, 'error');
      return false;
    } finally {
      setLoad('deposit', false);
    }
  }, [accounts, categories, isLive, token, syncAll, toast]);

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
      addAccount, depositAccount, addBudget, deleteBudget,
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
