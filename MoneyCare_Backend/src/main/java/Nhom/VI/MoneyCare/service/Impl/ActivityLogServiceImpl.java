package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.ActivityLog;
import Nhom.VI.MoneyCare.repository.ActivityLogRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.ActivityLogService;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogServiceImpl extends AbstractCrudService<ActivityLog> implements ActivityLogService {
    public ActivityLogServiceImpl(ActivityLogRepository repository, CurrentUserService currentUserService,
                                  CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
