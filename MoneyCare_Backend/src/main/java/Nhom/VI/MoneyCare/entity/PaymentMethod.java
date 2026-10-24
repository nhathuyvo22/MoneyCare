package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PhuongThucThanhToan")
@Data
@NoArgsConstructor
public class PaymentMethod {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_phuong_thuc")
    private Long id;

    @Column(name="ten_phuong_thuc", nullable=false, unique=true, length=50)
    private String name;

    @Column(name="mo_ta", length=255)
    private String description;

}
