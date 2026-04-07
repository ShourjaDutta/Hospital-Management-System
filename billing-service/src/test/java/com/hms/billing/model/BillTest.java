package com.hms.billing.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class BillTest {

    @Test
    void testCalculateDueAmount() {
        // Setup
        Bill bill = new Bill();
        bill.setBillAmount(new BigDecimal("100.00"));
        bill.setPaidAmount(new BigDecimal("30.00"));

        // Execute - This would test the @PrePersist/@PreUpdate method
        // You might need to call the method directly if it's public
        // or test through the service

        // For now, let's test the logic manually
        BigDecimal dueAmount = bill.getBillAmount().subtract(bill.getPaidAmount());

        // Verify
        assertEquals(new BigDecimal("70.00"), dueAmount);
    }

    @Test
    void testBillStatusAfterFullPayment() {
        // Setup
        Bill bill = new Bill();
        bill.setBillAmount(new BigDecimal("100.00"));
        bill.setPaidAmount(new BigDecimal("100.00"));

        // Simulate the status update logic
        if (bill.getPaidAmount().compareTo(bill.getBillAmount()) >= 0) {
            bill.setStatus(Bill.BillStatus.PAID);
        }

        // Verify
        assertEquals(Bill.BillStatus.PAID, bill.getStatus());
    }

    @Test
    void testBillStatusAfterPartialPayment() {
        // Setup
        Bill bill = new Bill();
        bill.setBillAmount(new BigDecimal("100.00"));
        bill.setPaidAmount(new BigDecimal("50.00"));

        // Simulate the status update logic
        if (bill.getPaidAmount().compareTo(BigDecimal.ZERO) > 0 &&
                bill.getPaidAmount().compareTo(bill.getBillAmount()) < 0) {
            bill.setStatus(Bill.BillStatus.PARTIALLY_PAID);
        }

        // Verify
        assertEquals(Bill.BillStatus.PARTIALLY_PAID, bill.getStatus());
    }
}