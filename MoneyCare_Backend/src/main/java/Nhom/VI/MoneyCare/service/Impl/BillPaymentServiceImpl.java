package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.BillPayment;
import Nhom.VI.MoneyCare.repository.BillPaymentRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.BillPaymentService;
import org.springframework.stereotype.Service;

@Service
public class BillPaymentServiceImpl extends AbstractCrudService<BillPayment> implements BillPaymentService {
    public BillPaymentServiceImpl(BillPaymentRepository repository, CurrentUserService currentUserService,
                                 CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
