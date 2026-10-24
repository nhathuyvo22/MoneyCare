package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ThanhToanHoaDon")
@Data
@NoArgsConstructor
public class BillPayment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_thanh_toan")
    private Long id;

    @Column(name="id_hoa_don", nullable=false)
    private Long billId;

    @Column(name="id_tai_khoan", nullable=false)
    private Long accountId;

    @Column(name="id_giao_dich", unique=true)
    private Long transactionId;

    @Column(name="so_tien", nullable=false, precision=19, scale=2)
    private BigDecimal amount;

    @Column(name="ngay_thanh_toan", nullable=false)
    private LocalDateTime paymentDate;

    @Column(name="ghi_chu", length=255)
    private String note;

}
