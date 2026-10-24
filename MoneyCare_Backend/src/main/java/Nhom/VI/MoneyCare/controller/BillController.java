package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.Bill;
import Nhom.VI.MoneyCare.service.BillService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {
    private final BillService service;
    public BillController(BillService service) { this.service = service; }

    @GetMapping
    public List<Bill> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Bill findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Bill create(@RequestBody Bill entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public Bill update(@PathVariable Long id, @RequestBody Bill entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
