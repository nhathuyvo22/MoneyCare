package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.SavingsGoal;
import Nhom.VI.MoneyCare.repository.SavingsGoalRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.SavingsGoalService;
import org.springframework.stereotype.Service;

@Service
public class SavingsGoalServiceImpl extends AbstractCrudService<SavingsGoal> implements SavingsGoalService {
    public SavingsGoalServiceImpl(SavingsGoalRepository repository, CurrentUserService currentUserService,
                                  CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
