package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "LoaiTaiKhoan")
@Data
@NoArgsConstructor
public class AccountType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_loai_tai_khoan")
    private Long id;

    @Column(name="ten_loai", nullable=false, unique=true, length=50)
    private String name;

    @Column(name="mo_ta", length=255)
    private String description;

}
