package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.service.CrudService;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

public abstract class AbstractCrudService<T> implements CrudService<T> {
    private final JpaRepository<T, Long> repository;
    private final CurrentUserService currentUserService;
    private final CrudOwnershipService ownershipService;

    protected AbstractCrudService(JpaRepository<T, Long> repository, CurrentUserService currentUserService,
                                  CrudOwnershipService ownershipService) {
        this.repository = repository;
        this.currentUserService = currentUserService;
        this.ownershipService = ownershipService;
    }

    @Override @Transactional(readOnly = true)
    public List<T> findAll() {
        Long userId = currentUserService.getUserId();
        return repository.findAll().stream()
                .filter(entity -> ownershipService.canRead(entity, userId))
                .toList();
    }

    @Override @Transactional(readOnly = true)
    public T findById(Long id) {
        Long userId = currentUserService.getUserId();
        T entity = repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        ownershipService.requireReadable(entity, userId);
        return entity;
    }

    @Override @Transactional
    public T create(T entity) {
        Long userId = currentUserService.getUserId();
        ownershipService.prepareForWrite(entity, userId);
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, null);
        } catch (ReflectiveOperationException ignored) {
            throw new IllegalStateException("Entity can co field id", ignored);
        }
        return repository.save(entity);
    }

    @Override @Transactional
    public T update(Long id, T entity) {
        Long userId = currentUserService.getUserId();
        T existing = repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        ownershipService.requireWritable(existing, userId);
        ownershipService.prepareForWrite(entity, userId);
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (ReflectiveOperationException ignored) {
            throw new IllegalStateException("Entity can co field id", ignored);
        }
        return repository.save(entity);
    }

    @Override @Transactional
    public void delete(Long id) {
        Long userId = currentUserService.getUserId();
        T existing = repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        ownershipService.requireWritable(existing, userId);
        repository.delete(existing);
    }
}
