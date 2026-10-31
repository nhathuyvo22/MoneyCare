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
        if (currentUserService.isAdmin()) {
            return transactionRepository.findAll();
        }
        return transactionRepository.findByUserId(currentUserService.getUserId());
    }

    @Override
    public List<Transaction> getTransactionsByUserId(Long userId) {
        currentUserService.requireCurrentUser(userId);
        return transactionRepository.findByUserId(userId);
    }

    @Override
    public Transaction getTransactionById(Long id) {
        if (currentUserService.isAdmin()) {
            return transactionRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Khong tim thay Transaction"));
        }
        return transactionRepository.findByIdAndUserId(id, currentUserService.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Khong tim thay Transaction"));
    }

    @Override
    public Transaction createTransaction(Transaction transaction) {
        Long userId = currentUserService.getUserId();
        if (transaction.getUserId() == null || !currentUserService.isAdmin()) {
            transaction.setUserId(userId);
        } else {
            userId = transaction.getUserId();
        }
        final Long effectiveUserId = userId;
        Account account = accountRepository.findById(transaction.getAccountId())
                .filter(a -> currentUserService.isAdmin() || a.getUserId().equals(effectiveUserId))
                .orElseThrow(() -> new BadRequestException("Account ID khong ton tai"));
        if (transaction.getType() == null) {
            throw new BadRequestException("Loai giao dich khong duoc de trong");
        }
        if (transaction.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            if (transaction.getTargetAccountId() == null) {
                throw new BadRequestException("Chuyen tien phai co tai khoan dich");
            }
            Account target = accountRepository.findById(transaction.getTargetAccountId())
                    .filter(a -> currentUserService.isAdmin() || a.getUserId().equals(effectiveUserId))
                    .orElseThrow(() -> new BadRequestException("Tai khoan dich khong ton tai"));
            if (target.getId().equals(account.getId())) {
                throw new BadRequestException("Tai khoan dich khong hop le");
            }
        } else {
            validateCategory(transaction.getCategoryId(), effectiveUserId);
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
            Account target = accountRepository.findById(saved.getTargetAccountId())
                    .filter(a -> currentUserService.isAdmin() || a.getUserId().equals(effectiveUserId))
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
        Long userId = existing.getUserId();
        Account oldSource = accountRepository.findById(existing.getAccountId())
                .filter(a -> currentUserService.isAdmin() || a.getUserId().equals(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Transaction account is invalid"));

        if (existing.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            oldSource.adjustBalance(existing.getAmount());
            if (existing.getTargetAccountId() != null) {
                Account oldTarget = accountRepository.findById(existing.getTargetAccountId())
                        .filter(a -> currentUserService.isAdmin() || a.getUserId().equals(userId))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Old target account is invalid"));
                oldTarget.adjustBalance(existing.getAmount().negate());
                accountRepository.save(oldTarget);
            }
        } else {
            oldSource.adjustBalance(existing.getSignedAmount().negate());
        }
        accountRepository.save(oldSource);

        Long effectiveUserId = userId;
        Account newSource = accountRepository.findById(newData.getAccountId() != null ? newData.getAccountId() : existing.getAccountId())
                .filter(a -> currentUserService.isAdmin() || a.getUserId().equals(effectiveUserId))
                .orElseThrow(() -> new BadRequestException("Tai khoan moi khong ton tai"));

        if (newData.getType() != null) existing.setType(newData.getType());
        if (newData.getAmount() != null) {
            if (newData.getAmount().signum() <= 0) throw new BadRequestException("So tien phai lon hon 0");
            existing.setAmount(newData.getAmount());
        }
        if (newData.getAccountId() != null) existing.setAccountId(newData.getAccountId());
        if (newData.getCategoryId() != null) {
            validateCategory(newData.getCategoryId(), effectiveUserId);
            existing.setCategoryId(newData.getCategoryId());
        }
        if (newData.getDescription() != null) existing.setDescription(newData.getDescription());
        if (newData.getTransactionDate() != null) existing.setTransactionDate(newData.getTransactionDate());

        if (existing.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            Long targetId = newData.getTargetAccountId() != null ? newData.getTargetAccountId() : existing.getTargetAccountId();
            if (targetId == null) throw new BadRequestException("Chuyen tien phai co tai khoan dich");
            Account newTarget = accountRepository.findById(targetId)
                    .filter(a -> currentUserService.isAdmin() || a.getUserId().equals(effectiveUserId))
                    .orElseThrow(() -> new BadRequestException("Tai khoan dich khong ton tai"));
            if (newTarget.getId().equals(newSource.getId())) {
                throw new BadRequestException("Tai khoan dich khong hop le");
            }
            if (newSource.getBalance().compareTo(existing.getAmount()) < 0) {
                throw new BadRequestException("So du tai khoan nguon khong du");
            }
            newSource.adjustBalance(existing.getAmount().negate());
            newTarget.adjustBalance(existing.getAmount());
            accountRepository.save(newSource);
            accountRepository.save(newTarget);
            existing.setTargetAccountId(targetId);
        } else {
            newSource.adjustBalance(existing.getSignedAmount());
            accountRepository.save(newSource);
            existing.setTargetAccountId(null);
        }

        return transactionRepository.save(existing);
    }

    @Override
    public void deleteTransaction(Long id) {
        Transaction existing = getTransactionById(id);
        Long userId = existing.getUserId();
        Account source = accountRepository.findById(existing.getAccountId())
                .filter(a -> currentUserService.isAdmin() || a.getUserId().equals(userId))
                .orElse(null);
        if (source != null) {
            if (existing.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
                source.adjustBalance(existing.getAmount());
                if (existing.getTargetAccountId() != null) {
                    Account target = accountRepository.findById(existing.getTargetAccountId())
                            .filter(a -> currentUserService.isAdmin() || a.getUserId().equals(userId))
                            .orElse(null);
                    if (target != null) {
                        target.adjustBalance(existing.getAmount().negate());
                        accountRepository.save(target);
                    }
                }
            } else {
                source.adjustBalance(existing.getSignedAmount().negate());
            }
            accountRepository.save(source);
        }
        transactionRepository.delete(existing);
    }

    private void validateCategory(Long categoryId, Long userId) {
        if (categoryId == null) {
            throw new BadRequestException("Danh muc khong ton tai");
        }
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BadRequestException("Danh muc khong ton tai"));
        if (category.getUserId() != null && !currentUserService.isAdmin() && !category.getUserId().equals(userId)) {
            throw new BadRequestException("Danh muc khong hop le");
        }
    }
}
