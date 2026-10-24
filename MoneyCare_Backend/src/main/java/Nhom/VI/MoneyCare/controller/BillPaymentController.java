package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.BillPayment;
import Nhom.VI.MoneyCare.service.BillPaymentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bill-payments")
public class BillPaymentController {
    private final BillPaymentService service;
    public BillPaymentController(BillPaymentService service) { this.service = service; }

    @GetMapping
    public List<BillPayment> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public BillPayment findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public BillPayment create(@RequestBody BillPayment entity) { return service.create(entity); }

    @PutMapping("/{id}")
    public BillPayment update(@PathVariable Long id, @RequestBody BillPayment entity) { return service.update(id, entity); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
