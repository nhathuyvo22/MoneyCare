package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import Nhom.VI.MoneyCare.entity.Account;
import Nhom.VI.MoneyCare.entity.Bill;
import Nhom.VI.MoneyCare.entity.BillPayment;
import Nhom.VI.MoneyCare.entity.CategoryType;
import Nhom.VI.MoneyCare.entity.Transaction;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.BillPaymentRepository;
import Nhom.VI.MoneyCare.repository.BillRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.Impl.BillPaymentServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BillPaymentServiceTests {
    @Mock private BillPaymentRepository paymentRepository;
    @Mock private BillRepository billRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private CurrentUserService currentUserService;
    @Mock private CrudOwnershipService ownershipService;
    @InjectMocks private BillPaymentServiceImpl paymentService;

    @Test
    void paymentCreatesExpenseDebitsAccountAndMarksBillPaid() {
        Bill bill = bill("PENDING", "1120000");
        Account account = account("5000000");
        BillPayment request = new BillPayment();
        request.setBillId(3L);
        request.setAccountId(4L);

        when(currentUserService.getUserId()).thenReturn(5L);
        when(billRepository.findById(3L)).thenReturn(Optional.of(bill));
        when(accountRepository.findById(4L)).thenReturn(Optional.of(account));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction transaction = invocation.getArgument(0);
            assertEquals(CategoryType.EXPENSE, transaction.getType());
            assertNotNull(transaction.getCreatedAt());
            assertNotNull(transaction.getTransactionDate());
            transaction.setId(8L);
            return transaction;
        });
        when(paymentRepository.save(any(BillPayment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BillPayment result = paymentService.create(request);

        assertEquals(new BigDecimal("3880000"), account.getBalance());
        assertEquals("PAID", bill.getStatus());
        assertEquals(new BigDecimal("1120000"), result.getAmount());
        assertEquals(8L, result.getTransactionId());
        verify(transactionRepository).save(any(Transaction.class));
        verify(accountRepository).save(account);
        verify(billRepository).save(bill);
        verify(paymentRepository).save(request);
    }

    @Test
    void paymentWithInsufficientBalanceDoesNotChangeBillOrAccount() {
        Bill bill = bill("PENDING", "1120000");
        Account account = account("1000000");
        BillPayment request = new BillPayment();
        request.setBillId(3L);
        request.setAccountId(4L);

        when(currentUserService.getUserId()).thenReturn(5L);
        when(billRepository.findById(3L)).thenReturn(Optional.of(bill));
        when(accountRepository.findById(4L)).thenReturn(Optional.of(account));

        assertThrows(BadRequestException.class, () -> paymentService.create(request));

        assertEquals(new BigDecimal("1000000"), account.getBalance());
        assertEquals("PENDING", bill.getStatus());
        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(paymentRepository, never()).save(any(BillPayment.class));
    }

    private Bill bill(String status, String amount) {
        Bill bill = new Bill();
        bill.setId(3L);
        bill.setUserId(5L);
        bill.setName("Tiền điện");
        bill.setExpectedAmount(new BigDecimal(amount));
        bill.setStatus(status);
        return bill;
    }

    private Account account(String balance) {
        Account account = new Account();
        account.setId(4L);
        account.setUserId(5L);
        account.setBalance(new BigDecimal(balance));
        return account;
    }
}
