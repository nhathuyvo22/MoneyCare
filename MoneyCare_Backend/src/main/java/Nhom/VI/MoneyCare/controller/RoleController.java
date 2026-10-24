package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.Role;
import Nhom.VI.MoneyCare.service.RoleService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleService service;
    public RoleController(RoleService service) { this.service = service; }

    @GetMapping
    public List<Role> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Role findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Role create(@RequestBody Role entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public Role update(@PathVariable Long id, @RequestBody Role entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
