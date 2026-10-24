package Nhom.VI.MoneyCare.service.Impl;

// import thư viện
import Nhom.VI.MoneyCare.entity.Account;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.AccountTypeRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final CurrentUserService currentUserService;

    public AccountServiceImpl(AccountRepository accountRepository, AccountTypeRepository accountTypeRepository,
                              CurrentUserService currentUserService) {
        this.accountRepository = accountRepository;
        this.accountTypeRepository = accountTypeRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    public List<Account> getAllAccounts() {
        return accountRepository.findByUserId(currentUserService.getUserId());
    }

    @Override
    public List<Account> getAccountsByUserId(Long userId) {
        currentUserService.requireCurrentUser(userId);
        return accountRepository.findByUserId(userId);
    }

    @Override
    public Account getAccountById(Long id) {
        return accountRepository.findByIdAndUserId(id, currentUserService.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Khong tim thay Account"));
    }

    @Override
    public Account createAccount(Account account) {
        if (account.getAccountName() == null || account.getAccountName().isBlank()) {
            throw new BadRequestException("Ten tai khoan khong duoc de trong");
        }
        account.setUserId(currentUserService.getUserId());
        if (account.getBalance() == null) account.setBalance(BigDecimal.ZERO);
        if (account.getOpeningBalance() == null) account.setOpeningBalance(account.getBalance());
        if (account.getAccountTypeId() == null) {
            String typeName = normalizeAccountType(account.getAccountType());
            account.setAccountTypeId(accountTypeRepository.findByName(typeName)
                    .orElseThrow(() -> new BadRequestException("Loai tai khoan khong ton tai")).getId());
        }
        account.setId(null);
        account.setCreatedAt(LocalDateTime.now());
        return accountRepository.save(account);
    }

    @Override
    public Account updateAccount(Long id, Account newData) {
        Account existing = getAccountById(id);
        existing.setAccountName(newData.getAccountName());
        existing.setAccountType(newData.getAccountType());
        if (newData.getAccountTypeId() != null) {
            existing.setAccountTypeId(newData.getAccountTypeId());
        } else if (newData.getAccountType() != null) {
            String typeName = normalizeAccountType(newData.getAccountType());
            existing.setAccountTypeId(accountTypeRepository.findByName(typeName)
                    .orElseThrow(() -> new BadRequestException("Loai tai khoan khong ton tai")).getId());
        }
        if (newData.getCurrency() != null) existing.setCurrency(newData.getCurrency());
        if (newData.getDescription() != null) existing.setDescription(newData.getDescription());
        return accountRepository.save(existing);
    }

    @Override
    public void deleteAccount(Long id) {
        Account existing = getAccountById(id);
        accountRepository.delete(existing);
    }
    private String normalizeAccountType(String value) {
        if (value == null || value.isBlank()) return "TIEN_MAT";
        return switch (value.trim().toUpperCase().replace('-', '_').replace(' ', '_')) {
            case "CASH", "TIEN_MAT" -> "TIEN_MAT";
            case "BANK", "BANK_ACCOUNT", "NGAN_HANG" -> "NGAN_HANG";
            case "E_WALLET", "EWALLET", "VI_DIEN_TU" -> "VI_DIEN_TU";
            case "CREDIT_CARD", "THE_TIN_DUNG" -> "THE_TIN_DUNG";
            default -> value.trim().toUpperCase();
        };
    }

}
