# 💰 MoneyCare — Ứng dụng Quản lý Tài chính Cá nhân

MoneyCare là ứng dụng web giúp người dùng theo dõi thu chi, quản lý tài khoản/ví, lập ngân sách, đặt mục tiêu tiết kiệm và quản lý hóa đơn. Dự án gồm **Backend (Spring Boot REST API)** và **Frontend (React + Vite)**, có phân quyền **USER** và **ADMIN** với giao diện quản trị riêng.

---

## 📑 Mục lục

1. [Giới thiệu dự án](#1-giới-thiệu-dự-án)
2. [Cấu trúc dự án](#2-cấu-trúc-dự-án)
3. [Các công nghệ sử dụng](#3-các-công-nghệ-sử-dụng)
4. [Hướng dẫn cài đặt](#4-hướng-dẫn-cài-đặt)
5. [Tài khoản mẫu](#5-tài-khoản-mẫu)
6. [Danh sách API chính](#6-danh-sách-api-chính)
7. [Lưu ý](#7-lưu-ý)

---

## 1. Giới thiệu dự án

### Mục tiêu
Cung cấp công cụ đơn giản, trực quan để mỗi cá nhân kiểm soát dòng tiền của mình: biết tiền đến từ đâu, đi đâu, còn bao nhiêu và có đạt được mục tiêu tài chính hay không.

### Chức năng dành cho người dùng (USER)

| Chức năng | Mô tả |
|---|---|
| **Đăng ký / Đăng nhập** | Xác thực bằng email và mật khẩu, sử dụng JWT (Bearer Token) |
| **Tổng quan** | Dashboard thống kê thu – chi – số dư, biểu đồ trực quan |
| **Giao dịch** | Thêm/sửa/xóa giao dịch thu, chi và chuyển tiền giữa các tài khoản |
| **Tài khoản** | Quản lý nhiều ví/tài khoản (tiền mặt, ngân hàng,…) theo từng loại |
| **Ngân sách** | Đặt hạn mức chi tiêu theo danh mục và theo dõi mức sử dụng |
| **Mục tiêu tiết kiệm** | Tạo mục tiêu, nạp/rút tiền tiết kiệm, theo dõi tiến độ |
| **Hóa đơn** | Quản lý hóa đơn cần thanh toán và lịch sử thanh toán |
| **Giao dịch định kỳ** | Thiết lập các khoản thu/chi lặp lại |
| **Báo cáo** | Thống kê, biểu đồ theo thời gian và danh mục |
| **Máy tính lãi suất** | Công cụ tính lãi tiết kiệm/vay |
| **Cài đặt** | Cấu hình cá nhân và địa chỉ API |

### Chức năng dành cho quản trị viên (ADMIN)
Giao diện quản trị riêng gồm: Tổng quan, Quản lý người dùng, tài khoản, giao dịch, danh mục, ngân sách, mục tiêu tiết kiệm, hóa đơn, Báo cáo & thống kê, Nhật ký hoạt động và Cài đặt hệ thống.

### Điểm nổi bật
- 🔐 Bảo mật bằng **Spring Security + JWT**, mật khẩu băm **BCrypt**.
- 🛡️ **Kiểm tra quyền sở hữu dữ liệu**: người dùng chỉ truy cập được dữ liệu của chính mình (có unit test kiểm chứng).
- 🚫 Tài khoản có trạng thái khác `ACTIVE` không thể đăng nhập.
- 🗄️ Cơ sở dữ liệu thiết kế gồm **16 bảng** với khóa ngoại và ràng buộc đầy đủ.
- 🌱 Tự động tạo dữ liệu mẫu khi chạy lần đầu.
- 📱 Giao diện responsive (Sidebar cho desktop, BottomNav cho mobile).

---

## 2. Cấu trúc dự án

```
MoneyCare/
├── MoneyCare_Backend/                 # Spring Boot REST API
│   ├── database/
│   │   └── moneycare_db.sql           # Script SQL tạo CSDL (16 bảng)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/Nhom/VI/MoneyCare/
│   │   │   │   ├── MoneyCareApplication.java   # Điểm khởi chạy
│   │   │   │   ├── config/            # SecurityConfig, PasswordConfig, DataInitializer, DataSeeder
│   │   │   │   ├── controller/        # REST controllers (Auth, User, Account, Transaction, ...)
│   │   │   │   ├── service/           # Interface nghiệp vụ
│   │   │   │   │   └── Impl/          # Cài đặt nghiệp vụ (AbstractCrudService, ...)
│   │   │   │   ├── repository/        # Spring Data JPA repositories
│   │   │   │   ├── entity/            # Entity ánh xạ 16 bảng CSDL
│   │   │   │   ├── security/          # JwtService, JwtAuthenticationFilter, CurrentUserService, ...
│   │   │   │   └── exception/         # GlobalExceptionHandler, BadRequestException, ErrorResponse
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── schema.sql         # Tạo bảng, khóa ngoại và dữ liệu danh mục mặc định
│   │   └── test/java/Nhom/VI/MoneyCare/   # Test quyền sở hữu, JWT, CRUD
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd                # Maven Wrapper
│   └── README_MoneyCare.md            # Tài liệu chi tiết phần Backend
│
└── MoneyCare_Fontend/                 # React + Vite
    ├── index.html
    ├── package.json
    ├── vite.config.js                 # Cổng 5173 + proxy /api → localhost:8080
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx                   # Điểm khởi chạy
        ├── App.jsx                    # Điều hướng màn hình, bảo vệ route theo vai trò
        ├── index.css
        ├── screens/                   # Màn hình người dùng
        │   ├── AuthScreen.jsx
        │   ├── OverviewScreen.jsx
        │   ├── TransactionsScreen.jsx
        │   ├── AccountsScreen.jsx
        │   ├── BudgetScreen.jsx
        │   ├── GoalsScreen.jsx
        │   ├── BillsScreen.jsx
        │   ├── ReportsScreen.jsx
        │   ├── InterestCalculatorScreen.jsx
        │   └── SettingsScreen.jsx
        ├── components/                # Sidebar, Topbar, BottomNav, AuthModal, AddTransactionModal, ...
        ├── admin/                     # Giao diện quản trị
        │   ├── AdminDashboardView.jsx
        │   ├── pages/                 # Dashboard, Users, Accounts, Transactions, Categories, ...
        │   ├── components/            # layout (Header, Sidebar), common (DataTable, Modal)
        │   ├── context/AdminContext.jsx
        │   └── mocks/, utils/
        ├── context/AppContext.jsx     # State toàn cục (người dùng, token, dữ liệu)
        ├── services/api.js            # Gọi REST API (kèm JWT)
        ├── hooks/                     # useCountUp
        └── utils/                     # soundHaptic
```

### Cơ sở dữ liệu (16 bảng)

| Bảng | Entity | Endpoint |
|---|---|---|
| `VaiTro` | `Role` | `/api/roles` |
| `NguoiDung` | `User` | `/api/users` |
| `LoaiTaiKhoan` | `AccountType` | `/api/account-types` |
| `TaiKhoan` | `Account` | `/api/accounts` |
| `DanhMuc` | `Category` | `/api/categories` |
| `PhuongThucThanhToan` | `PaymentMethod` | `/api/payment-methods` |
| `GiaoDich` | `Transaction` | `/api/transactions` |
| `NganSach` | `Budget` | `/api/budgets` |
| `ChiTietNganSach` | `BudgetDetail` | `/api/budget-details` |
| `MucTieuTietKiem` | `SavingsGoal` | `/api/savings-goals` |
| `TienTietKiem` | `SavingsTransaction` | `/api/savings-transactions` |
| `HoaDon` | `Bill` | `/api/bills` |
| `ThanhToanHoaDon` | `BillPayment` | `/api/bill-payments` |
| `GiaoDichDinhKy` | `RecurringTransaction` | `/api/recurring-transactions` |
| `ThongBao` | `Notification` | `/api/notifications` |
| `NhatKyHoatDong` | `ActivityLog` | `/api/activity-logs` |

---

## 3. Các công nghệ sử dụng

### Backend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Java | 21 | Ngôn ngữ lập trình |
| Spring Boot | 4.1.1 | Framework chính |
| Spring Web MVC | — | Xây dựng REST API |
| Spring Data JPA / Hibernate | — | Truy cập và ánh xạ dữ liệu |
| Spring Security | — | Xác thực, phân quyền |
| JJWT (`io.jsonwebtoken`) | 0.12.6 | Tạo và xác thực JWT |
| Spring HATEOAS | — | Hỗ trợ REST |
| MySQL + Connector/J | 8.x | Cơ sở dữ liệu |
| Lombok | — | Giảm code lặp (getter/setter, ...) |
| Spring Boot DevTools | — | Tự động reload khi phát triển |
| Maven (Wrapper) | 3.9.x | Quản lý build & dependency |

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | ^18.3.1 | Thư viện giao diện |
| Vite | ^5.4.10 | Công cụ build, dev server |
| React Router DOM | ^7.18.5 | Điều hướng |
| Tailwind CSS | ^3.4.14 | Styling |
| Chart.js + react-chartjs-2 | ^4.4.6 / ^5.2.0 | Biểu đồ |
| Recharts | ^3.10.1 | Biểu đồ (khu vực quản trị) |
| Lucide React | ^0.454.0 | Bộ icon |

---

## 4. Hướng dẫn cài đặt

### 4.1. Yêu cầu hệ thống

- **JDK 21** trở lên
- **MySQL 8.x** (hoặc MariaDB tương thích)
- **Node.js 18+** và **npm**
- **Git**
- Maven không bắt buộc (đã có Maven Wrapper `mvnw`)

### 4.2. Tải mã nguồn

```bash
git clone https://github.com/nhathuyvo22/MoneyCare.git
cd MoneyCare
```

### 4.3. Cài đặt Backend

**Bước 1 — Tạo cơ sở dữ liệu**

Đăng nhập MySQL và chạy:

```sql
CREATE DATABASE moneycare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

> Tùy chọn: có thể import nhanh bằng file `MoneyCare_Backend/database/moneycare_db.sql`. Nếu bỏ qua, ứng dụng sẽ tự tạo bảng từ `schema.sql` và Hibernate (`ddl-auto=update`) khi khởi động.

**Bước 2 — Cấu hình kết nối**

Mặc định (trong `src/main/resources/application.properties`):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/moneycare_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
```

Nếu MySQL của bạn có mật khẩu, đặt biến môi trường (khuyến nghị) hoặc sửa trực tiếp file trên:

```bash
# Linux / macOS
export DB_USERNAME=root
export DB_PASSWORD=mat_khau_cua_ban
export JWT_SECRET=chuoi_bi_mat_ngau_nhien_dai_it_nhat_32_ky_tu

# Windows (CMD)
set DB_USERNAME=root
set DB_PASSWORD=mat_khau_cua_ban
set JWT_SECRET=chuoi_bi_mat_ngau_nhien_dai_it_nhat_32_ky_tu
```

| Biến môi trường | Mặc định | Ý nghĩa |
|---|---|---|
| `DB_USERNAME` | `root` | Tên đăng nhập MySQL |
| `DB_PASSWORD` | *(rỗng)* | Mật khẩu MySQL |
| `JWT_SECRET` | khóa mẫu | Khóa ký JWT (≥ 32 byte) |
| `JWT_EXPIRATION_MS` | `86400000` | Thời hạn token (24 giờ) |

**Bước 3 — Chạy Backend**

```bash
cd MoneyCare_Backend

# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

Backend chạy tại **http://localhost:8080**. Lần chạy đầu tiên, hệ thống tự tạo bảng và dữ liệu mẫu.

Chạy kiểm thử (tùy chọn):

```bash
./mvnw test
```

### 4.4. Cài đặt Frontend

Mở một terminal mới:

```bash
cd MoneyCare_Fontend
npm install
npm run dev
```

Frontend chạy tại **http://localhost:5173**. Vite đã cấu hình proxy `/api` → `http://localhost:8080`, nên **cần khởi động Backend trước**.

Build bản production:

```bash
npm run build      # Kết quả trong thư mục dist/
npm run preview    # Xem thử bản build
```

### 4.5. Kiểm tra nhanh

1. Mở http://localhost:5173
2. Đăng nhập bằng một [tài khoản mẫu](#5-tài-khoản-mẫu) bên dưới
3. Tài khoản ADMIN sẽ có thêm giao diện quản trị

---

## 5. Tài khoản mẫu

Dữ liệu mẫu được tạo tự động khi bảng người dùng còn trống. Mật khẩu của tất cả tài khoản: **`123456`**

| Vai trò | Email |
|---|---|
| ADMIN | `admin@moneycare.vn` |
| USER | `an.nguyen@gmail.com` |
| USER | `bich.tran@gmail.com` |
| USER | `cuong.le@gmail.com` |
| USER | `dung.pham@gmail.com` |
| USER | `duc.hoang@gmail.com` |

> ⚠️ Chỉ dùng cho học tập/phát triển. Hãy đổi mật khẩu hoặc xóa dữ liệu mẫu khi triển khai thật.

---

## 6. Danh sách API chính

Tất cả endpoint `/api/**` yêu cầu header `Authorization: Bearer <accessToken>`, trừ đăng ký và đăng nhập.

| Phương thức | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| `POST` | `/api/users` | Đăng ký tài khoản | Công khai |
| `POST` | `/api/auth/login` | Đăng nhập, nhận `accessToken` | Công khai |
| `GET` | `/api/auth/me` | Thông tin người dùng hiện tại | Đã đăng nhập |
| `GET/POST/PUT/DELETE` | `/api/users/**`, `/api/roles/**` | Quản lý người dùng, vai trò | ADMIN |
| `GET/POST/PUT/DELETE` | `/api/{resource}` | CRUD các bảng còn lại | Đã đăng nhập |
| `GET` | `/api/transactions/user/{userId}` | Giao dịch theo người dùng | Đã đăng nhập |
| `GET` | `/api/budgets/user/{userId}/summary` | Tổng hợp ngân sách | Đã đăng nhập |

**Ví dụ đăng nhập:**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@moneycare.vn","password":"123456"}'
```

**Ví dụ tạo giao dịch** (`POST /api/transactions`):

```json
{
  "userId": 1,
  "accountId": 1,
  "categoryId": 1,
  "type": "INCOME",
  "amount": 12000000,
  "title": "Luong thang",
  "transactionDate": "2026-10-05T09:00:00"
}
```

Loại giao dịch: `INCOME` (thu), `EXPENSE` (chi), `CHUYEN_TIEN` (chuyển tiền — cần thêm `targetAccountId`, bỏ `categoryId`).

Chi tiết hơn xem tại [`MoneyCare_Backend/README_MoneyCare.md`](MoneyCare_Backend/README_MoneyCare.md).

---

## 7. Lưu ý

- Cấu hình `ddl-auto=update` phù hợp môi trường phát triển; khi triển khai thật nên dùng Flyway/Liquibase để quản lý migration.
- Khóa JWT mặc định chỉ dùng cho học tập. Hãy đặt `JWT_SECRET` riêng và dùng **HTTPS** khi triển khai.
- CORS hiện cho phép mọi nguồn (`*`); nên giới hạn lại origin khi đưa lên production.
- Một số nghiệp vụ nâng cao (giới hạn thanh toán hóa đơn, xử lý lịch giao dịch định kỳ, thông báo tự động) cần hoàn thiện thêm trước khi triển khai thực tế.
- Nếu không kết nối được API, kiểm tra Backend đã chạy ở cổng `8080` và MySQL đã bật.

---

## 👥 Nhóm thực hiện

Dự án thực hiện bởi **Nhóm VI** — tác giả repo: [nhathuyvo22](https://github.com/nhathuyvo22).
