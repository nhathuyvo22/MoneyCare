package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "NhatKyHoatDong")
@Data
@NoArgsConstructor
public class ActivityLog implements UserOwnedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_nhat_ky")
    private Long id;

    @Column(name="id_nguoi_dung")
    private Long userId;

    @Column(name="hanh_dong", nullable=false, length=50)
    private String action;

    @Column(name="doi_tuong", nullable=false, length=60)
    private String objectType;

    @Column(name="id_doi_tuong")
    private Long objectId;

    @Column(name="mo_ta", length=500)
    private String description;

    @Column(name="thoi_gian", nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
