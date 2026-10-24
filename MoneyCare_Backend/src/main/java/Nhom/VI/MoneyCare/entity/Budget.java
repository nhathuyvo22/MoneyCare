package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "NganSach")
@Data
@NoArgsConstructor
public class Budget {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_ngan_sach")
    private Long id;

    @Column(name="id_nguoi_dung", nullable=false)
    private Long userId;

    @Column(name="ten_ngan_sach", nullable=false, length=100)
    private String budgetName;

    @Column(name="ngay_bat_dau", nullable=false)
    private LocalDate startDate;

    @Column(name="ngay_ket_thuc", nullable=false)
    private LocalDate endDate;

    @Column(name="tong_han_muc", nullable=false, precision=19, scale=2)
    private BigDecimal amount;

    @Column(name="trang_thai", nullable=false, length=20)
    private String status = "ACTIVE";

    @Column(name="ngay_tao", nullable=false)
    private LocalDateTime createdAt;

    public boolean isDateInRange(LocalDate date) {
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }
}
