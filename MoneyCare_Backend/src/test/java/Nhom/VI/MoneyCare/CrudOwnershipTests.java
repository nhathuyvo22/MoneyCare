package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import Nhom.VI.MoneyCare.entity.Bill;
import Nhom.VI.MoneyCare.entity.BillPayment;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.BillRepository;
import Nhom.VI.MoneyCare.repository.BudgetRepository;
import Nhom.VI.MoneyCare.repository.CategoryRepository;
import Nhom.VI.MoneyCare.repository.SavingsGoalRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class CrudOwnershipTests {
    @Mock private AccountRepository accountRepository;
    @Mock private BillRepository billRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private SavingsGoalRepository savingsGoalRepository;
    @Mock private TransactionRepository transactionRepository;

    private CrudOwnershipService ownershipService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user@example.test", "n/a",
                        java.util.List.of(new SimpleGrantedAuthority("ROLE_USER"))));
        ownershipService = new CrudOwnershipService(accountRepository, billRepository, budgetRepository,
                categoryRepository, savingsGoalRepository, transactionRepository);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void writeReplacesClientSuppliedOwnerWithAuthenticatedOwner() {
        Bill bill = new Bill();
        bill.setUserId(99L);

        ownershipService.prepareForWrite(bill, 5L);

        assertEquals(5L, bill.getUserId());
    }

    @Test
    void billPaymentCannotReferenceAnotherUsersBillOrAccount() {
        Bill bill = new Bill();
        bill.setUserId(5L);
        when(billRepository.findById(3L)).thenReturn(Optional.of(bill));
        when(accountRepository.findByIdAndUserId(4L, 5L)).thenReturn(Optional.empty());
        BillPayment payment = new BillPayment();
        payment.setBillId(3L);
        payment.setAccountId(4L);

        assertThrows(ResponseStatusException.class, () -> ownershipService.prepareForWrite(payment, 5L));
    }
}
