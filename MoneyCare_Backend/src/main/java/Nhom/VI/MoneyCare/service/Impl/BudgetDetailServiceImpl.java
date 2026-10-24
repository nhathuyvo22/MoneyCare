package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.BudgetDetail;
import Nhom.VI.MoneyCare.repository.BudgetDetailRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.BudgetDetailService;
import org.springframework.stereotype.Service;

@Service
public class BudgetDetailServiceImpl extends AbstractCrudService<BudgetDetail> implements BudgetDetailService {
    public BudgetDetailServiceImpl(BudgetDetailRepository repository, CurrentUserService currentUserService,
                                   CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
