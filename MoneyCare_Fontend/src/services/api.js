// MoneyCare API Service — kết nối Spring Boot REST API JWT
// Base URL qua Vite proxy hoặc trực tiếp

const getBaseUrl = () => {
  return localStorage.getItem('moneycare_api_url') || '';
};

const getToken = () => localStorage.getItem('moneycare_jwt') || null;

async function request(endpoint, method = 'GET', body = null) {
  const base = getBaseUrl();
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${base}${endpoint}`, opts);

  if (res.status === 401) {
    if (endpoint === '/api/auth/login') {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }
    // Token hết hạn — xóa và thông báo
    localStorage.removeItem('moneycare_jwt');
    localStorage.removeItem('moneycare_user');
    window.dispatchEvent(new CustomEvent('mc:unauthorized'));
    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch {
      msg = (await res.text()) || msg;
    }
    throw new Error(msg);
  }

  const ct = res.headers.get('content-type');
  if (ct && ct.includes('application/json')) return res.json();
  return res.text();
}

// ── AUTH ────────────────────────────────────────────────────────
export const login = (email, password) =>
  request('/api/auth/login', 'POST', { email, password });

export const register = (data) =>
  request('/api/users', 'POST', data);

export const getMe = () => request('/api/auth/me');

// ── ACCOUNTS ─────────────────────────────────────────────────────
export const getAccounts    = ()         => request('/api/accounts');
export const createAccount  = (data)     => request('/api/accounts', 'POST', data);
export const updateAccount  = (id, data) => request(`/api/accounts/${id}`, 'PUT', data);
export const deleteAccount  = (id)       => request(`/api/accounts/${id}`, 'DELETE');

// ── TRANSACTIONS ─────────────────────────────────────────────────
export const getTransactions  = ()         => request('/api/transactions');
export const createTransaction = (data)    => request('/api/transactions', 'POST', data);
export const updateTransaction = (id, data)=> request(`/api/transactions/${id}`, 'PUT', data);
export const deleteTransaction = (id)      => request(`/api/transactions/${id}`, 'DELETE');

// ── CATEGORIES ───────────────────────────────────────────────────
export const getCategories   = ()         => request('/api/categories');
export const createCategory  = (data)     => request('/api/categories', 'POST', data);
export const deleteCategory  = (id)       => request(`/api/categories/${id}`, 'DELETE');

// ── BUDGETS ──────────────────────────────────────────────────────
export const getBudgets      = ()         => request('/api/budgets');
export const getBudgetSummary= (userId)   => request(`/api/budgets/user/${userId}/summary`);
export const createBudget    = (data)     => request('/api/budgets', 'POST', data);
export const updateBudget    = (id, data) => request(`/api/budgets/${id}`, 'PUT', data);
export const deleteBudget    = (id)       => request(`/api/budgets/${id}`, 'DELETE');

// ── SAVINGS GOALS ────────────────────────────────────────────────
export const getSavingsGoals  = ()         => request('/api/savings-goals');
export const createSavingsGoal= (data)     => request('/api/savings-goals', 'POST', data);
export const updateSavingsGoal= (id, data) => request(`/api/savings-goals/${id}`, 'PUT', data);
export const deleteSavingsGoal= (id)       => request(`/api/savings-goals/${id}`, 'DELETE');

export const getSavingsTx     = ()         => request('/api/savings-transactions');
export const createSavingsTx  = (data)     => request('/api/savings-transactions', 'POST', data);

// ── BILLS ────────────────────────────────────────────────────────
export const getBills         = ()         => request('/api/bills');
export const createBill       = (data)     => request('/api/bills', 'POST', data);
export const updateBill       = (id, data) => request(`/api/bills/${id}`, 'PUT', data);
export const deleteBill       = (id)       => request(`/api/bills/${id}`, 'DELETE');

export const getBillPayments  = ()         => request('/api/bill-payments');
export const createBillPayment= (data)     => request('/api/bill-payments', 'POST', data);

// ── NOTIFICATIONS ────────────────────────────────────────────────
export const getNotifications = ()         => request('/api/notifications');
export const updateNotification=(id, data) => request(`/api/notifications/${id}`, 'PUT', data);

// ── HEALTH CHECK ─────────────────────────────────────────────────
export async function checkHealth() {
  try {
    await fetch(`${getBaseUrl()}/api/categories`, {
      method: 'GET',
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      signal: AbortSignal.timeout(3000),
    });
    return true;
  } catch {
    return false;
  }
}
