package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.Role;
import Nhom.VI.MoneyCare.repository.RoleRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.RoleService;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl extends AbstractCrudService<Role> implements RoleService {
    public RoleServiceImpl(RoleRepository repository, CurrentUserService currentUserService,
                           CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
