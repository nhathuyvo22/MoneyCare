package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.Notification;
import Nhom.VI.MoneyCare.repository.NotificationRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.NotificationService;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl extends AbstractCrudService<Notification> implements NotificationService {
    public NotificationServiceImpl(NotificationRepository repository, CurrentUserService currentUserService,
                                   CrudOwnershipService ownershipService) {
        super(repository, currentUserService, ownershipService);
    }
}
