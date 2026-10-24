package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.ActivityLog;
import Nhom.VI.MoneyCare.service.ActivityLogService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {
    private final ActivityLogService service;
    public ActivityLogController(ActivityLogService service) { this.service = service; }

    @GetMapping
    public List<ActivityLog> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public ActivityLog findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ActivityLog create(@RequestBody ActivityLog entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public ActivityLog update(@PathVariable Long id, @RequestBody ActivityLog entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
