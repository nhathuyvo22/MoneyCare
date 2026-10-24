package Nhom.VI.MoneyCare.controller;

// import thư viện
import Nhom.VI.MoneyCare.entity.Account;
import Nhom.VI.MoneyCare.service.AccountService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService service;

    public AccountController(AccountService service) {
        this.service = service;
    }

    @GetMapping
    public List<Account> getAllAccounts() {
        return service.getAllAccounts();
    }

    @GetMapping("/{id}")
    public Account getAccountById(@PathVariable Long id) {
        return service.getAccountById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Account> getAccountsByUserId(@PathVariable Long userId) {
        return service.getAccountsByUserId(userId);
    }

    @PostMapping
    public String addAccount(@RequestBody Account account) {
       service.createAccount(account);
       return "Them thanh cong!";
    }

    @PutMapping("/{id}")
    public String updateAccount(@PathVariable Long id, @RequestBody Account account) {
        service.updateAccount(id, account);
        return "Cap nhat thanh cong!";
    }

    @DeleteMapping("/{id}")
    public String deleteAccount(@PathVariable Long id) {
        service.deleteAccount(id);
        return "Xoa thanh cong!";
    }
}
