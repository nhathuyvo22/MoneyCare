package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import Nhom.VI.MoneyCare.entity.Account;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.AccountTypeRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.Impl.AccountServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AccountOwnershipTests {
    @Mock private AccountRepository accountRepository;
    @Mock private AccountTypeRepository accountTypeRepository;
    @Mock private CurrentUserService currentUserService;
    @InjectMocks private AccountServiceImpl accountService;

    @Test
    void createAccountUsesAuthenticatedOwnerInsteadOfRequestUserId() {
        when(currentUserService.getUserId()).thenReturn(5L);

        Account request = new Account();
        request.setUserId(99L);
        request.setAccountName("Main");
        request.setAccountTypeId(1L);

        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account created = accountService.createAccount(request);

        assertEquals(5L, created.getUserId());
        verify(accountRepository).save(request);
    }

    @Test
    void updateDoesNotAllowChangingBalanceOpeningBalanceOrStatus() {
        when(currentUserService.getUserId()).thenReturn(5L);

        Account existing = new Account();
        existing.setId(10L);
        existing.setUserId(5L);
        existing.setBalance(new BigDecimal("120.00"));
        existing.setOpeningBalance(new BigDecimal("100.00"));
        existing.setStatus("ACTIVE");

        Account request = new Account();
        request.setAccountName("Renamed");
        request.setBalance(new BigDecimal("9999.00"));
        request.setOpeningBalance(new BigDecimal("9999.00"));
        request.setStatus("DISABLED");

        when(accountRepository.findByIdAndUserId(10L, 5L)).thenReturn(Optional.of(existing));
        when(accountRepository.save(existing)).thenReturn(existing);

        Account updated = accountService.updateAccount(10L, request);

        assertEquals(new BigDecimal("120.00"), updated.getBalance());
        assertEquals(new BigDecimal("100.00"), updated.getOpeningBalance());
        assertEquals("ACTIVE", updated.getStatus());
        assertEquals("Renamed", updated.getAccountName());
    }

    @Test
    void adminCanChangeAccountStatus() {
        Account existing = new Account();
        existing.setId(10L);
        existing.setUserId(5L);
        existing.setAccountName("Main");
        existing.setStatus("ACTIVE");

        Account request = new Account();
        request.setAccountName("Main");
        request.setStatus("SUSPENDED");

        when(currentUserService.isAdmin()).thenReturn(true);
        when(accountRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(accountRepository.save(existing)).thenReturn(existing);

        Account updated = accountService.updateAccount(10L, request);

        assertEquals("SUSPENDED", updated.getStatus());
        verify(accountRepository).save(existing);
    }
}
