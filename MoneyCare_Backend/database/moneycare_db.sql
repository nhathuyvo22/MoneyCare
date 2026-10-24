CREATE DATABASE IF NOT EXISTS moneycare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE moneycare_db;

CREATE TABLE IF NOT EXISTS VaiTro (
  id_vai_tro BIGINT NOT NULL AUTO_INCREMENT,
  ten_vai_tro VARCHAR(30) NOT NULL UNIQUE,
  mo_ta VARCHAR(255),
  PRIMARY KEY (id_vai_tro)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS NguoiDung (
  id_nguoi_dung BIGINT NOT NULL AUTO_INCREMENT,
  id_vai_tro BIGINT NOT NULL,
  ho_ten VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mat_khau_hash VARCHAR(255) NOT NULL,
  so_dien_thoai VARCHAR(20),
  ngay_sinh DATE,
  gioi_tinh VARCHAR(20),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat DATETIME NULL,
  PRIMARY KEY (id_nguoi_dung),
  CONSTRAINT fk_nguoidung_vaitro FOREIGN KEY (id_vai_tro) REFERENCES VaiTro(id_vai_tro)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS LoaiTaiKhoan (
  id_loai_tai_khoan BIGINT NOT NULL AUTO_INCREMENT,
  ten_loai VARCHAR(50) NOT NULL UNIQUE,
  mo_ta VARCHAR(255),
  PRIMARY KEY (id_loai_tai_khoan)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS TaiKhoan (
  id_tai_khoan BIGINT NOT NULL AUTO_INCREMENT,
  id_nguoi_dung BIGINT NOT NULL,
  id_loai_tai_khoan BIGINT NOT NULL,
  ten_tai_khoan VARCHAR(100) NOT NULL,
  so_du_ban_dau DECIMAL(19,2) NOT NULL DEFAULT 0,
  so_du_hien_tai DECIMAL(19,2) NOT NULL DEFAULT 0,
  don_vi_tien CHAR(3) NOT NULL DEFAULT 'VND',
  mo_ta VARCHAR(255),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_tai_khoan),
  CONSTRAINT fk_taikhoan_nguoidung FOREIGN KEY (id_nguoi_dung) REFERENCES NguoiDung(id_nguoi_dung),
  CONSTRAINT fk_taikhoan_loai FOREIGN KEY (id_loai_tai_khoan) REFERENCES LoaiTaiKhoan(id_loai_tai_khoan),
  CONSTRAINT chk_taikhoan_sodu CHECK (so_du_ban_dau >= 0 AND so_du_hien_tai >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS DanhMuc (
  id_danh_muc BIGINT NOT NULL AUTO_INCREMENT,
  id_nguoi_dung BIGINT NULL,
  ten_danh_muc VARCHAR(80) NOT NULL,
  loai_danh_muc VARCHAR(10) NOT NULL,
  id_danh_muc_cha BIGINT NULL,
  mo_ta VARCHAR(255),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (id_danh_muc),
  CONSTRAINT fk_danhmuc_nguoidung FOREIGN KEY (id_nguoi_dung) REFERENCES NguoiDung(id_nguoi_dung),
  CONSTRAINT fk_danhmuc_cha FOREIGN KEY (id_danh_muc_cha) REFERENCES DanhMuc(id_danh_muc),
  CONSTRAINT chk_danhmuc_loai CHECK (loai_danh_muc IN ('THU','CHI'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PhuongThucThanhToan (
  id_phuong_thuc BIGINT NOT NULL AUTO_INCREMENT,
  ten_phuong_thuc VARCHAR(50) NOT NULL UNIQUE,
  mo_ta VARCHAR(255),
  PRIMARY KEY (id_phuong_thuc)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS GiaoDich (
  id_giao_dich BIGINT NOT NULL AUTO_INCREMENT,
  id_tai_khoan BIGINT NOT NULL,
  id_tai_khoan_dich BIGINT NULL,
  id_danh_muc BIGINT NULL,
  id_phuong_thuc BIGINT NULL,
  id_nguoi_dung_tao BIGINT NOT NULL,
  loai_giao_dich VARCHAR(15) NOT NULL,
  so_tien DECIMAL(19,2) NOT NULL,
  tieu_de VARCHAR(120) NOT NULL,
  noi_dung VARCHAR(500),
  ngay_giao_dich DATETIME NOT NULL,
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_giao_dich),
  CONSTRAINT fk_giaodich_taikhoan FOREIGN KEY (id_tai_khoan) REFERENCES TaiKhoan(id_tai_khoan),
  CONSTRAINT fk_giaodich_taikhoan_dich FOREIGN KEY (id_tai_khoan_dich) REFERENCES TaiKhoan(id_tai_khoan),
  CONSTRAINT fk_giaodich_danhmuc FOREIGN KEY (id_danh_muc) REFERENCES DanhMuc(id_danh_muc),
  CONSTRAINT fk_giaodich_phuongthuc FOREIGN KEY (id_phuong_thuc) REFERENCES PhuongThucThanhToan(id_phuong_thuc),
  CONSTRAINT fk_giaodich_nguoidung FOREIGN KEY (id_nguoi_dung_tao) REFERENCES NguoiDung(id_nguoi_dung),
  CONSTRAINT chk_giaodich_loai CHECK (loai_giao_dich IN ('THU','CHI','CHUYEN_TIEN')),
  CONSTRAINT chk_giaodich_sotien CHECK (so_tien > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS NganSach (
  id_ngan_sach BIGINT NOT NULL AUTO_INCREMENT,
  id_nguoi_dung BIGINT NOT NULL,
  ten_ngan_sach VARCHAR(100) NOT NULL,
  ngay_bat_dau DATE NOT NULL,
  ngay_ket_thuc DATE NOT NULL,
  tong_han_muc DECIMAL(19,2) NOT NULL,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_ngan_sach),
  CONSTRAINT fk_ngansach_nguoidung FOREIGN KEY (id_nguoi_dung) REFERENCES NguoiDung(id_nguoi_dung),
  CONSTRAINT chk_ngansach_ngay CHECK (ngay_ket_thuc >= ngay_bat_dau),
  CONSTRAINT chk_ngansach_hanmuc CHECK (tong_han_muc >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ChiTietNganSach (
  id_chi_tiet_ngan_sach BIGINT NOT NULL AUTO_INCREMENT,
  id_ngan_sach BIGINT NOT NULL,
  id_danh_muc BIGINT NOT NULL,
  han_muc DECIMAL(19,2) NOT NULL,
  PRIMARY KEY (id_chi_tiet_ngan_sach),
  UNIQUE KEY uq_chitiet_ngansach_danhmuc (id_ngan_sach, id_danh_muc),
  CONSTRAINT fk_chitiet_ngansach_ngansach FOREIGN KEY (id_ngan_sach) REFERENCES NganSach(id_ngan_sach),
  CONSTRAINT fk_chitiet_ngansach_danhmuc FOREIGN KEY (id_danh_muc) REFERENCES DanhMuc(id_danh_muc),
  CONSTRAINT chk_chitiet_hanmuc CHECK (han_muc >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS MucTieuTietKiem (
  id_muc_tieu BIGINT NOT NULL AUTO_INCREMENT,
  id_nguoi_dung BIGINT NOT NULL,
  ten_muc_tieu VARCHAR(120) NOT NULL,
  so_tien_muc_tieu DECIMAL(19,2) NOT NULL,
  ngay_bat_dau DATE NOT NULL,
  ngay_muc_tieu DATE NULL,
  mo_ta VARCHAR(500),
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (id_muc_tieu),
  CONSTRAINT fk_muctieu_nguoidung FOREIGN KEY (id_nguoi_dung) REFERENCES NguoiDung(id_nguoi_dung),
  CONSTRAINT chk_muctieu_sotien CHECK (so_tien_muc_tieu > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS TienTietKiem (
  id_tien_tiet_kiem BIGINT NOT NULL AUTO_INCREMENT,
  id_muc_tieu BIGINT NOT NULL,
  id_tai_khoan BIGINT NOT NULL,
  loai_bien_dong VARCHAR(10) NOT NULL,
  so_tien DECIMAL(19,2) NOT NULL,
  ngay_giao_dich DATETIME NOT NULL,
  ghi_chu VARCHAR(255),
  PRIMARY KEY (id_tien_tiet_kiem),
  CONSTRAINT fk_tientietkiem_muctieu FOREIGN KEY (id_muc_tieu) REFERENCES MucTieuTietKiem(id_muc_tieu),
  CONSTRAINT fk_tientietkiem_taikhoan FOREIGN KEY (id_tai_khoan) REFERENCES TaiKhoan(id_tai_khoan),
  CONSTRAINT chk_tientietkiem_loai CHECK (loai_bien_dong IN ('NAP','RUT')),
  CONSTRAINT chk_tientietkiem_sotien CHECK (so_tien > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS HoaDon (
  id_hoa_don BIGINT NOT NULL AUTO_INCREMENT,
  id_nguoi_dung BIGINT NOT NULL,
  ten_hoa_don VARCHAR(120) NOT NULL,
  so_tien_du_kien DECIMAL(19,2) NOT NULL,
  ngay_phat_sinh DATE NOT NULL,
  han_thanh_toan DATE NULL,
  trang_thai VARCHAR(30) NOT NULL DEFAULT 'CHUA_THANH_TOAN',
  mo_ta VARCHAR(500),
  PRIMARY KEY (id_hoa_don),
  CONSTRAINT fk_hoadon_nguoidung FOREIGN KEY (id_nguoi_dung) REFERENCES NguoiDung(id_nguoi_dung),
  CONSTRAINT chk_hoadon_sotien CHECK (so_tien_du_kien >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ThanhToanHoaDon (
  id_thanh_toan BIGINT NOT NULL AUTO_INCREMENT,
  id_hoa_don BIGINT NOT NULL,
  id_tai_khoan BIGINT NOT NULL,
  id_giao_dich BIGINT NULL UNIQUE,
  so_tien DECIMAL(19,2) NOT NULL,
  ngay_thanh_toan DATETIME NOT NULL,
  ghi_chu VARCHAR(255),
  PRIMARY KEY (id_thanh_toan),
  CONSTRAINT fk_thanhtoan_hoadon FOREIGN KEY (id_hoa_don) REFERENCES HoaDon(id_hoa_don),
  CONSTRAINT fk_thanhtoan_taikhoan FOREIGN KEY (id_tai_khoan) REFERENCES TaiKhoan(id_tai_khoan),
  CONSTRAINT fk_thanhtoan_giaodich FOREIGN KEY (id_giao_dich) REFERENCES GiaoDich(id_giao_dich),
  CONSTRAINT chk_thanhtoan_sotien CHECK (so_tien > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS GiaoDichDinhKy (
  id_dinh_ky BIGINT NOT NULL AUTO_INCREMENT,
  id_nguoi_dung BIGINT NOT NULL,
  id_tai_khoan BIGINT NOT NULL,
  id_danh_muc BIGINT NULL,
  id_phuong_thuc BIGINT NULL,
  ten_giao_dich VARCHAR(120) NOT NULL,
  loai_giao_dich VARCHAR(10) NOT NULL,
  so_tien DECIMAL(19,2) NOT NULL,
  chu_ky VARCHAR(15) NOT NULL,
  ngay_bat_dau DATE NOT NULL,
  ngay_ket_thuc DATE NULL,
  ngay_chay_tiep_theo DATE NULL,
  trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (id_dinh_ky),
  CONSTRAINT fk_dinhky_nguoidung FOREIGN KEY (id_nguoi_dung) REFERENCES NguoiDung(id_nguoi_dung),
  CONSTRAINT fk_dinhky_taikhoan FOREIGN KEY (id_tai_khoan) REFERENCES TaiKhoan(id_tai_khoan),
  CONSTRAINT fk_dinhky_danhmuc FOREIGN KEY (id_danh_muc) REFERENCES DanhMuc(id_danh_muc),
  CONSTRAINT fk_dinhky_phuongthuc FOREIGN KEY (id_phuong_thuc) REFERENCES PhuongThucThanhToan(id_phuong_thuc),
  CONSTRAINT chk_dinhky_loai CHECK (loai_giao_dich IN ('THU','CHI')),
  CONSTRAINT chk_dinhky_sotien CHECK (so_tien > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ThongBao (
  id_thong_bao BIGINT NOT NULL AUTO_INCREMENT,
  id_nguoi_dung BIGINT NOT NULL,
  tieu_de VARCHAR(150) NOT NULL,
  noi_dung VARCHAR(1000) NOT NULL,
  loai_thong_bao VARCHAR(30) NOT NULL,
  da_doc BOOLEAN NOT NULL DEFAULT FALSE,
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_thong_bao),
  CONSTRAINT fk_thongbao_nguoidung FOREIGN KEY (id_nguoi_dung) REFERENCES NguoiDung(id_nguoi_dung)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS NhatKyHoatDong (
  id_nhat_ky BIGINT NOT NULL AUTO_INCREMENT,
  id_nguoi_dung BIGINT NULL,
  hanh_dong VARCHAR(50) NOT NULL,
  doi_tuong VARCHAR(60) NOT NULL,
  id_doi_tuong BIGINT NULL,
  mo_ta VARCHAR(500),
  thoi_gian DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_nhat_ky),
  CONSTRAINT fk_nhatky_nguoidung FOREIGN KEY (id_nguoi_dung) REFERENCES NguoiDung(id_nguoi_dung)
) ENGINE=InnoDB;

INSERT IGNORE INTO VaiTro (ten_vai_tro, mo_ta) VALUES
 ('ADMIN', 'Quan tri vien'), ('USER', 'Nguoi dung');
INSERT IGNORE INTO LoaiTaiKhoan (ten_loai, mo_ta) VALUES
 ('TIEN_MAT', 'Tai khoan tien mat'), ('NGAN_HANG', 'Tai khoan ngan hang'), ('VI_DIEN_TU', 'Vi dien tu'), ('THE_TIN_DUNG', 'The tin dung');
INSERT IGNORE INTO PhuongThucThanhToan (ten_phuong_thuc, mo_ta) VALUES
 ('TIEN_MAT', 'Thanh toan tien mat'), ('CHUYEN_KHOAN', 'Chuyen khoan ngan hang'), ('VI_DIEN_TU', 'Vi dien tu');
