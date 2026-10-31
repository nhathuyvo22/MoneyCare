package Nhom.VI.MoneyCare.security;

import Nhom.VI.MoneyCare.entity.AccountType;
import Nhom.VI.MoneyCare.entity.Bill;
import Nhom.VI.MoneyCare.entity.BillPayment;
import Nhom.VI.MoneyCare.entity.Budget;
import Nhom.VI.MoneyCare.entity.BudgetDetail;
import Nhom.VI.MoneyCare.entity.PaymentMethod;
import Nhom.VI.MoneyCare.entity.RecurringTransaction;
import Nhom.VI.MoneyCare.entity.Role;
import Nhom.VI.MoneyCare.entity.SavingsGoal;
import Nhom.VI.MoneyCare.entity.SavingsTransaction;
import Nhom.VI.MoneyCare.entity.UserOwnedEntity;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.BillRepository;
import Nhom.VI.MoneyCare.repository.BudgetRepository;
import Nhom.VI.MoneyCare.repository.CategoryRepository;
import Nhom.VI.MoneyCare.repository.SavingsGoalRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CrudOwnershipService {
    private final AccountRepository accountRepository;
    private final BillRepository billRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final TransactionRepository transactionRepository;

    public CrudOwnershipService(AccountRepository accountRepository, BillRepository billRepository,
                                BudgetRepository budgetRepository, CategoryRepository categoryRepository,
                                SavingsGoalRepository savingsGoalRepository,
                                TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.billRepository = billRepository;
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.transactionRepository = transactionRepository;
    }

    public boolean canRead(Object entity, Long userId) {
        if (isAdmin()) {
            return true;
        }
        if (entity instanceof AccountType || entity instanceof PaymentMethod) {
            return true;
        }
        Long ownerId = getOwnerId(entity);
        return Objects.equals(ownerId, userId) && referencesBelongToUser(entity, userId);
    }

    public void prepareForWrite(Object entity, Long userId) {
        if (entity instanceof AccountType || entity instanceof PaymentMethod || entity instanceof Role) {
            if (!isAdmin()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
            return;
        }
        if (entity instanceof UserOwnedEntity userOwnedEntity) {
            if (userOwnedEntity.getUserId() == null) {
                userOwnedEntity.setUserId(userId);
            }
        }
        if (isAdmin()) {
            return;
        }
        if (!canRead(entity, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
    }

    public void requireReadable(Object entity, Long userId) {
        if (!canRead(entity, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
    }

    public void requireWritable(Object entity, Long userId) {
        if (entity instanceof AccountType || entity instanceof PaymentMethod || entity instanceof Role) {
            if (!isAdmin()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
            return;
        }
        requireReadable(entity, userId);
    }

    private Long getOwnerId(Object entity) {
        if (entity instanceof UserOwnedEntity userOwnedEntity) {
            return userOwnedEntity.getUserId();
        }
        if (entity instanceof BudgetDetail detail) {
            return budgetRepository.findById(detail.getBudgetId()).map(Budget::getUserId).orElse(null);
        }
        if (entity instanceof BillPayment payment) {
            return billRepository.findById(payment.getBillId()).map(Bill::getUserId).orElse(null);
        }
        if (entity instanceof SavingsTransaction transaction) {
            return savingsGoalRepository.findById(transaction.getGoalId()).map(SavingsGoal::getUserId).orElse(null);
        }
        return null;
    }

    private boolean referencesBelongToUser(Object entity, Long userId) {
        if (entity instanceof RecurringTransaction recurring) {
            return ownsAccount(recurring.getAccountId(), userId)
                    && categoryIsAvailable(recurring.getCategoryId(), userId);
        }
        if (entity instanceof BudgetDetail detail) {
            return categoryIsAvailable(detail.getCategoryId(), userId);
        }
        if (entity instanceof BillPayment payment) {
            return ownsAccount(payment.getAccountId(), userId)
                    && (payment.getTransactionId() == null
                    || transactionRepository.findByIdAndUserId(payment.getTransactionId(), userId).isPresent());
        }
        if (entity instanceof SavingsTransaction transaction) {
            return ownsAccount(transaction.getAccountId(), userId);
        }
        return true;
    }

    private boolean ownsAccount(Long accountId, Long userId) {
        return accountId != null && accountRepository.findByIdAndUserId(accountId, userId).isPresent();
    }

    private boolean categoryIsAvailable(Long categoryId, Long userId) {
        if (categoryId == null) {
            return true;
        }
        return categoryRepository.findById(categoryId)
                .map(category -> category.getUserId() == null || category.getUserId().equals(userId))
                .orElse(false);
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority())
                        || "ADMIN".equals(authority.getAuthority()));
    }
}
