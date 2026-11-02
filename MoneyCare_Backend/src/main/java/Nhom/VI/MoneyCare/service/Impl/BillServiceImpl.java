package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.Bill;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.BillRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.BillService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
public class BillServiceImpl extends AbstractCrudService<Bill> implements BillService {
    private final BillRepository repository;

    public BillServiceImpl(BillRepository repository, CurrentUserService currentUserService,
                           CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
        this.repository = repository;
    }

    @Override
    @Transactional
    public Bill create(Bill bill) {
        if (bill.getName() == null || bill.getName().isBlank()) {
            throw new BadRequestException("Ten hoa don khong duoc de trong");
        }
        if (bill.getExpectedAmount() == null || bill.getExpectedAmount().signum() <= 0) {
            throw new BadRequestException("So tien hoa don phai lon hon 0");
        }
        if (bill.getCreatedDate() == null) {
            bill.setCreatedDate(LocalDate.now());
        }
        return super.create(bill);
    }
}
