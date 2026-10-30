import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }) {
  const { user, token, doLogout, toast, setAppMode } = useApp();

  // Admin Screen Navigation
  const VALID_ADMIN_SCREENS = [
    'dashboard',
    'users',
    'accounts',
    'transactions',
    'categories',
    'budgets',
    'savings-goals',
    'bills',
    'reports',
    'audit-logs',
    'settings',
  ];

  const [adminScreen, setAdminScreenRaw] = useState(() => {
    const saved = localStorage.getItem('mc_admin_screen');
    return VALID_ADMIN_SCREENS.includes(saved) ? saved : 'dashboard';
  });

  const setAdminScreen = useCallback((scr) => {
    if (VALID_ADMIN_SCREENS.includes(scr)) {
      localStorage.setItem('mc_admin_screen', scr);
    }
    setAdminScreenRaw(scr);
  }, []);

  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState({});
  const setLoad = (k, v) => setLoading(prev => ({ ...prev, [k]: v }));

  // Entities — khởi tạo rỗng, sẽ load từ Backend
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [bills, setBills] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Log activity
  const logActivity = useCallback((action, target, result = 'SUCCESS', details = '') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actor: user?.fullName ? `${user.fullName} (Admin)` : 'admin (Super Admin)',
      action,
      target,
      result,
      details: details || 'Thao tác qua Admin Dashboard',
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, [user]);

  // Sync with Backend
  const syncWithBackend = useCallback(async () => {
    if (!token) return;
    setLoad('sync', true);
    try {
      const [u, a, tx, c, b, g, bl, usrs, logs] = await Promise.allSettled([
        api.getMe(),
        api.getAccounts(),
        api.getTransactions(),
        api.getCategories(),
        api.getBudgets(),
        api.getSavingsGoals(),
        api.getBills(),
        api.getUsers(),
        api.getActivityLogs(),
      ]);

      // Build userMap: { userId -> fullName } để resolve tên người dùng
      let userMap = {};
      let mappedUsers = [];
      if (usrs.status === 'fulfilled' && Array.isArray(usrs.value)) {
        mappedUsers = usrs.value.map((item, idx) => ({
          ...item,
          code: `ND${String(item.id || idx + 1).padStart(3, '0')}`,
          // id_vai_tro = 1 -> ADMIN, id_vai_tro = 2 -> USER (theo bảng VaiTro trong DB)
          role: item.roleId === 1 ? 'ADMIN' : 'USER',
          status: item.status || 'ACTIVE',
          accountsCount: item.accountsCount || 0,
          avatar: null, // Dùng initials avatar, không dùng ảnh mẫu bên ngoài
          createdAt: item.createdAt ? String(item.createdAt).split('T')[0] : null,
        }));
        if (mappedUsers.length > 0) setUsers(mappedUsers);
        userMap = Object.fromEntries(mappedUsers.map(u => [u.id, u.fullName]));
      }

      if (a.status === 'fulfilled' && Array.isArray(a.value) && a.value.length > 0) {
        setAccounts(a.value.map((item, idx) => ({
          ...item,
          code: `TK${String(item.id || idx + 1).padStart(3, '0')}`,
          balance: Number(item.balance) || 0,
          accountType: item.accountType || 'TK Thanh toán',
          // userName resolve từ userId qua userMap
          userName: userMap[item.userId] || item.userName || `Người dùng #${item.userId}`,
          createdAt: item.createdAt ? String(item.createdAt).split('T')[0] : null,
        })));
      }

      if (tx.status === 'fulfilled' && Array.isArray(tx.value) && tx.value.length > 0) {
        setTransactions(tx.value.map((item, idx) => ({
          ...item,
          code: `GD${String(item.id || idx + 1).padStart(5, '0')}`,
          amount: Number(item.amount) || 0,
          // type là enum CategoryType: INCOME / EXPENSE / TRANSFER
          type: String(item.type || 'EXPENSE'),
          transactionDate: item.transactionDate ? String(item.transactionDate).split('T')[0] : null,
          categoryName: item.categoryName || '—',
          // userName resolve từ userId
          userName: userMap[item.userId] || item.userName || `Người dùng #${item.userId}`,
        })));
      }

      if (c.status === 'fulfilled' && Array.isArray(c.value) && c.value.length > 0) {
        setCategories(c.value.map((item, idx) => ({
          ...item,
          code: `DM${String(item.id || idx + 1).padStart(3, '0')}`,
          txCount: item.txCount || 0,
        })));
      }

      if (b.status === 'fulfilled' && Array.isArray(b.value) && b.value.length > 0) {
        setBudgets(b.value.map(item => ({
          ...item,
          amount: Number(item.amount) || 0,
          spent: Number(item.spent) || 0, // backend chưa trả về spent -> hiển thị 0
          period: item.period || (item.startDate && item.endDate ? `${item.startDate} - ${item.endDate}` : '—'),
          userName: userMap[item.userId] || item.userName || `Người dùng #${item.userId}`,
          status: item.status || 'ACTIVE',
        })));
      }

      if (g.status === 'fulfilled' && Array.isArray(g.value) && g.value.length > 0) {
        setSavingsGoals(g.value.map(item => ({
          ...item,
          targetAmount: Number(item.targetAmount) || 0,
          currentAmount: Number(item.currentAmount) || 0,
          userName: userMap[item.userId] || item.userName || `Người dùng #${item.userId}`,
          name: item.name || item.goalName || 'Mục tiêu',
          startDate: item.startDate ? String(item.startDate) : null,
          targetDate: item.targetDate ? String(item.targetDate) : null,
        })));
      }

      if (bl.status === 'fulfilled' && Array.isArray(bl.value) && bl.value.length > 0) {
        setBills(bl.value.map((item, idx) => ({
          ...item,
          code: `HD${String(item.id || idx + 1).padStart(4, '0')}`,
          // expectedAmount là tên field trong Bill entity
          amount: Number(item.expectedAmount) || Number(item.amount) || 0,
          userName: userMap[item.userId] || item.userName || `Người dùng #${item.userId}`,
          name: item.name || 'Hóa đơn',
          dueDate: item.dueDate ? String(item.dueDate) : null,
          paidDate: item.paidDate ? String(item.paidDate) : null,
          provider: item.provider || item.description || '—',
          status: item.status || 'ACTIVE',
        })));
      }

      if (logs.status === 'fulfilled' && Array.isArray(logs.value) && logs.value.length > 0) {
        setActivityLogs(logs.value.map(l => ({
          id: l.id,
          timestamp: l.createdAt ? String(l.createdAt).replace('T', ' ').slice(0, 16) : new Date().toISOString().replace('T', ' ').slice(0, 16),
          // Resolve actor name từ userId
          actor: userMap[l.userId] ? `${userMap[l.userId]}` : (l.userId ? `User #${l.userId}` : 'Hệ thống'),
          action: l.action || 'Thao tác',
          target: l.objectType || 'Dữ liệu',
          result: 'SUCCESS',
          details: l.description || '',
        })));
      }

      toast('Đồng bộ dữ liệu thành công! 🚀');
    } catch (err) {
      console.error('Admin sync error:', err);
    } finally {
      setLoad('sync', false);
    }
  }, [token, toast]);

  // Tự động đồng bộ với backend khi vào Admin
  useEffect(() => {
    if (token) {
      syncWithBackend();
    }
  }, [token, syncWithBackend]);

  // ── CRUD Functions gọi trực tiếp Spring Boot API ──

  // 1. USER CRUD
  const addUser = useCallback(async (userData) => {
    try {
      await api.createUser(userData);
      logActivity('Thêm người dùng', `${userData.fullName} (${userData.email})`, 'SUCCESS');
      toast('Thêm người dùng thành công! 🎉');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi thêm người dùng: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const updateUser = useCallback(async (id, userData) => {
    try {
      await api.updateUser(id, userData);
      logActivity('Cập nhật người dùng', `#${id} - ${userData.fullName || ''}`, 'SUCCESS');
      toast('Cập nhật người dùng thành công! ✅');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi cập nhật người dùng: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const deleteUser = useCallback(async (userId) => {
    try {
      await api.deleteUser(userId);
      logActivity('Xóa người dùng', `ID: #${userId}`, 'SUCCESS');
      toast('Đã xóa người dùng thành công! 🗑️');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi xóa người dùng: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const toggleUserLock = useCallback(async (u) => {
    try {
      const next = u.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
      await api.updateUser(u.id, { ...u, status: next });
      logActivity(next === 'LOCKED' ? 'Khóa người dùng' : 'Mở khóa người dùng', u.fullName, 'SUCCESS');
      toast(`Đã ${next === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản thành công!`);
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi đổi trạng thái tài khoản: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  // 2. ACCOUNT CRUD
  const addAccount = useCallback(async (accData) => {
    try {
      await api.createAccount(accData);
      logActivity('Thêm tài khoản', `${accData.accountName}`, 'SUCCESS');
      toast('Thêm tài khoản thành công! 💳');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi thêm tài khoản: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const updateAccount = useCallback(async (id, accData) => {
    try {
      await api.updateAccount(id, accData);
      logActivity('Cập nhật tài khoản', `#${id} - ${accData.accountName || ''}`, 'SUCCESS');
      toast('Cập nhật tài khoản thành công! ✅');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi cập nhật tài khoản: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const deleteAccount = useCallback(async (id) => {
    try {
      await api.deleteAccount(id);
      logActivity('Xóa tài khoản', `ID: #${id}`, 'SUCCESS');
      toast('Đã xóa tài khoản ví thành công! 🗑️');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi xóa tài khoản: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const toggleAccountStatus = useCallback(async (a) => {
    try {
      const next = a.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await api.updateAccount(a.id, { ...a, status: next });
      logActivity('Đổi trạng thái tài khoản', `${a.accountName} -> ${next}`, 'SUCCESS');
      toast('Đã cập nhật trạng thái tài khoản!');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi đổi trạng thái: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  // 3. CATEGORY CRUD
  const addCategory = useCallback(async (catData) => {
    try {
      await api.createCategory(catData);
      logActivity('Thêm danh mục', catData.categoryName, 'SUCCESS');
      toast('Đã thêm danh mục mới! 🏷️');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi thêm danh mục: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const updateCategory = useCallback(async (id, catData) => {
    try {
      await api.updateCategory(id, catData);
      logActivity('Cập nhật danh mục', `#${id} - ${catData.categoryName || ''}`, 'SUCCESS');
      toast('Cập nhật danh mục thành công! ✅');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi cập nhật danh mục: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await api.deleteCategory(id);
      logActivity('Xóa danh mục', `ID: #${id}`, 'SUCCESS');
      toast('Đã xóa danh mục thành công! 🗑️');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi xóa danh mục: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const toggleCategoryStatus = useCallback(async (c) => {
    try {
      const next = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.updateCategory(c.id, { ...c, status: next });
      logActivity('Đổi trạng thái danh mục', `${c.categoryName} -> ${next}`, 'SUCCESS');
      toast('Đã cập nhật trạng thái danh mục!');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi cập nhật trạng thái danh mục: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  // 4. BUDGET CRUD
  const addBudget = useCallback(async (bData) => {
    try {
      await api.createBudget(bData);
      logActivity('Tạo ngân sách', `${bData.budgetName}`, 'SUCCESS');
      toast('Đã tạo ngân sách thành công! 📊');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi tạo ngân sách: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const updateBudget = useCallback(async (id, bData) => {
    try {
      await api.updateBudget(id, bData);
      logActivity('Cập nhật ngân sách', `#${id} - ${bData.budgetName || ''}`, 'SUCCESS');
      toast('Đã cập nhật ngân sách! ✅');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi cập nhật ngân sách: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const deleteBudget = useCallback(async (id) => {
    try {
      await api.deleteBudget(id);
      logActivity('Xóa ngân sách', `ID: #${id}`, 'SUCCESS');
      toast('Đã xóa ngân sách thành công! 🗑️');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi xóa ngân sách: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  // 5. SAVINGS GOAL CRUD
  const addSavingsGoal = useCallback(async (gData) => {
    try {
      await api.createSavingsGoal(gData);
      logActivity('Tạo mục tiêu tiết kiệm', `${gData.name}`, 'SUCCESS');
      toast('Đã tạo mục tiêu tiết kiệm! 🎯');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi tạo mục tiêu: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const updateSavingsGoal = useCallback(async (id, gData) => {
    try {
      await api.updateSavingsGoal(id, gData);
      logActivity('Cập nhật mục tiêu', `#${id} - ${gData.name || ''}`, 'SUCCESS');
      toast('Đã cập nhật mục tiêu tiết kiệm! ✅');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi cập nhật mục tiêu: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const deleteSavingsGoal = useCallback(async (id) => {
    try {
      await api.deleteSavingsGoal(id);
      logActivity('Xóa mục tiêu', `ID: #${id}`, 'SUCCESS');
      toast('Đã xóa mục tiêu tiết kiệm! 🗑️');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi xóa mục tiêu: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  // 6. BILL CRUD
  const addBill = useCallback(async (bData) => {
    try {
      await api.createBill(bData);
      logActivity('Thêm hóa đơn', `${bData.name}`, 'SUCCESS');
      toast('Đã thêm hóa đơn thành công! 🧾');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi thêm hóa đơn: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const updateBill = useCallback(async (id, bData) => {
    try {
      await api.updateBill(id, bData);
      logActivity('Cập nhật hóa đơn', `#${id} - ${bData.name || ''}`, 'SUCCESS');
      toast('Đã cập nhật hóa đơn! ✅');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi cập nhật hóa đơn: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const deleteBill = useCallback(async (id) => {
    try {
      await api.deleteBill(id);
      logActivity('Xóa hóa đơn', `ID: #${id}`, 'SUCCESS');
      toast('Đã xóa hóa đơn thành công! 🗑️');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi xóa hóa đơn: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const markBillPaid = useCallback(async (b) => {
    try {
      await api.updateBill(b.id, { ...b, status: 'PAID' });
      logActivity('Thanh toán hóa đơn', b.name, 'SUCCESS');
      toast('Hóa đơn đã được đánh dấu Đã thanh toán! ✅');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi cập nhật trạng thái hóa đơn: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  // 7. TRANSACTION DELETE
  const deleteTransaction = useCallback(async (id) => {
    try {
      await api.deleteTransaction(id);
      logActivity('Xóa giao dịch', `ID: #${id}`, 'SUCCESS');
      toast('Đã xóa giao dịch thành công! 🗑️');
      await syncWithBackend();
      return true;
    } catch (e) {
      toast('Lỗi xóa giao dịch: ' + e.message, 'error');
      return false;
    }
  }, [logActivity, toast, syncWithBackend]);

  const exitAdminMode = useCallback(() => {
    setAppMode('user');
    toast('Đã chuyển về Giao diện Người dùng. 👤');
  }, [setAppMode, toast]);

  return (
    <AdminContext.Provider
      value={{
        adminUser: user,
        adminScreen,
        setAdminScreen,
        exitAdminMode,
        globalSearch,
        setGlobalSearch,
        loading,
        toast,
        users,
        accounts,
        transactions,
        categories,
        budgets,
        savingsGoals,
        bills,
        activityLogs,
        doLogout,
        logActivity,
        syncWithBackend,
        // CRUD Users
        addUser,
        updateUser,
        deleteUser,
        toggleUserLock,
        // CRUD Accounts
        addAccount,
        updateAccount,
        deleteAccount,
        toggleAccountStatus,
        // CRUD Categories
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,
        // CRUD Budgets
        addBudget,
        updateBudget,
        deleteBudget,
        // CRUD Savings
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        // CRUD Bills
        addBill,
        updateBill,
        deleteBill,
        markBillPaid,
        // CRUD Transactions
        deleteTransaction,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
