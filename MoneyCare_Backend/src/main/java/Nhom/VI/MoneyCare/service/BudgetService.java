package Nhom.VI.MoneyCare.service;

// import thư viện
import Nhom.VI.MoneyCare.entity.Budget;
import Nhom.VI.MoneyCare.entity.BudgetSummary;

import java.util.List;

public interface BudgetService {

    List<Budget> getAllBudgets();

    List<Budget> getBudgetsByUserId(Long userId);

    Budget getBudgetById(Long id);

    Budget createBudget(Budget budget);

    Budget updateBudget(Long id, Budget budget);

    void deleteBudget(Long id);

    // Tinh "Da chi / Con lai" cho tat ca ngan sach cua 1 user
    List<BudgetSummary> getSummariesByUserId(Long userId);
}
