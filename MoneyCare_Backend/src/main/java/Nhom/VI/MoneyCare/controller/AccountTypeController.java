package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.AccountType;
import Nhom.VI.MoneyCare.service.AccountTypeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/account-types")
public class AccountTypeController {
    private final AccountTypeService service;
    public AccountTypeController(AccountTypeService service) { this.service = service; }

    @GetMapping
    public List<AccountType> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public AccountType findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public AccountType create(@RequestBody AccountType entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public AccountType update(@PathVariable Long id, @RequestBody AccountType entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
