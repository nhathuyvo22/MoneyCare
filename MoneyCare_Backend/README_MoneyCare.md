# MoneyCare Backend — bản mở rộng theo thiết kế CSDL 16 bảng

Dự án Spring Boot + Spring Data JPA + MySQL. Các Entity đã ánh xạ vào tên bảng/cột tiếng Việt theo tài liệu thiết kế `De_xuat_CSDL_Quan_ly_Tai_chinh_Ca_nhan.docx`.

## 1. Công nghệ
- Java 21
- Spring Boot
- Spring Web MVC / REST API
- Spring Data JPA / Hibernate
- MySQL Connector/J
- Lombok

## 2. Cấu hình MySQL
Tạo database trước khi chạy ứng dụng:

```sql
CREATE DATABASE moneycare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Mở `src/main/resources/application.properties` và chỉnh thông tin kết nối:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/moneycare_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
```

Nhập mật khẩu MySQL của máy vào `spring.datasource.password` nếu tài khoản `root` có mật khẩu.

`src/main/resources/schema.sql` tạo 16 bảng, khóa ngoại, ràng buộc và dữ liệu danh mục mặc định. Hibernate tiếp tục đồng bộ mapping Entity với `ddl-auto=update`.

## 3. Chạy ứng dụng
Mở terminal tại thư mục chứa `pom.xml`:

Windows:
```bat
mvnw.cmd spring-boot:run
```

Hoặc nếu đã cài Maven:
```bash
mvn spring-boot:run
```

Mặc định API chạy tại `http://localhost:8080`.

## 4. Danh sách 16 bảng và API

| Bảng CSDL | Entity Java | Endpoint |
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

Các endpoint mới hỗ trợ:
- `GET /api/{resource}` — lấy danh sách
- `GET /api/{resource}/{id}` — lấy chi tiết
- `POST /api/{resource}` — tạo bản ghi
- `PUT /api/{resource}/{id}` — cập nhật bản ghi
- `DELETE /api/{resource}/{id}` — xóa bản ghi

Các API gốc `/api/users`, `/api/accounts`, `/api/categories`, `/api/transactions`, `/api/budgets` vẫn giữ controller/service hiện có.

## 5. Ví dụ JSON

Tạo người dùng (`POST /api/users`):
```json
{
  "fullName": "Nguyen Van B",
  "email": "b@example.com",
  "password": "thay-bang-mat-khau-da-bam",
  "phone": "0900000001"
}
```
Nếu không gửi `roleId`, service tự gán vai trò `USER`.

Tạo tài khoản (`POST /api/accounts`):
```json
{
  "userId": 1,
  "accountTypeId": 1,
  "accountName": "Vi tien mat",
  "openingBalance": 1000000,
  "balance": 1000000,
  "currency": "VND"
}
```

Tạo giao dịch thu (`POST /api/transactions`):
```json
{
  "userId": 1,
  "accountId": 1,
  "categoryId": 1,
  "type": "INCOME",
  "amount": 12000000,
  "title": "Luong thang",
  "description": "Luong thang 10",
  "transactionDate": "2026-10-05T09:00:00"
}
```

Tạo giao dịch chi dùng `"type": "EXPENSE"`. Chuyển tiền dùng `"type": "CHUYEN_TIEN"`, thêm `targetAccountId` và bỏ `categoryId`.

## 6. Lưu ý
- Các giá trị enum Java `INCOME`/`EXPENSE` được chuyển thành `THU`/`CHI` khi lưu vào cột CSDL.
- `avatar`, `icon`, `color`, `image` đang giữ tạm ở dạng `@Transient` để tương thích với API cũ; các trường này không được lưu trong 16 bảng của tài liệu.
- Dữ liệu mẫu tạo tự động khi bảng người dùng chưa có dữ liệu. Mật khẩu ví dụ chỉ phục vụ học tập; ứng dụng thật phải dùng BCrypt hoặc cơ chế băm mật khẩu an toàn.
- Các endpoint CRUD bổ sung hiện là CRUD cơ bản. Các quy tắc nghiệp vụ phức tạp như giới hạn thanh toán hóa đơn, quyền sở hữu chéo giữa mọi bảng, xử lý lịch giao dịch định kỳ và tạo thông báo tự động cần được hoàn thiện thêm trước khi triển khai thật.
- Cấu hình `ddl-auto=update` phù hợp phát triển bài tập. Dự án thật nên quản lý thay đổi schema bằng migration Flyway/Liquibase.


## Spring Security + JWT (Bearer Token)

Security dung tai khoan trong bang `NguoiDung` va vai tro trong bang `VaiTro`:

- `POST /api/users`: dang ky tai khoan. He thong tu gan vai tro `USER`, trang thai `ACTIVE` va ma hoa mat khau bang BCrypt; khong chap nhan role do client tu chon.
- `POST /api/auth/login`: dang nhap bang email/mat khau, tra ve `accessToken` va thong tin user an toan.
- `GET /api/auth/me`: xem thong tin tai khoan tu JWT hien tai.
- Tat ca API `/api/**` khac can Bearer token; `/api/users/**` va `/api/roles/**` chi danh cho `ADMIN` (ngoai tru `POST /api/users` dung de dang ky).
- Tai khoan co `trang_thai` khac `ACTIVE` khong the dang nhap.
- JWT mac dinh het han sau 24 gio. Co the doi bang bien moi truong `JWT_EXPIRATION_MS`.

### Thu bang Postman

1. Dang ky tai khoan: `POST http://localhost:8080/api/users`, body JSON:

```json
{
  "fullName": "Nguyen Van B",
  "email": "b@example.com",
  "password": "MatKhau123",
  "phone": "0900000000"
}
```

2. Dang nhap: `POST http://localhost:8080/api/auth/login`, body:

```json
{
  "email": "b@example.com",
  "password": "MatKhau123"
}
```

3. Sao chep `accessToken`, goi `GET http://localhost:8080/api/auth/me` va chon **Authorization -> Bearer Token** trong Postman.
4. Khi goi cac API can dang nhap, gui header `Authorization: Bearer <accessToken>`.

### Cau hinh khoa JWT

`application.properties` co khoa mac dinh chi danh cho hoc tap. Khi chay tren may cua ban, co the dat bien moi truong `JWT_SECRET` thanh chuoi ngau nhien dai it nhat 32 byte. Khong dung khoa mau nay cho he thong that; luon su dung HTTPS khi truyen token.

Luu y: tai khoan mau `a@gmail.com` voi mat khau `123456` duoc tao boi `DataInitializer` chi khi bang `NguoiDung` chua co tai khoan nao. Day la tai khoan hoc tap, can thay mat khau neu su dung trong moi truong that.
