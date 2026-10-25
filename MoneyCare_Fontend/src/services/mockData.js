// Mock data service — dữ liệu mẫu chạy offline không cần backend
// Tách riêng khỏi api.js để dễ thay thế khi kết nối thật

export const MOCK_USER = {
  id: 1,
  fullName: 'Minh Cường',
  email: 'cuong@moneycare.vn',
  phone: '0912345678',
};

export const MOCK_ACCOUNTS = [
  { id: 1, accountName: 'Timo Digital Bank',       accountType: 'NGAN_HANG', balance: 42500000, currency: 'VND', description: '•••• 9821', status: 'ACTIVE' },
  { id: 2, accountName: 'Ví MoMo Pay',              accountType: 'VI_DIEN_TU', balance: 6850000,  currency: 'VND', description: '0912•••888', status: 'ACTIVE' },
  { id: 3, accountName: 'Vietcombank Priority',     accountType: 'NGAN_HANG', balance: 95000000, currency: 'VND', description: '•••• 5612', status: 'ACTIVE' },
  { id: 4, accountName: 'Techcombank Visa Credit',  accountType: 'THE_TIN_DUNG', balance: 15000000, currency: 'VND', description: 'Hạn trả: 15/11', status: 'ACTIVE' },
  { id: 5, accountName: 'Tiền mặt',                 accountType: 'TIEN_MAT', balance: 4170000,  currency: 'VND', description: 'Ví cá nhân', status: 'ACTIVE' },
];

const now = new Date();
const d = (daysAgo, h = 9, m = 0) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
};

export const MOCK_TRANSACTIONS = [
  { id: 1,  accountId: 1, categoryId: 2, type: 'EXPENSE', amount: 65000,    title: 'Starbucks Coffee – Vincom',       description: 'Cà phê sáng', transactionDate: d(0, 8, 30) },
  { id: 2,  accountId: 3, categoryId: 1, type: 'INCOME',  amount: 30000000, title: 'Lương tháng 10/2026',             description: '', transactionDate: d(1, 17, 0) },
  { id: 3,  accountId: 2, categoryId: 3, type: 'EXPENSE', amount: 1450000,  title: 'Shopee – Bàn phím cơ Keychron',  description: 'Mua sắm', transactionDate: d(2, 21, 15) },
  { id: 4,  accountId: 2, categoryId: 5, type: 'EXPENSE', amount: 85000,    title: 'Grab Car đi gặp khách hàng',     description: 'Di chuyển', transactionDate: d(2, 14, 20) },
  { id: 5,  accountId: 3, categoryId: 1, type: 'INCOME',  amount: 2500000,  title: 'Thưởng KPI Quý 3',               description: 'Thưởng hiệu suất', transactionDate: d(4, 10, 0) },
  { id: 6,  accountId: 1, categoryId: 2, type: 'EXPENSE', amount: 620000,   title: 'WinMart Times City',             description: 'Siêu thị', transactionDate: d(5, 19, 40) },
  { id: 7,  accountId: 1, categoryId: 6, type: 'EXPENSE', amount: 330000,   title: 'Hóa đơn Internet FPT',           description: 'Cáp quang', transactionDate: d(9, 9, 0) },
  { id: 8,  accountId: 2, categoryId: 4, type: 'EXPENSE', amount: 400000,   title: 'Lotteria – Tiệc nhỏ bạn bè',    description: 'Ăn uống', transactionDate: d(10, 19, 0) },
  { id: 9,  accountId: 3, categoryId: 7, type: 'EXPENSE', amount: 1200000,  title: 'Phòng gym California',           description: 'Tháng 10', transactionDate: d(12, 8, 0) },
  { id: 10, accountId: 3, categoryId: 1, type: 'INCOME',  amount: 500000,   title: 'Chuyển khoản từ Tuấn',           description: 'Trả nợ', transactionDate: d(14, 16, 0) },
];

