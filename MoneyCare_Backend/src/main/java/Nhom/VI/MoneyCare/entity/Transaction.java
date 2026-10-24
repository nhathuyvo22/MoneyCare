package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "GiaoDich")
@Data
@NoArgsConstructor
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_giao_dich")
    private Long id;

    @Column(name="id_tai_khoan", nullable=false)
    private Long accountId;

    @Column(name="id_tai_khoan_dich")
    private Long targetAccountId;

    @Column(name="id_danh_muc")
    private Long categoryId;

    @Column(name="id_phuong_thuc")
    private Long paymentMethodId;

    @Column(name="id_nguoi_dung_tao", nullable=false)
    private Long userId;

    @Convert(converter = CategoryTypeConverter.class)
    @Column(name="loai_giao_dich", nullable=false, length=15)
    private CategoryType type;

    @Column(name="so_tien", nullable=false, precision=19, scale=2)
    private BigDecimal amount;

    @Column(name="tieu_de", nullable=false, length=120)
    private String title = "Giao dich";

    @Column(name="noi_dung", length=500)
    private String description;

    @Column(name="ngay_giao_dich", nullable=false)
    private LocalDateTime transactionDate;

    @Column(name="ngay_tao", nullable=false)
    private LocalDateTime createdAt;

    @Transient
    private String image;

    public BigDecimal getSignedAmount() {
        if (type == CategoryType.EXPENSE) return amount.negate();
        return amount;
    }
}
