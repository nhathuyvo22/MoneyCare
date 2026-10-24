package Nhom.VI.MoneyCare.controller;

// import thư viện
import Nhom.VI.MoneyCare.entity.Budget;
import Nhom.VI.MoneyCare.entity.BudgetSummary;
import Nhom.VI.MoneyCare.service.BudgetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping
    public List<Budget> getAllBudgets() {
        return service.getAllBudgets();
    }

    @GetMapping("/{id}")
    public Budget getBudgetById(@PathVariable Long id) {
        return service.getBudgetById(id);
    }

    @PostMapping
    public Budget addBudget(@RequestBody Budget budget) {
        return service.createBudget(budget);
    }

    @PutMapping("/{id}")
    public Budget updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        return service.updateBudget(id, budget);
    }

    @DeleteMapping("/{id}")
    public String deleteBudget(@PathVariable Long id) {
        service.deleteBudget(id);
        return "Xoa thanh cong!";
    }

    // Xem "Da chi / Con lai" cua tat ca ngan sach theo User ID
    // http://localhost:8080/api/budgets/user/{userId}/summary
    @GetMapping("/user/{userId}/summary")
    public List<BudgetSummary> getSummariesByUserId(@PathVariable Long userId) {
        return service.getSummariesByUserId(userId);
    }
}
