package Nhom.VI.MoneyCare.repository;

import Nhom.VI.MoneyCare.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Long> {
}
