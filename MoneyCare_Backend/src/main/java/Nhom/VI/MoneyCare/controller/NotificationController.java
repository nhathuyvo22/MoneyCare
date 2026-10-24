package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.Notification;
import Nhom.VI.MoneyCare.service.NotificationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    public List<Notification> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Notification findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Notification create(@RequestBody Notification entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public Notification update(@PathVariable Long id, @RequestBody Notification entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
