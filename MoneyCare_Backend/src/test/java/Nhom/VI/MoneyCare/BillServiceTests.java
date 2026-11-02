package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import Nhom.VI.MoneyCare.entity.Bill;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.BillRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.Impl.BillServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BillServiceTests {
    @Mock private BillRepository billRepository;
    @Mock private CurrentUserService currentUserService;
    @Mock private CrudOwnershipService ownershipService;
    @InjectMocks private BillServiceImpl billService;

    @Test
    void createsBillFromFrontendFieldsAndSetsCreationDate() throws Exception {
        Bill request = new ObjectMapper().readValue("""
                {
                  "billName": "Tiền điện",
                  "amount": 250000,
                  "status": "PENDING"
                }
                """, Bill.class);
        request.setDueDate(LocalDate.of(2026, 11, 15));
        when(currentUserService.getUserId()).thenReturn(5L);
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Bill created = billService.create(request);

        assertEquals("Tiền điện", created.getName());
        assertEquals(new BigDecimal("250000"), created.getExpectedAmount());
        assertEquals(LocalDate.of(2026, 11, 15), created.getDueDate());
        assertNotNull(created.getCreatedDate());
        assertEquals("PENDING", created.getStatus());
        verify(billRepository).save(request);
    }

    @Test
    void rejectsBillWithoutPositiveAmount() {
        Bill request = new Bill();
        request.setName("Tiền điện");

        assertThrows(BadRequestException.class, () -> billService.create(request));

        verify(billRepository, never()).save(any(Bill.class));
    }
}