export const MOCK_CATEGORIES = [
  { id: 1, categoryName: 'Thu nhập',   type: 'INCOME',  icon: 'Banknote',    color: '#16A085' },
  { id: 2, categoryName: 'Ăn uống',    type: 'EXPENSE', icon: 'Utensils',    color: '#E89B3B' },
  { id: 3, categoryName: 'Mua sắm',    type: 'EXPENSE', icon: 'ShoppingBag', color: '#6339DB' },
  { id: 4, categoryName: 'Giải trí',   type: 'EXPENSE', icon: 'Film',        color: '#E74C3C' },
  { id: 5, categoryName: 'Di chuyển',  type: 'EXPENSE', icon: 'Car',         color: '#2980B9' },
  { id: 6, categoryName: 'Hóa đơn',    type: 'EXPENSE', icon: 'Receipt',     color: '#8E44AD' },
  { id: 7, categoryName: 'Sức khỏe',   type: 'EXPENSE', icon: 'HeartPulse',  color: '#DC4444' },
  { id: 8, categoryName: 'Học tập',    type: 'EXPENSE', icon: 'BookOpen',    color: '#27AE60' },
  { id: 9, categoryName: 'Khác',       type: 'EXPENSE', icon: 'MoreHorizontal', color: '#95A5A6' },
];

export const MOCK_BUDGETS = [
  { id: 1, budgetName: 'Ăn uống & Cà phê',    categoryId: 2, limitAmount: 6000000,  startDate: '2026-10-01', endDate: '2026-10-31' },
  { id: 2, budgetName: 'Mua sắm & Quần áo',   categoryId: 3, limitAmount: 4000000,  startDate: '2026-10-01', endDate: '2026-10-31' },
  { id: 3, budgetName: 'Di chuyển',            categoryId: 5, limitAmount: 1500000,  startDate: '2026-10-01', endDate: '2026-10-31' },
  { id: 4, budgetName: 'Hóa đơn dịch vụ',     categoryId: 6, limitAmount: 2500000,  startDate: '2026-10-01', endDate: '2026-10-31' },
  { id: 5, budgetName: 'Giải trí',             categoryId: 4, limitAmount: 2000000,  startDate: '2026-10-01', endDate: '2026-10-31' },
];

export const MOCK_SAVINGS_GOALS = [
  { id: 1, goalName: 'Quỹ Khẩn Cấp (6 tháng)', targetAmount: 60000000, currentAmount: 51000000, targetDate: '2026-12-31', status: 'IN_PROGRESS' },
  { id: 2, goalName: 'Nâng cấp MacBook M3 Pro',  targetAmount: 50000000, currentAmount: 30000000, targetDate: '2026-12-15', status: 'IN_PROGRESS' },
  { id: 3, goalName: 'Du Lịch Tokyo & Kyoto',    targetAmount: 45000000, currentAmount: 15000000, targetDate: '2027-04-30', status: 'IN_PROGRESS' },
];

export const MOCK_BILLS = [
  { id: 1, billName: 'Tiền điện EVN',      amount: 1120000, dueDate: '2026-10-28', status: 'PENDING',  description: 'PE0200039281' },
  { id: 2, billName: 'Cáp quang FPT',      amount: 330000,  dueDate: '2026-11-05', status: 'PAID',     description: 'Gói Super200' },
  { id: 3, billName: 'Netflix Premium 4K', amount: 260000,  dueDate: '2026-11-18', status: 'PAID',     description: 'Trừ thẻ Timo' },
  { id: 4, billName: 'Nước Viwaco',        amount: 145000,  dueDate: '2026-11-15', status: 'PAID',     description: 'Định kỳ ngày 15' },
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Hóa đơn EVN sắp đến hạn!',         message: 'Hóa đơn tiền điện 1.120.000 đ đến hạn 28/10.', type: 'WARNING', isRead: false },
  { id: 2, title: 'Cảnh báo ngân sách "Mua sắm"',     message: 'Bạn đã sử dụng 97% hạn mức mua sắm tháng 10.', type: 'DANGER',  isRead: false },
  { id: 3, title: 'Mục tiêu MacBook đạt 60%',          message: 'Tuyệt vời! Chỉ còn thiếu 20.000.000 đ nữa.', type: 'SUCCESS', isRead: true  },
];
