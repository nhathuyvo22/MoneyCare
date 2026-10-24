package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietNganSach")
@Data
@NoArgsConstructor
public class BudgetDetail {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_chi_tiet_ngan_sach")
    private Long id;

    @Column(name="id_ngan_sach", nullable=false)
    private Long budgetId;

    @Column(name="id_danh_muc", nullable=false)
    private Long categoryId;

    @Column(name="han_muc", nullable=false, precision=19, scale=2)
    private BigDecimal limitAmount = BigDecimal.ZERO;

}
