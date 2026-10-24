package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.SavingsTransaction;
import Nhom.VI.MoneyCare.service.SavingsTransactionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/savings-transactions")
public class SavingsTransactionController {
    private final SavingsTransactionService service;
    public SavingsTransactionController(SavingsTransactionService service) { this.service = service; }

    @GetMapping
    public List<SavingsTransaction> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public SavingsTransaction findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public SavingsTransaction create(@RequestBody SavingsTransaction entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public SavingsTransaction update(@PathVariable Long id, @RequestBody SavingsTransaction entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
