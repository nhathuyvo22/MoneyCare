package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.SavingsGoal;
import Nhom.VI.MoneyCare.service.SavingsGoalService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/savings-goals")
public class SavingsGoalController {
    private final SavingsGoalService service;
    public SavingsGoalController(SavingsGoalService service) { this.service = service; }

    @GetMapping
    public List<SavingsGoal> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public SavingsGoal findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public SavingsGoal create(@RequestBody SavingsGoal entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public SavingsGoal update(@PathVariable Long id, @RequestBody SavingsGoal entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
