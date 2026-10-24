package Nhom.VI.MoneyCare.repository;

// import thư viện
import Nhom.VI.MoneyCare.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {

    // SELECT * FROM accounts WHERE user_id = ?
    List<Account> findByUserId(Long userId);

    java.util.Optional<Account> findByIdAndUserId(Long id, Long userId);
}
