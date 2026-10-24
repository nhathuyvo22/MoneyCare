package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TienTietKiem")
@Data
@NoArgsConstructor
public class SavingsTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_tien_tiet_kiem")
    private Long id;

    @Column(name="id_muc_tieu", nullable=false)
    private Long goalId;

    @Column(name="id_tai_khoan", nullable=false)
    private Long accountId;

    @Column(name="loai_bien_dong", nullable=false, length=10)
    private String movementType;

    @Column(name="so_tien", nullable=false, precision=19, scale=2)
    private BigDecimal amount;

    @Column(name="ngay_giao_dich", nullable=false)
    private LocalDateTime transactionDate;

    @Column(name="ghi_chu", length=255)
    private String note;

}
