package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ThongBao")
@Data
@NoArgsConstructor
public class Notification implements UserOwnedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_thong_bao")
    private Long id;

    @Column(name="id_nguoi_dung", nullable=false)
    private Long userId;

    @Column(name="tieu_de", nullable=false, length=150)
    private String title;

    @Column(name="noi_dung", nullable=false, length=1000)
    private String content;

    @Column(name="loai_thong_bao", nullable=false, length=30)
    private String type;

    @Column(name="da_doc", nullable=false)
    private Boolean read = false;

    @Column(name="ngay_tao", nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
