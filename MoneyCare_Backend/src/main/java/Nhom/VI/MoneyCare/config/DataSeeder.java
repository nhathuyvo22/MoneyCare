package Nhom.VI.MoneyCare.config;

import Nhom.VI.MoneyCare.entity.*;
import Nhom.VI.MoneyCare.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final BillRepository billRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      AccountRepository accountRepository,
                      CategoryRepository categoryRepository,
                      TransactionRepository transactionRepository,
                      BudgetRepository budgetRepository,
                      SavingsGoalRepository savingsGoalRepository,
                      BillRepository billRepository,
                      ActivityLogRepository activityLogRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.billRepository = billRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        System.out.println(">>> [DataSeeder] Đang kiểm tra và khởi tạo dữ liệu mẫu cho hệ thống MoneyCare...");

        // 1. Seed Categories nếu chưa đủ
        List<Category> categories = categoryRepository.findAll();
        if (categories.size() < 10) {
            List<Category> newCats = Arrays.asList(
                    createCategory("Lương", CategoryType.INCOME, "Thu nhập tiền lương hàng tháng"),
                    createCategory("Thưởng", CategoryType.INCOME, "Tiền thưởng dự án, lễ tết"),
                    createCategory("Đầu tư", CategoryType.INCOME, "Lãi cổ phiếu, tiền gửi"),
                    createCategory("Ăn uống", CategoryType.EXPENSE, "Cơm, phở, cà phê, nhà hàng"),
                    createCategory("Mua sắm", CategoryType.EXPENSE, "Quần áo, đồ gia dụng, thiết bị"),
                    createCategory("Đi lại", CategoryType.EXPENSE, "Xăng xe, grab, bảo dưỡng"),
                    createCategory("Hóa đơn", CategoryType.EXPENSE, "Điện, nước, internet, rác"),
                    createCategory("Giải trí", CategoryType.EXPENSE, "Xem phim, du lịch, game"),
                    createCategory("Y tế & Sức khỏe", CategoryType.EXPENSE, "Thuốc men, khám sức khỏe"),
                    createCategory("Học tập", CategoryType.EXPENSE, "Khóa học, sách vở")
            );
            for (Category c : newCats) {
                boolean exists = categories.stream().anyMatch(cat -> cat.getCategoryName().equalsIgnoreCase(c.getCategoryName()));
                if (!exists) categoryRepository.save(c);
            }
            categories = categoryRepository.findAll();
            System.out.println(">>> [DataSeeder] Tổng số danh mục hiện tại: " + categories.size());
        }

        // 2. Seed Users nếu chưa đủ (Đảm bảo có cả Admin và nhiều User khác nhau)
        List<User> users = userRepository.findAll();
        String encodedPass = passwordEncoder.encode("123456");

        // Đảm bảo có tài khoản Admin (roleId = 1)
        boolean hasAdmin = users.stream().anyMatch(u -> u.getRoleId() != null && u.getRoleId() == 1L);
        if (!hasAdmin) {
            User admin = new User();
            admin.setRoleId(1L);
            admin.setFullName("Quản trị viên Hệ thống");
            admin.setEmail("admin@moneycare.vn");
            admin.setPassword(encodedPass);
            admin.setPhone("0988888888");
            admin.setStatus("ACTIVE");
            admin.setCreatedAt(LocalDateTime.now().minusDays(90));
            userRepository.save(admin);
        }

        List<User> sampleUsers = Arrays.asList(
                createUser("Nguyễn Văn An", "an.nguyen@gmail.com", "0901234567", 2L, encodedPass, 60),
                createUser("Trần Thị Bích", "bich.tran@gmail.com", "0912345678", 2L, encodedPass, 50),
                createUser("Lê Hoàng Cường", "cuong.le@gmail.com", "0923456789", 2L, encodedPass, 40),
                createUser("Phạm Thu Dung", "dung.pham@gmail.com", "0934567890", 2L, encodedPass, 30),
                createUser("Hoàng Minh Đức", "duc.hoang@gmail.com", "0945678901", 2L, encodedPass, 20)
        );
        for (User u : sampleUsers) {
            if (userRepository.findByEmail(u.getEmail()).isEmpty()) {
                userRepository.save(u);
            }
        }
        users = userRepository.findAll();
        System.out.println(">>> [DataSeeder] Tổng số người dùng hiện tại: " + users.size());

        // 3. Seed Accounts nếu chưa đủ (< 15 accounts)
        List<Account> accounts = accountRepository.findAll();
        if (accounts.size() < 15 && !users.isEmpty()) {
            for (User u : users) {
                List<Account> userAccs = accountRepository.findByUserId(u.getId());
                if (userAccs.isEmpty()) {
                    accountRepository.save(createAccount(u.getId(), 2L, "Techcombank - " + u.getFullName(), new BigDecimal("15000000")));
                    accountRepository.save(createAccount(u.getId(), 3L, "Ví MoMo - " + u.getFullName(), new BigDecimal("3500000")));
                    accountRepository.save(createAccount(u.getId(), 1L, "Tiền mặt - " + u.getFullName(), new BigDecimal("1200000")));
                }
            }
            accounts = accountRepository.findAll();
            System.out.println(">>> [DataSeeder] Đã bổ sung tài khoản ngân hàng / ví! Tổng: " + accounts.size());
        }

        users = userRepository.findAll();
        accounts = accountRepository.findAll();
        categories = categoryRepository.findAll();

        if (users.isEmpty() || accounts.isEmpty() || categories.isEmpty()) {
            System.out.println(">>> [DataSeeder] Chưa đủ thông tin user/account/category để tạo giao dịch.");
            return;
        }

        Random rand = new Random(42);

        // 4. Seed ~20 GiaoDich nếu chưa đủ (< 20 giao dịch)
        if (transactionRepository.count() < 20) {
            List<Transaction> txList = new ArrayList<>();
            String[] titles = {
                    "Lương tháng này", "Ăn trưa cơm văn phòng", "Cà phê gặp bạn bè",
                    "Mua sắm siêu thị WinMart", "Đổ xăng xe máy", "Thanh toán tiền điện",
                    "Đóng tiền internet FPT", "Xem phim CGV cuối tuần", "Mua thuốc cảm cúm",
                    "Thưởng dự án hoàn thành", "Mua sách lập trình", "Ăn tối buffet lẩu",
                    "Mua quà sinh nhật", "Sửa xe máy thay nhớt", "Mua đồ gia dụng Shopee",
                    "Tiền lãi tiết kiệm", "Mua thẻ tập gym", "Khám răng định kỳ",
                    "Nạp tiền điện thoại", "Uống trà sữa Gongcha"
            };

            for (int i = 0; i < 20; i++) {
                User u = users.get(rand.nextInt(users.size()));
                List<Account> userAccs = accountRepository.findByUserId(u.getId());
                Account acc = userAccs.isEmpty() ? accounts.get(0) : userAccs.get(rand.nextInt(userAccs.size()));
                Category cat = categories.get(rand.nextInt(categories.size()));

                Transaction tx = new Transaction();
                tx.setUserId(u.getId());
                tx.setAccountId(acc.getId());
                tx.setCategoryId(cat.getId());
                tx.setPaymentMethodId(rand.nextLong(3) + 1);
                tx.setType(cat.getType());
                tx.setTitle(titles[i % titles.length]);
                tx.setDescription("Giao dịch hệ thống MoneyCare");

                long amount = cat.getType() == CategoryType.INCOME
                        ? (rand.nextInt(15) + 5) * 1_000_000L
                        : (rand.nextInt(10) + 1) * 100_000L;
                tx.setAmount(new BigDecimal(amount));
                tx.setTransactionDate(LocalDateTime.now().minusDays(rand.nextInt(25)).minusHours(rand.nextInt(20)));
                tx.setCreatedAt(LocalDateTime.now());
                txList.add(tx);
            }
            transactionRepository.saveAll(txList);
            System.out.println(">>> [DataSeeder] Đã tạo thành công " + txList.size() + " giao dịch mẫu vào CSDL!");
        }

        // 5. Seed ~10 NganSach nếu chưa đủ (< 10)
        if (budgetRepository.count() < 10) {
            List<Budget> budgetList = new ArrayList<>();
            String[] budgetNames = {
                    "Ngân sách Ăn uống tháng này", "Hạn mức Mua sắm quý 4", "Hạn mức Đi lại xăng xe",
                    "Chi phí Tiền nhà & Hóa đơn", "Ngân sách Cà phê & Giải trí", "Chi phí Y tế gia đình",
                    "Quỹ Học tập phát triển bản thân", "Ngân sách Mua sắm Tết", "Chi tiêu Thể thao & Gym",
                    "Quỹ Tiếp khách đối tác"
            };

            LocalDate start = LocalDate.now().withDayOfMonth(1);
            LocalDate end = start.plusMonths(1).minusDays(1);

            for (int i = 0; i < budgetNames.length; i++) {
                User u = users.get(rand.nextInt(users.size()));
                Budget b = new Budget();
                b.setUserId(u.getId());
                b.setBudgetName(budgetNames[i]);
                b.setStartDate(start);
                b.setEndDate(end);
                b.setAmount(new BigDecimal((rand.nextInt(6) + 2) * 1_000_000L));
                b.setStatus("ACTIVE");
                b.setCreatedAt(LocalDateTime.now().minusDays(rand.nextInt(15)));
                budgetList.add(b);
            }
            budgetRepository.saveAll(budgetList);
            System.out.println(">>> [DataSeeder] Đã tạo thành công " + budgetList.size() + " ngân sách vào CSDL!");
        }

        // 6. Seed ~12 HoaDon nếu chưa đủ (< 12)
        if (billRepository.count() < 12) {
            List<Bill> billList = new ArrayList<>();
            String[][] billTemplates = {
                    {"Hóa đơn tiền điện sinh hoạt", "Điện lực EVN", "850000"},
                    {"Hóa đơn nước máy gia đình", "Công ty Cấp nước Sawaco", "180000"},
                    {"Cước Internet cáp quang FPT", "FPT Telecom", "275000"},
                    {"Gói truyền hình K+ & Netflix", "Netflix & K+", "260000"},
                    {"Phí dịch vụ & Quản lý chung cư", "Ban quản lý tòa nhà", "650000"},
                    {"Cước điện thoại Viettel trả sau", "Tập đoàn Viettel", "200000"},
                    {"Hóa đơn tiền điện văn phòng", "Điện lực EVN", "1450000"},
                    {"Bảo hiểm sức khỏe định kỳ", "Bảo hiểm Bảo Việt", "1200000"},
                    {"Tiền gửi xe ô tô tháng", "Bãi xe thông minh", "1500000"},
                    {"Cước Internet VNPT cáp quang", "VNPT Telecom", "320000"},
                    {"Hóa đơn mua nước khoáng đóng bình", "Lavie Việt Nam", "150000"},
                    {"Hóa đơn tiền rác và vệ sinh môi trường", "Công ty Môi trường đô thị", "60000"}
            };

            for (int i = 0; i < billTemplates.length; i++) {
                User u = users.get(rand.nextInt(users.size()));
                String[] tpl = billTemplates[i];
                Bill b = new Bill();
                b.setUserId(u.getId());
                b.setName(tpl[0]);
                b.setDescription(tpl[1]);
                b.setExpectedAmount(new BigDecimal(tpl[2]));
                b.setCreatedDate(LocalDate.now().minusDays(rand.nextInt(20)));
                b.setDueDate(LocalDate.now().plusDays(rand.nextInt(15)));
                b.setStatus(i % 3 == 0 ? "PAID" : "ACTIVE");
                billList.add(b);
            }
            billRepository.saveAll(billList);
            System.out.println(">>> [DataSeeder] Đã tạo thành công " + billList.size() + " hóa đơn vào CSDL!");
        }

        // 7. Seed ~8 MucTieuTietKiem nếu chưa đủ (< 8)
        if (savingsGoalRepository.count() < 8) {
            List<SavingsGoal> goalList = new ArrayList<>();
            String[][] goalTemplates = {
                    {"Du lịch Nhật Bản mùa hoa anh đào", "50000000"},
                    {"Mua xe máy Honda SH 160i", "95000000"},
                    {"Quỹ dự phòng khẩn cấp 6 tháng", "60000000"},
                    {"Mua Laptop MacBook Pro M3", "45000000"},
                    {"Tiền học Thạc sĩ Quản trị", "80000000"},
                    {"Mua điện thoại iPhone 16 Pro", "32000000"},
                    {"Tích lũy tiền cưới và xây nhà", "300000000"},
                    {"Khóa học chứng chỉ quốc tế", "25000000"}
            };

            for (int i = 0; i < goalTemplates.length; i++) {
                User u = users.get(rand.nextInt(users.size()));
                String[] tpl = goalTemplates[i];
                SavingsGoal g = new SavingsGoal();
                g.setUserId(u.getId());
                g.setName(tpl[0]);
                g.setTargetAmount(new BigDecimal(tpl[1]));
                g.setStartDate(LocalDate.now().minusDays(rand.nextInt(40)));
                g.setTargetDate(LocalDate.now().plusMonths(rand.nextInt(12) + 3));
                g.setDescription("Mục tiêu tài chính cá nhân");
                g.setStatus("ACTIVE");
                goalList.add(g);
            }
            savingsGoalRepository.saveAll(goalList);
            System.out.println(">>> [DataSeeder] Đã tạo thành công " + goalList.size() + " mục tiêu tiết kiệm vào CSDL!");
        }

        // 8. Seed ~15 NhatKyHoatDong nếu chưa đủ (< 15)
        if (activityLogRepository.count() < 15) {
            List<ActivityLog> logList = new ArrayList<>();
            String[][] logTemplates = {
                    {"Đăng nhập", "Hệ thống", "Đăng nhập thành công qua giao diện web"},
                    {"Tạo giao dịch", "Giao dịch", "Thêm giao dịch thu nhập tiền lương"},
                    {"Tạo giao dịch", "Giao dịch", "Thêm chi tiêu ăn uống nhà hàng"},
                    {"Thanh toán hóa đơn", "Hóa đơn", "Đánh dấu hóa đơn tiền điện đã nộp"},
                    {"Tạo ngân sách", "Ngân sách", "Thiết lập hạn mức chi tiêu ăn uống"},
                    {"Thêm tài khoản ví", "Tài khoản", "Liên kết ví MoMo thành công"},
                    {"Cập nhật mục tiêu", "Mục tiêu tiết kiệm", "Nạp thêm tiền vào quỹ du lịch"},
                    {"Xuất báo cáo", "Báo cáo", "Xuất file CSV thống kê chi tiêu tháng"},
                    {"Đổi mật khẩu", "Bảo mật", "Cập nhật mật khẩu tài khoản thành công"},
                    {"Khóa tài khoản", "Người dùng", "Kiểm tra hoạt động bất thường"},
                    {"Cập nhật danh mục", "Danh mục", "Đổi màu nhận diện danh mục"},
                    {"Xem lịch sử ví", "Tài khoản", "Kiểm tra biến động số dư tuần qua"}
            };

            for (int i = 0; i < logTemplates.length; i++) {
                User u = users.get(rand.nextInt(users.size()));
                String[] tpl = logTemplates[i];
                ActivityLog log = new ActivityLog();
                log.setUserId(u.getId());
                log.setAction(tpl[0]);
                log.setObjectType(tpl[1]);
                log.setObjectId((long) (rand.nextInt(20) + 1));
                log.setDescription(tpl[2]);
                log.setCreatedAt(LocalDateTime.now().minusHours(rand.nextInt(120)));
                logList.add(log);
            }
            activityLogRepository.saveAll(logList);
            System.out.println(">>> [DataSeeder] Đã tạo thành công " + logList.size() + " nhật ký hoạt động vào CSDL!");
        }

        System.out.println(">>> [DataSeeder] Hoàn thành nạp dữ liệu mẫu ban đầu vào MySQL!");
    }

    private User createUser(String fullName, String email, String phone, Long roleId, String pass, int daysAgo) {
        User u = new User();
        u.setFullName(fullName);
        u.setEmail(email);
        u.setPhone(phone);
        u.setRoleId(roleId);
        u.setPassword(pass);
        u.setStatus("ACTIVE");
        u.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        return u;
    }

    private Account createAccount(Long userId, Long typeId, String name, BigDecimal balance) {
        Account a = new Account();
        a.setUserId(userId);
        a.setAccountTypeId(typeId);
        a.setAccountName(name);
        a.setOpeningBalance(balance);
        a.setBalance(balance);
        a.setCurrency("VND");
        a.setStatus("ACTIVE");
        a.setCreatedAt(LocalDateTime.now());
        return a;
    }

    private Category createCategory(String name, CategoryType type, String desc) {
        Category c = new Category();
        c.setCategoryName(name);
        c.setType(type);
        c.setDescription(desc);
        c.setStatus("ACTIVE");
        return c;
    }
}
