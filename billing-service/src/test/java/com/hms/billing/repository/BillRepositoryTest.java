package com.hms.billing.repository;

import com.hms.billing.model.Bill;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class BillRepositoryTest {

    @Autowired
    private BillRepository billRepository;

    @Test
    void testSaveBill() {
        // Setup
        Bill bill = new Bill();
        bill.setPatientId(1L);
        bill.setBillAmount(new BigDecimal("100.00"));
        bill.setStatus(Bill.BillStatus.PENDING);

        // Execute
        Bill saved = billRepository.save(bill);

        // Verify
        assertNotNull(saved.getId());
        assertEquals(1L, saved.getPatientId());
        assertEquals(new BigDecimal("100.00"), saved.getBillAmount());
        assertEquals(Bill.BillStatus.PENDING, saved.getStatus());
    }

    @Test
    void testFindByPatientId() {
        // Setup
        Bill bill = new Bill();
        bill.setPatientId(1L);
        bill.setBillAmount(new BigDecimal("100.00"));
        billRepository.save(bill);

        // Execute
        List<Bill> result = billRepository.findByPatientId(1L);

        // Verify
        assertFalse(result.isEmpty());
        assertEquals(1L, result.get(0).getPatientId());
    }

    @Test
    void testFindByStatus() {
        // Setup
        Bill bill = new Bill();
        bill.setPatientId(1L);
        bill.setBillAmount(new BigDecimal("100.00"));
        bill.setStatus(Bill.BillStatus.PENDING);
        billRepository.save(bill);

        // Execute
        List<Bill> result = billRepository.findByStatus(Bill.BillStatus.PENDING);

        // Verify
        assertFalse(result.isEmpty());
        assertEquals(Bill.BillStatus.PENDING, result.get(0).getStatus());
    }

    @Test
    void testFindByAppointmentId() {
        // Setup
        Bill bill = new Bill();
        bill.setPatientId(1L);
        bill.setAppointmentId(100L);
        bill.setBillAmount(new BigDecimal("100.00"));
        billRepository.save(bill);

        // Execute
        List<Bill> result = billRepository.findByAppointmentId(100L);

        // Verify
        assertFalse(result.isEmpty());
        assertEquals(100L, result.get(0).getAppointmentId());
    }
}