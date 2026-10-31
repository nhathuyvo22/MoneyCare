package Nhom.VI.MoneyCare.service.Impl;

// import thư viện
import Nhom.VI.MoneyCare.entity.Budget;
import Nhom.VI.MoneyCare.entity.BudgetSummary;
import Nhom.VI.MoneyCare.entity.CategoryType;
import Nhom.VI.MoneyCare.entity.Transaction;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.BudgetRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CurrentUserService currentUserService;
    // Can TransactionRepository de tinh tong da chi trong khoang thoi gian cua ngan sach
    private final TransactionRepository transactionRepository;

    public BudgetServiceImpl(BudgetRepository budgetRepository,
                              TransactionRepository transactionRepository,
                              CurrentUserService currentUserService) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    public List<Budget> getAllBudgets() {
        if (currentUserService.isAdmin()) {
            return budgetRepository.findAll();
        }
        return budgetRepository.findByUserId(currentUserService.getUserId());
    }

    @Override
    public List<Budget> getBudgetsByUserId(Long userId) {
        currentUserService.requireCurrentUser(userId);
        return budgetRepository.findByUserId(userId);
    }

    @Override
    public Budget getBudgetById(Long id) {
        if (currentUserService.isAdmin()) {
            return budgetRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Khong tim thay Budget"));
        }
        return budgetRepository.findByIdAndUserId(id, currentUserService.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Khong tim thay Budget"));
    }

    @Override
    public Budget createBudget(Budget budget) {
        if (budget.getUserId() == null || !currentUserService.isAdmin()) {
            budget.setUserId(currentUserService.getUserId());
        }
        if (budget.getBudgetName() == null || budget.getBudgetName().isBlank()) {
            throw new BadRequestException("Ten ngan sach khong duoc de trong");
        }
        if (budget.getStartDate() == null || budget.getEndDate() == null
                || budget.getStartDate().isAfter(budget.getEndDate())) {
            throw new BadRequestException("Ngay bat dau phai truoc ngay ket thuc");
        }
        budget.setId(null);
        budget.setCreatedAt(LocalDateTime.now());
        return budgetRepository.save(budget);
    }

    @Override
    public Budget updateBudget(Long id, Budget newData) {
        Budget existing = getBudgetById(id);
        existing.setBudgetName(newData.getBudgetName());
        existing.setAmount(newData.getAmount());
        existing.setStartDate(newData.getStartDate());
        existing.setEndDate(newData.getEndDate());
        return budgetRepository.save(existing);
    }

    @Override
    public void deleteBudget(Long id) {
        Budget existing = getBudgetById(id);
        budgetRepository.delete(existing);
    }

    @Override
    public List<BudgetSummary> getSummariesByUserId(Long userId) {
        currentUserService.requireCurrentUser(userId);
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<Transaction> allUserTransactions = transactionRepository.findByUserId(userId);
        List<BudgetSummary> summaries = new ArrayList<>();

        for (Budget budget : budgets) {
            LocalDateTime start = budget.getStartDate().atStartOfDay();
            LocalDateTime end = budget.getEndDate().atTime(23, 59, 59);

            BigDecimal spent = allUserTransactions.stream()
                    .filter(t -> t.getType() == CategoryType.EXPENSE
                            && t.getTransactionDate() != null
                            && !t.getTransactionDate().isBefore(start)
                            && !t.getTransactionDate().isAfter(end))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            summaries.add(new BudgetSummary(budget, spent));
        }

        return summaries;
    }
}
