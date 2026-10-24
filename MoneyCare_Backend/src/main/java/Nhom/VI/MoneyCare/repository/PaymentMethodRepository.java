package Nhom.VI.MoneyCare.repository;
import Nhom.VI.MoneyCare.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    Optional<PaymentMethod> findByName(String name);
}
