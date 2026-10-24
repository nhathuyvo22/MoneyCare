package Nhom.VI.MoneyCare.repository;

// import thư viện
import Nhom.VI.MoneyCare.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // SELECT * FROM transactions WHERE user_id = ?
    List<Transaction> findByUserId(Long userId);

    java.util.Optional<Transaction> findByIdAndUserId(Long id, Long userId);
}
