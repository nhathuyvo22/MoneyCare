package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import Nhom.VI.MoneyCare.entity.Account;
import Nhom.VI.MoneyCare.entity.CategoryType;
import Nhom.VI.MoneyCare.entity.Transaction;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.CategoryRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.Impl.TransactionServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TransactionOwnershipTests {
    @Mock private TransactionRepository transactionRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private CurrentUserService currentUserService;
    @InjectMocks private TransactionServiceImpl transactionService;

    @Test
    void createRejectsAccountNotOwnedByAuthenticatedUserEvenIfRequestSpoofsUserId() {
        when(currentUserService.getUserId()).thenReturn(5L);
        Account accountOwnedByAnotherUser = new Account();
        accountOwnedByAnotherUser.setId(12L);
        accountOwnedByAnotherUser.setUserId(99L);
        when(accountRepository.findById(12L)).thenReturn(Optional.of(accountOwnedByAnotherUser));

        Transaction request = new Transaction();
        request.setUserId(99L);
        request.setAccountId(12L);
        request.setType(CategoryType.EXPENSE);

        assertThrows(BadRequestException.class, () -> transactionService.createTransaction(request));
        verify(accountRepository).findById(12L);
        verify(transactionRepository, never()).save(request);
    }

    @Test
    void deletingIncomeWithInsufficientBalanceFailsWithoutChangingAccountOrTransaction() {
        Transaction income = new Transaction();
        income.setId(20L);
        income.setUserId(5L);
        income.setAccountId(12L);
        income.setType(CategoryType.INCOME);
        income.setAmount(new BigDecimal("80000000"));

        Account account = new Account();
        account.setId(12L);
        account.setUserId(5L);
        account.setBalance(new BigDecimal("10000000"));

        when(currentUserService.getUserId()).thenReturn(5L);
        when(transactionRepository.findByIdAndUserId(20L, 5L)).thenReturn(Optional.of(income));
        when(accountRepository.findById(12L)).thenReturn(Optional.of(account));

        assertThrows(BadRequestException.class, () -> transactionService.deleteTransaction(20L));

        assertEquals(new BigDecimal("10000000"), account.getBalance());
        verify(accountRepository, never()).save(account);
        verify(transactionRepository, never()).delete(income);
    }

    @Test
    void deletingIncomeWithSufficientBalanceReversesAccountBalance() {
        Transaction income = new Transaction();
        income.setId(20L);
        income.setUserId(5L);
        income.setAccountId(12L);
        income.setType(CategoryType.INCOME);
        income.setAmount(new BigDecimal("80000000"));

        Account account = new Account();
        account.setId(12L);
        account.setUserId(5L);
        account.setBalance(new BigDecimal("90000000"));

        when(currentUserService.getUserId()).thenReturn(5L);
        when(transactionRepository.findByIdAndUserId(20L, 5L)).thenReturn(Optional.of(income));
        when(accountRepository.findById(12L)).thenReturn(Optional.of(account));

        transactionService.deleteTransaction(20L);

        assertEquals(new BigDecimal("10000000"), account.getBalance());
        verify(accountRepository).save(account);
        verify(transactionRepository).delete(income);
    }
}
