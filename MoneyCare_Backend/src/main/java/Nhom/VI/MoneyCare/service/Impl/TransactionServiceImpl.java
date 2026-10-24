package Nhom.VI.MoneyCare.service.Impl;

// import thư viện
import Nhom.VI.MoneyCare.entity.Account;
import Nhom.VI.MoneyCare.entity.Transaction;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.CategoryRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                   AccountRepository accountRepository,
                                   CategoryRepository categoryRepository,
                                   CurrentUserService currentUserService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findByUserId(currentUserService.getUserId());
    }

    @Override
    public List<Transaction> getTransactionsByUserId(Long userId) {
        currentUserService.requireCurrentUser(userId);
        return transactionRepository.findByUserId(userId);
    }

    @Override
    public Transaction getTransactionById(Long id) {
        return transactionRepository.findByIdAndUserId(id, currentUserService.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Khong tim thay Transaction"));
    }

    @Override
    public Transaction createTransaction(Transaction transaction) {
        Long userId = currentUserService.getUserId();
        transaction.setUserId(userId);
        Account account = accountRepository.findByIdAndUserId(transaction.getAccountId(), userId)
                .orElseThrow(() -> new BadRequestException("Account ID khong ton tai"));
        if (transaction.getType() == null) {
            throw new BadRequestException("Loai giao dich khong duoc de trong");
        }
        if (transaction.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            if (transaction.getTargetAccountId() == null) {
                throw new BadRequestException("Chuyen tien phai co tai khoan dich");
            }
            Account target = accountRepository.findByIdAndUserId(transaction.getTargetAccountId(), userId)
                    .orElseThrow(() -> new BadRequestException("Tai khoan dich khong ton tai"));
            if (target.getId().equals(account.getId())) {
                throw new BadRequestException("Tai khoan dich khong hop le");
            }
        } else {
            validateCategory(transaction.getCategoryId(), userId);
        }
        if (transaction.getAmount() == null || transaction.getAmount().signum() <= 0) {
            throw new BadRequestException("So tien phai lon hon 0");
        }
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }

        transaction.setId(null);
        transaction.setCreatedAt(LocalDateTime.now());
        Transaction saved = transactionRepository.save(transaction);
        if (saved.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            Account target = accountRepository.findByIdAndUserId(saved.getTargetAccountId(), userId)
                    .orElseThrow(() -> new BadRequestException("Tai khoan dich khong ton tai"));
            if (account.getBalance().compareTo(saved.getAmount()) < 0) {
                throw new BadRequestException("So du tai khoan nguon khong du");
            }
            account.adjustBalance(saved.getAmount().negate());
            target.adjustBalance(saved.getAmount());
            accountRepository.save(account);
            accountRepository.save(target);
        } else {
            account.adjustBalance(saved.getSignedAmount());
            accountRepository.save(account);
        }
        return saved;
    }

    @Override
    public Transaction updateTransaction(Long id, Transaction newData) {
        Transaction existing = getTransactionById(id);
        Long userId = currentUserService.getUserId();
        Account oldSource = accountRepository.findByIdAndUserId(existing.getAccountId(), userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Transaction account is invalid"));
        Account oldTarget = existing.getTargetAccountId() == null ? null
                : accountRepository.findByIdAndUserId(existing.getTargetAccountId(), userId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Transaction target account is invalid"));

        // Hoan tac giao dich cu trong cung transaction
        if (existing.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            oldSource.adjustBalance(existing.getAmount());
            if (oldTarget != null) {
                oldTarget.adjustBalance(existing.getAmount().negate());
                accountRepository.save(oldTarget);
            }
        } else {
            oldSource.adjustBalance(existing.getSignedAmount().negate());
        }
        accountRepository.save(oldSource);

        Account newSource = accountRepository.findByIdAndUserId(newData.getAccountId(), userId)
                .orElseThrow(() -> new BadRequestException("Account ID khong ton tai"));
        if (newData.getType() == null || newData.getAmount() == null || newData.getAmount().signum() <= 0) {
            throw new BadRequestException("Loai giao dich hop le va so tien phai lon hon 0");
        }
        Account newTarget = null;
        if (newData.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            if (newData.getTargetAccountId() == null) throw new BadRequestException("Chuyen tien phai co tai khoan dich");
            newTarget = accountRepository.findByIdAndUserId(newData.getTargetAccountId(), userId)
                    .orElseThrow(() -> new BadRequestException("Tai khoan dich khong ton tai"));
            if (newTarget.getId().equals(newSource.getId())) {
                throw new BadRequestException("Tai khoan dich khong hop le");
            }
        } else {
            validateCategory(newData.getCategoryId(), userId);
        }

        existing.setUserId(userId);
        existing.setAccountId(newData.getAccountId());
        existing.setTargetAccountId(newData.getTargetAccountId());
        existing.setCategoryId(newData.getCategoryId());
        existing.setPaymentMethodId(newData.getPaymentMethodId());
        existing.setTitle(newData.getTitle() == null ? "Giao dich" : newData.getTitle());
        existing.setAmount(newData.getAmount());
        existing.setType(newData.getType());
        existing.setDescription(newData.getDescription());
        existing.setTransactionDate(newData.getTransactionDate() == null ? LocalDateTime.now() : newData.getTransactionDate());
        existing.setImage(newData.getImage());

        Transaction saved = transactionRepository.save(existing);
        if (saved.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            if (newSource.getBalance().compareTo(saved.getAmount()) < 0) {
                throw new BadRequestException("So du tai khoan nguon khong du");
            }
            newSource.adjustBalance(saved.getAmount().negate());
            newTarget.adjustBalance(saved.getAmount());
            accountRepository.save(newSource);
            accountRepository.save(newTarget);
        } else {
            newSource.adjustBalance(saved.getSignedAmount());
            accountRepository.save(newSource);
        }
        return saved;
    }

    @Override
    public void deleteTransaction(Long id) {
        Transaction existing = getTransactionById(id);
        Long userId = currentUserService.getUserId();
        Account source = accountRepository.findByIdAndUserId(existing.getAccountId(), userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Transaction account is invalid"));
        if (existing.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            source.adjustBalance(existing.getAmount());
            if (existing.getTargetAccountId() != null) {
                Account target = accountRepository.findByIdAndUserId(existing.getTargetAccountId(), userId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Transaction target account is invalid"));
                target.adjustBalance(existing.getAmount().negate());
                accountRepository.save(target);
            }
        } else {
            source.adjustBalance(existing.getSignedAmount().negate());
        }
        accountRepository.save(source);
        transactionRepository.delete(existing);
    }

    private void validateCategory(Long categoryId, Long userId) {
        if (categoryId == null) {
            throw new BadRequestException("Danh muc khong ton tai");
        }
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BadRequestException("Danh muc khong ton tai"));
        if (category.getUserId() != null && !category.getUserId().equals(userId)) {
            throw new BadRequestException("Danh muc khong hop le");
        }
    }

}
