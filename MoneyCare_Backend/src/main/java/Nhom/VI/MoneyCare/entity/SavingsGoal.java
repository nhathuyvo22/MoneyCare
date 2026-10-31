package Nhom.VI.MoneyCare.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("name")
    @JsonAlias({"goalName", "tenMucTieu"})
    private String name;

    @Column(name="so_tien_muc_tieu", nullable=false, precision=19, scale=2)
    @JsonProperty("targetAmount")
    @JsonAlias({"soTienMucTieu"})
    private BigDecimal targetAmount;

    @Column(name="ngay_bat_dau", nullable=false)
    @JsonProperty("startDate")
    @JsonAlias({"ngayBatDau"})
    private LocalDate startDate;

    @Column(name="ngay_muc_tieu")
    @JsonProperty("targetDate")
    @JsonAlias({"ngayMucTieu"})
    private LocalDate targetDate;

    @Column(name="mo_ta", length=500)
    @JsonProperty("description")
    @JsonAlias({"moTa"})
    private String description;

    @Column(name="trang_thai", nullable=false, length=20)
    @JsonProperty("status")
    @JsonAlias({"trangThai"})
    private String status = "ACTIVE";

    @Transient
    @JsonProperty("currentAmount")
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @JsonProperty("goalName")
    public String getGoalName() {
        return this.name;
    }

    @JsonProperty("goalName")
    public void setGoalName(String goalName) {
        if (this.name == null || this.name.isEmpty()) {
            this.name = goalName;
        }
    }

    @PrePersist
    public void prePersist() {
        if (this.startDate == null) {
            this.startDate = LocalDate.now();
        }
        if (this.status == null || this.status.isEmpty()) {
            this.status = "ACTIVE";
        }
    }
}
