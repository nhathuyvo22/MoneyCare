package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.BudgetDetail;
import Nhom.VI.MoneyCare.service.BudgetDetailService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budget-details")
public class BudgetDetailController {
    private final BudgetDetailService service;
    public BudgetDetailController(BudgetDetailService service) { this.service = service; }

    @GetMapping
    public List<BudgetDetail> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public BudgetDetail findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public BudgetDetail create(@RequestBody BudgetDetail entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public BudgetDetail update(@PathVariable Long id, @RequestBody BudgetDetail entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
