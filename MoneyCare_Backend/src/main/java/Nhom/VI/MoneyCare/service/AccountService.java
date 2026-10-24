package Nhom.VI.MoneyCare.service;

// import thư viện
import Nhom.VI.MoneyCare.entity.Account;

import java.util.List;

public interface AccountService {

    List<Account> getAllAccounts();

    List<Account> getAccountsByUserId(Long userId);

    Account getAccountById(Long id);

    Account createAccount(Account account);

    Account updateAccount(Long id, Account account);

    void deleteAccount(Long id);
}
