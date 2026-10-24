package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TaiKhoan")
@Data
@NoArgsConstructor
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_tai_khoan")
    private Long id;

    @Column(name="id_nguoi_dung", nullable=false)
    private Long userId;

    @Column(name="id_loai_tai_khoan", nullable=false)
    private Long accountTypeId;

    @Column(name="ten_tai_khoan", nullable=false, length=100)
    private String accountName;

    @Column(name="so_du_ban_dau", nullable=false, precision=19, scale=2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(name="so_du_hien_tai", nullable=false, precision=19, scale=2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name="don_vi_tien", nullable=false, length=3)
    private String currency = "VND";

    @Column(name="mo_ta", length=255)
    private String description;

    @Column(name="trang_thai", nullable=false, length=20)
    private String status = "ACTIVE";

    @Column(name="ngay_tao", nullable=false)
    private LocalDateTime createdAt;

    @Transient
    private String accountType;

    public Account(Long id, Long userId, String accountName, String accountType,
                   BigDecimal balance, String currency, LocalDateTime createdAt) {
        this.id=id; this.userId=userId; this.accountName=accountName; this.accountType=accountType;
        this.balance=balance; this.openingBalance=balance; this.currency=currency; this.createdAt=createdAt;
    }

    public void adjustBalance(BigDecimal amount) {
        if (this.balance == null) this.balance = BigDecimal.ZERO;
        this.balance = this.balance.add(amount);
    }
}
