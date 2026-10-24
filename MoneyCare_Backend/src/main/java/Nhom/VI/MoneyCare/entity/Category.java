package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "DanhMuc")
@Data
@NoArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_danh_muc")
    private Long id;

    @Column(name="id_nguoi_dung")
    private Long userId;

    @Column(name="ten_danh_muc", nullable=false, length=80)
    private String categoryName;

    @Convert(converter = CategoryTypeConverter.class)
    @Column(name="loai_danh_muc", nullable=false, length=10)
    private CategoryType type;

    @Column(name="id_danh_muc_cha")
    private Long parentCategoryId;

    @Column(name="mo_ta", length=255)
    private String description;

    @Column(name="trang_thai", nullable=false, length=20)
    private String status = "ACTIVE";

    @Transient private String icon;
    @Transient private String color;

    public Category(Long id, Long userId, String categoryName, CategoryType type, String icon, String color) {
        this.id=id; this.userId=userId; this.categoryName=categoryName; this.type=type; this.icon=icon; this.color=color;
    }
}
