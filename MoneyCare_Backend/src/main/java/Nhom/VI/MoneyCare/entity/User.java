package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "NguoiDung")
@Data
@NoArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_nguoi_dung")
    private Long id;

    @Column(name="id_vai_tro", nullable=false)
    private Long roleId;

    @Column(name="ho_ten", nullable=false, length=100)
    private String fullName;

    @Column(name="email", nullable=false, unique=true, length=150)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name="mat_khau_hash", nullable=false, length=255)
    private String password;

    @Column(name="so_dien_thoai", length=20)
    private String phone;

    @Column(name="ngay_sinh")
    private LocalDate birthDate;

    @Column(name="gioi_tinh", length=20)
    private String gender;

    @Column(name="trang_thai", nullable=false, length=20)
    private String status = "ACTIVE";

    @Column(name="ngay_tao", nullable=false)
    private LocalDateTime createdAt;

    @Column(name="ngay_cap_nhat")
    private LocalDateTime updatedAt;

    @Transient
    private String avatar;

    public User(Long id, String fullName, String email, String password, String phone,
                String avatar, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id=id; this.fullName=fullName; this.email=email; this.password=password;
        this.phone=phone; this.avatar=avatar; this.createdAt=createdAt; this.updatedAt=updatedAt;
    }
}
