package com.hms.billing.service;

import com.hms.billing.model.Bill;
import com.hms.billing.repository.BillRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BillingServiceTest {

    @Mock
    private BillRepository billRepository;

    @InjectMocks
    private BillingService billingService;

    @Test
    void testCreateBill() {
        // Setup
        Bill bill = new Bill();
        bill.setPatientId(1L);
        bill.setBillAmount(new BigDecimal("100.00"));

        when(billRepository.save(any(Bill.class))).thenReturn(bill);

        // Execute
        Bill result = billingService.createBill(bill);

        // Verify
        assertNotNull(result);
        assertEquals(1L, result.getPatientId());
        assertEquals(new BigDecimal("100.00"), result.getBillAmount());
        verify(billRepository, times(1)).save(bill);
    }

    @Test
    void testGetAllBills() {
        // Setup
        Bill bill1 = new Bill();
        bill1.setId(1L);
        bill1.setPatientId(1L);

        Bill bill2 = new Bill();
        bill2.setId(2L);
        bill2.setPatientId(2L);

        List<Bill> bills = Arrays.asList(bill1, bill2);
        when(billRepository.findAll()).thenReturn(bills);

        // Execute
        List<Bill> result = billingService.getAllBills();

        // Verify
        assertEquals(2, result.size());
        verify(billRepository, times(1)).findAll();
    }

    @Test
    void testGetBillById_Found() {
        // Setup
        Bill bill = new Bill();
        bill.setId(1L);
        bill.setPatientId(1L);

        when(billRepository.findById(1L)).thenReturn(Optional.of(bill));

        // Execute
        Bill result = billingService.getBillById(1L);

        // Verify
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(billRepository, times(1)).findById(1L);
    }

    @Test
    void testGetBillById_NotFound() {
        // Setup
        when(billRepository.findById(99L)).thenReturn(Optional.empty());

        // Execute & Verify
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> billingService.getBillById(99L));
        assertEquals("Bill not found with id: 99", exception.getMessage());
    }

    @Test
    void testGetBillsByPatientId() {
        // Setup
        Bill bill1 = new Bill();
        bill1.setId(1L);
        bill1.setPatientId(1L);

        Bill bill2 = new Bill();
        bill2.setId(2L);
        bill2.setPatientId(1L);

        List<Bill> bills = Arrays.asList(bill1, bill2);
        when(billRepository.findByPatientId(1L)).thenReturn(bills);

        // Execute
        List<Bill> result = billingService.getBillsByPatientId(1L);

        // Verify
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(bill -> bill.getPatientId() == 1L));
        verify(billRepository, times(1)).findByPatientId(1L);
    }

    @Test
    void testUpdateBill() {
        // Setup
        Bill existingBill = new Bill();
        existingBill.setId(1L);
        existingBill.setBillAmount(new BigDecimal("100.00"));

        Bill updatedBill = new Bill();
        updatedBill.setBillAmount(new BigDecimal("150.00"));
        updatedBill.setNotes("Updated bill");

        when(billRepository.findById(1L)).thenReturn(Optional.of(existingBill));
        when(billRepository.save(any(Bill.class))).thenReturn(updatedBill);

        // Execute
        Bill result = billingService.updateBill(1L, updatedBill);

        // Verify
        assertEquals(new BigDecimal("150.00"), result.getBillAmount());
        assertEquals("Updated bill", result.getNotes());
        verify(billRepository, times(1)).save(any(Bill.class));
    }

    @Test
    void testMakePayment() {
        // Setup
        Bill bill = new Bill();
        bill.setId(1L);
        bill.setBillAmount(new BigDecimal("100.00"));
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(Bill.BillStatus.PENDING);

        when(billRepository.findById(1L)).thenReturn(Optional.of(bill));
        when(billRepository.save(any(Bill.class))).thenReturn(bill);

        // Execute
        Bill result = billingService.makePayment(1L, new BigDecimal("50.00"), Bill.PaymentMethod.CASH);

        // Verify
        assertEquals(new BigDecimal("50.00"), result.getPaidAmount());
        assertEquals(Bill.PaymentMethod.CASH, result.getPaymentMethod());
        assertEquals(Bill.BillStatus.PARTIALLY_PAID, result.getStatus());
        verify(billRepository, times(1)).save(bill);
    }

    @Test
    void testMakePayment_FullPayment() {
        // Setup
        Bill bill = new Bill();
        bill.setId(1L);
        bill.setBillAmount(new BigDecimal("100.00"));
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(Bill.BillStatus.PENDING);

        when(billRepository.findById(1L)).thenReturn(Optional.of(bill));
        when(billRepository.save(any(Bill.class))).thenReturn(bill);

        // Execute
        Bill result = billingService.makePayment(1L, new BigDecimal("100.00"), Bill.PaymentMethod.CREDIT_CARD);

        // Verify
        assertEquals(new BigDecimal("100.00"), result.getPaidAmount());
        assertEquals(Bill.PaymentMethod.CREDIT_CARD, result.getPaymentMethod());
        assertEquals(Bill.BillStatus.PAID, result.getStatus());
    }

    @Test
    void testDeleteBill() {
        // Setup
        Bill bill = new Bill();
        bill.setId(1L);

        when(billRepository.findById(1L)).thenReturn(Optional.of(bill));
        doNothing().when(billRepository).delete(bill);

        // Execute
        billingService.deleteBill(1L);

        // Verify
        verify(billRepository, times(1)).delete(bill);
    }

    @Test
    void testGetTotalDueAmountByPatient() {
        // Setup
        when(billRepository.findTotalDueAmountByPatientId(1L))
                .thenReturn(new BigDecimal("250.00"));

        // Execute
        BigDecimal result = billingService.getTotalDueAmountByPatient(1L);

        // Verify
        assertEquals(new BigDecimal("250.00"), result);
        verify(billRepository, times(1)).findTotalDueAmountByPatientId(1L);
    }

    @Test
    void testGetBillsByStatus() {
        // Setup
        Bill bill1 = new Bill();
        bill1.setId(1L);
        bill1.setStatus(Bill.BillStatus.PENDING);

        Bill bill2 = new Bill();
        bill2.setId(2L);
        bill2.setStatus(Bill.BillStatus.PENDING);

        List<Bill> bills = Arrays.asList(bill1, bill2);
        when(billRepository.findByStatus(Bill.BillStatus.PENDING)).thenReturn(bills);

        // Execute
        List<Bill> result = billingService.getBillsByStatus(Bill.BillStatus.PENDING);

        // Verify
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(bill -> bill.getStatus() == Bill.BillStatus.PENDING));
        verify(billRepository, times(1)).findByStatus(Bill.BillStatus.PENDING);
    }
}