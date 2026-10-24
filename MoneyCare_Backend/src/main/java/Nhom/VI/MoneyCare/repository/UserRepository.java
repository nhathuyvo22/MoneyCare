package Nhom.VI.MoneyCare.repository;

// import thư viện
import Nhom.VI.MoneyCare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// UserRepository: interface kế thừa JpaRepository<Entity, KieuKhoaChinh>
// Spring Data JPA tự động sinh code triển khai các phương thức CRUD cơ bản (save, findAll,
// findById, deleteById...) lúc chạy, không cần viết SQL/HQL thủ công.
public interface UserRepository extends JpaRepository<User, Long> {

    // Quy ước đặt tên: findBy + TenThuocTinh -> Spring tự sinh câu lệnh
    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // Tìm danh sách user có họ tên chứa từ khóa (không phân biệt hoa thường)
    List<User> findByFullNameContainingIgnoreCase(String keyword);
}
