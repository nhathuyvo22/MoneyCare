package Nhom.VI.MoneyCare.repository;

// import thư viện
import Nhom.VI.MoneyCare.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // SELECT * FROM categories WHERE user_id = ?
    List<Category> findByUserId(Long userId);

    java.util.Optional<Category> findByIdAndUserId(Long id, Long userId);
}
