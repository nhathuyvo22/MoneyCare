package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "MucTieuTietKiem")
@Data
@NoArgsConstructor
public class SavingsGoal implements UserOwnedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_muc_tieu")
    private Long id;

    @Column(name="id_nguoi_dung", nullable=false)
    private Long userId;

    @Column(name="ten_muc_tieu", nullable=false, length=120)
    private String name;

    @Column(name="so_tien_muc_tieu", nullable=false, precision=19, scale=2)
    private BigDecimal targetAmount;

    @Column(name="ngay_bat_dau", nullable=false)
    private LocalDate startDate;

    @Column(name="ngay_muc_tieu")
    private LocalDate targetDate;

    @Column(name="mo_ta", length=500)
    private String description;

    @Column(name="trang_thai", nullable=false, length=20)
    private String status = "ACTIVE";

}
