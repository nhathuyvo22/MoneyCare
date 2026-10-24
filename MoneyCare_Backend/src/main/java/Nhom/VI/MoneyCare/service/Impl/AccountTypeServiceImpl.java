package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.AccountType;
import Nhom.VI.MoneyCare.repository.AccountTypeRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.AccountTypeService;
import org.springframework.stereotype.Service;

@Service
public class AccountTypeServiceImpl extends AbstractCrudService<AccountType> implements AccountTypeService {
    public AccountTypeServiceImpl(AccountTypeRepository repository, CurrentUserService currentUserService,
                                  CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
