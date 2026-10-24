package Nhom.VI.MoneyCare.repository;

// import thư viện
import Nhom.VI.MoneyCare.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // SELECT * FROM budgets WHERE user_id = ?
    List<Budget> findByUserId(Long userId);

    java.util.Optional<Budget> findByIdAndUserId(Long id, Long userId);
}
