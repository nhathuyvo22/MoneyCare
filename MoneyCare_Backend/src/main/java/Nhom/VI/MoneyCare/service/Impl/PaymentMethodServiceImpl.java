package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.PaymentMethod;
import Nhom.VI.MoneyCare.repository.PaymentMethodRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.PaymentMethodService;
import org.springframework.stereotype.Service;

@Service
public class PaymentMethodServiceImpl extends AbstractCrudService<PaymentMethod> implements PaymentMethodService {
    public PaymentMethodServiceImpl(PaymentMethodRepository repository, CurrentUserService currentUserService,
                                   CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
