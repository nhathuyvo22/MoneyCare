package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.RecurringTransaction;
import Nhom.VI.MoneyCare.repository.RecurringTransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.RecurringTransactionService;
import org.springframework.stereotype.Service;

@Service
public class RecurringTransactionServiceImpl extends AbstractCrudService<RecurringTransaction> implements RecurringTransactionService {
    public RecurringTransactionServiceImpl(RecurringTransactionRepository repository,
                                           CurrentUserService currentUserService,
                                           CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
