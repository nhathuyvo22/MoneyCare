package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.Bill;
import Nhom.VI.MoneyCare.repository.BillRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.BillService;
import org.springframework.stereotype.Service;

@Service
public class BillServiceImpl extends AbstractCrudService<Bill> implements BillService {
    public BillServiceImpl(BillRepository repository, CurrentUserService currentUserService,
                           CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
