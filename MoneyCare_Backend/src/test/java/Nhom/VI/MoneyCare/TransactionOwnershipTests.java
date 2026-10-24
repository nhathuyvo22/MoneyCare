package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import Nhom.VI.MoneyCare.entity.CategoryType;
import Nhom.VI.MoneyCare.entity.Transaction;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.CategoryRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.Impl.TransactionServiceImpl;
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
        when(accountRepository.findByIdAndUserId(12L, 5L)).thenReturn(Optional.empty());

        Transaction request = new Transaction();
        request.setUserId(99L);
        request.setAccountId(12L);
        request.setType(CategoryType.EXPENSE);

        assertThrows(BadRequestException.class, () -> transactionService.createTransaction(request));
        verify(accountRepository).findByIdAndUserId(12L, 5L);
        verify(transactionRepository, never()).save(request);
    }
}
