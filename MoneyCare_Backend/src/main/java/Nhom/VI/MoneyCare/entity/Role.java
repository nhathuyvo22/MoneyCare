package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "VaiTro")
@Data
@NoArgsConstructor
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_vai_tro")
    private Long id;

    @Column(name="ten_vai_tro", nullable=false, unique=true, length=30)
    private String name;

    @Column(name="mo_ta", length=255)
    private String description;

}
