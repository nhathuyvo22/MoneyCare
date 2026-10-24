package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.SavingsTransaction;
import Nhom.VI.MoneyCare.repository.SavingsTransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.SavingsTransactionService;
import org.springframework.stereotype.Service;

@Service
public class SavingsTransactionServiceImpl extends AbstractCrudService<SavingsTransaction> implements SavingsTransactionService {
    public SavingsTransactionServiceImpl(SavingsTransactionRepository repository,
                                         CurrentUserService currentUserService,
                                         CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
