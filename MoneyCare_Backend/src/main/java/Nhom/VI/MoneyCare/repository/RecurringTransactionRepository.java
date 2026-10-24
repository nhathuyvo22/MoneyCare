package Nhom.VI.MoneyCare.repository;

import Nhom.VI.MoneyCare.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
}
