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
import java.time.LocalDate;
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
        return budgetRepository.findByUserId(currentUserService.getUserId());
    }

    @Override
    public List<Budget> getBudgetsByUserId(Long userId) {
        currentUserService.requireCurrentUser(userId);
        return budgetRepository.findByUserId(userId);
    }

    @Override
    public Budget getBudgetById(Long id) {
        return budgetRepository.findByIdAndUserId(id, currentUserService.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Khong tim thay Budget"));
    }

    @Override
    public Budget createBudget(Budget budget) {
        budget.setUserId(currentUserService.getUserId());
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
        List<BudgetSummary> summaries = new ArrayList<>();
        for (Budget budget : getBudgetsByUserId(userId)) {
            summaries.add(calculateSummary(budget));
        }
        return summaries;
    }

    // Tinh "Da chi / Con lai" cho MOT ngan sach, dua tren cac Transaction loai EXPENSE
    // cua dung user do, co transaction_date nam trong [start_date, end_date]
    private BudgetSummary calculateSummary(Budget budget) {
        BigDecimal spent = BigDecimal.ZERO;
        List<Transaction> allTransactions = transactionRepository.findByUserId(budget.getUserId());

        for (Transaction transaction : allTransactions) {
            boolean isExpense = transaction.getType() == CategoryType.EXPENSE;
            LocalDate transactionDate = transaction.getTransactionDate().toLocalDate();
            boolean inRange = budget.isDateInRange(transactionDate);

            if (isExpense && inRange) {
                spent = spent.add(transaction.getAmount());
            }
        }
        return new BudgetSummary(budget, spent);
    }
}
