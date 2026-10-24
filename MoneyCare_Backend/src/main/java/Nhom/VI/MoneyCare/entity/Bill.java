package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "HoaDon")
@Data
@NoArgsConstructor
public class Bill implements UserOwnedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_hoa_don")
    private Long id;

    @Column(name="id_nguoi_dung", nullable=false)
    private Long userId;

    @Column(name="ten_hoa_don", nullable=false, length=120)
    private String name;

    @Column(name="so_tien_du_kien", nullable=false, precision=19, scale=2)
    private BigDecimal expectedAmount;

    @Column(name="ngay_phat_sinh", nullable=false)
    private LocalDate createdDate;

    @Column(name="han_thanh_toan")
    private LocalDate dueDate;

    @Column(name="trang_thai", nullable=false, length=30)
    private String status = "ACTIVE";

    @Column(name="mo_ta", length=500)
    private String description;

}
