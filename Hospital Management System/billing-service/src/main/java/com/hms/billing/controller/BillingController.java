package com.hms.billing.controller;

import com.hms.billing.model.Bill;
import com.hms.billing.service.BillingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/bills")
public class BillingController {

    @Autowired
    private BillingService billingService;

    @PostMapping
    public ResponseEntity<Bill> createBill(@RequestBody Bill bill) {
        try {
            Bill savedBill = billingService.createBill(bill);
            return new ResponseEntity<>(savedBill, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            log.error("Error creating bill: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getAllBills() {
        List<Bill> bills = billingService.getAllBills();
        return new ResponseEntity<>(bills, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Long id) {
        try {
            Bill bill = billingService.getBillById(id);
            return new ResponseEntity<>(bill, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Bill>> getBillsByPatient(@PathVariable Long patientId) {
        List<Bill> bills = billingService.getBillsByPatientId(patientId);
        return new ResponseEntity<>(bills, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Bill>> getBillsByStatus(@PathVariable String status) {
        try {
            Bill.BillStatus statusEnum = Bill.BillStatus.valueOf(status.toUpperCase());
            List<Bill> bills = billingService.getBillsByStatus(statusEnum);
            return new ResponseEntity<>(bills, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<Bill>> getBillsByAppointment(@PathVariable Long appointmentId) {
        List<Bill> bills = billingService.getBillsByAppointmentId(appointmentId);
        return new ResponseEntity<>(bills, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bill> updateBill(@PathVariable Long id, @RequestBody Bill billDetails) {
        try {
            Bill updatedBill = billingService.updateBill(id, billDetails);
            return new ResponseEntity<>(updatedBill, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<Bill> makePayment(@PathVariable Long id,
                                            @RequestParam BigDecimal amount,
                                            @RequestParam String paymentMethod) {
        try {
            Bill.PaymentMethod method = Bill.PaymentMethod.valueOf(paymentMethod.toUpperCase());
            Bill bill = billingService.makePayment(id, amount, method);
            return new ResponseEntity<>(bill, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/patient/{patientId}/total-due")
    public ResponseEntity<BigDecimal> getTotalDueAmount(@PathVariable Long patientId) {
        BigDecimal totalDue = billingService.getTotalDueAmountByPatient(patientId);
        return new ResponseEntity<>(totalDue, HttpStatus.OK);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Bill>> getOverdueBills() {
        List<Bill> overdueBills = billingService.getOverdueBills();
        return new ResponseEntity<>(overdueBills, HttpStatus.OK);
    }

    @PostMapping("/update-overdue")
    public ResponseEntity<Void> updateOverdueBills() {
        billingService.updateOverdueBills();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        try {
            billingService.deleteBill(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}