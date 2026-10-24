package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.RecurringTransaction;
import Nhom.VI.MoneyCare.service.RecurringTransactionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recurring-transactions")
public class RecurringTransactionController {
    private final RecurringTransactionService service;
    public RecurringTransactionController(RecurringTransactionService service) { this.service = service; }

    @GetMapping
    public List<RecurringTransaction> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public RecurringTransaction findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public RecurringTransaction create(@RequestBody RecurringTransaction entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public RecurringTransaction update(@PathVariable Long id, @RequestBody RecurringTransaction entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
