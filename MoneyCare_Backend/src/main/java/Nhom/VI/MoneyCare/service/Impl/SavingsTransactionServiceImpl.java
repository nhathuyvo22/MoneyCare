package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.Account;
import Nhom.VI.MoneyCare.entity.SavingsTransaction;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.SavingsTransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.SavingsTransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class SavingsTransactionServiceImpl extends AbstractCrudService<SavingsTransaction> implements SavingsTransactionService {

    private final AccountRepository accountRepository;

    public SavingsTransactionServiceImpl(SavingsTransactionRepository repository,
                                         AccountRepository accountRepository,
                                         CurrentUserService currentUserService,
                                         CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional
    public SavingsTransaction create(SavingsTransaction entity) {
        if (entity.getAmount() == null || entity.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("So tien gui phai lon hon 0");
        }
        if (entity.getTransactionDate() == null) {
            entity.setTransactionDate(LocalDateTime.now());
        }

        // Kiểm tra và cập nhật số dư tài khoản / ví
        if (entity.getAccountId() != null) {
            Account account = accountRepository.findById(entity.getAccountId())
                    .orElseThrow(() -> new BadRequestException("Khong tim thay tai khoan nguon"));

            if ("NAP".equalsIgnoreCase(entity.getMovementType())) {
                if (account.getBalance().compareTo(entity.getAmount()) < 0) {
                    throw new BadRequestException("So du trong vi khong du de thuc hien giao dich");
                }
                account.adjustBalance(entity.getAmount().negate());
            } else if ("RUT".equalsIgnoreCase(entity.getMovementType())) {
                account.adjustBalance(entity.getAmount());
            }
            accountRepository.save(account);
        }

        return super.create(entity);
    }
}
