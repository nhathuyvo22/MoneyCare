package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "GiaoDichDinhKy")
@Data
@NoArgsConstructor
public class RecurringTransaction implements UserOwnedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_dinh_ky")
    private Long id;

    @Column(name="id_nguoi_dung", nullable=false)
    private Long userId;

    @Column(name="id_tai_khoan", nullable=false)
    private Long accountId;

    @Column(name="id_danh_muc")
    private Long categoryId;

    @Column(name="id_phuong_thuc")
    private Long paymentMethodId;

    @Column(name="ten_giao_dich", nullable=false, length=120)
    private String name;

    @Column(name="loai_giao_dich", nullable=false, length=10)
    private String transactionType;

    @Column(name="so_tien", nullable=false, precision=19, scale=2)
    private BigDecimal amount;

    @Column(name="chu_ky", nullable=false, length=15)
    private String frequency;

    @Column(name="ngay_bat_dau", nullable=false)
    private LocalDate startDate;

    @Column(name="ngay_ket_thuc")
    private LocalDate endDate;

    @Column(name="ngay_chay_tiep_theo")
    private LocalDate nextRunDate;

    @Column(name="trang_thai", nullable=false, length=20)
    private String status = "ACTIVE";

}
