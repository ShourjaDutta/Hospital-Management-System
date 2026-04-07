package com.hms.billing.service;

import com.hms.billing.model.Bill;
import com.hms.billing.repository.BillRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class BillingService {

    @Autowired
    private BillRepository billRepository;

    public Bill createBill(Bill bill) {
        log.info("Creating bill for patient ID: {}", bill.getPatientId());

        if (bill.getBillDate() == null) {
            bill.setBillDate(LocalDate.now());
        }

        if (bill.getDueDate() == null) {
            bill.setDueDate(LocalDate.now().plusDays(30));
        }





        bill.calculateDueAmount();
        return billRepository.save(bill);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
    }

    public List<Bill> getBillsByPatientId(Long patientId) {
        return billRepository.findByPatientId(patientId);
    }

    public List<Bill> getBillsByStatus(Bill.BillStatus status) {
        return billRepository.findByStatus(status);
    }

    public List<Bill> getBillsByAppointmentId(Long appointmentId) {
        return billRepository.findByAppointmentId(appointmentId);
    }

    public Bill updateBill(Long id, Bill billDetails) {
        log.info("Updating bill with ID: {}", id);

        Bill bill = getBillById(id);
        bill.setBillAmount(billDetails.getBillAmount());
        bill.setPaidAmount(billDetails.getPaidAmount());
        bill.setDueDate(billDetails.getDueDate());
        bill.setStatus(billDetails.getStatus());
        bill.setPaymentMethod(billDetails.getPaymentMethod());
        bill.setInsuranceClaimNumber(billDetails.getInsuranceClaimNumber());
        bill.setInsuranceCoverage(billDetails.getInsuranceCoverage());
        bill.setItemizedCharges(billDetails.getItemizedCharges());
        bill.setNotes(billDetails.getNotes());

        bill.calculateDueAmount();
        return billRepository.save(bill);
    }

    public Bill makePayment(Long id, BigDecimal amount, Bill.PaymentMethod paymentMethod) {
        log.info("Processing payment of {} for bill ID: {}", amount, id);

        Bill bill = getBillById(id);

        BigDecimal newPaidAmount = bill.getPaidAmount().add(amount);
        bill.setPaidAmount(newPaidAmount);
        bill.setPaymentMethod(paymentMethod);

        if (newPaidAmount.compareTo(bill.getBillAmount()) >= 0) {
            bill.setStatus(Bill.BillStatus.PAID);
            bill.setPaidDate(LocalDateTime.now());
        } else if (newPaidAmount.compareTo(BigDecimal.ZERO) > 0) {
            bill.setStatus(Bill.BillStatus.PARTIALLY_PAID);
        }

        bill.calculateDueAmount();
        return billRepository.save(bill);
    }

    public BigDecimal getTotalDueAmountByPatient(Long patientId) {
        BigDecimal totalDue = billRepository.findTotalDueAmountByPatientId(patientId);
        return totalDue != null ? totalDue : BigDecimal.ZERO;
    }

    public List<Bill> getOverdueBills() {
        return billRepository.findOverdueBills();
    }

    public void updateOverdueBills() {
        log.info("Updating overdue bills status");
        List<Bill> overdueBills = getOverdueBills();

        for (Bill bill : overdueBills) {
            bill.setStatus(Bill.BillStatus.OVERDUE);
            billRepository.save(bill);
        }

        log.info("Updated {} bills to OVERDUE status", overdueBills.size());
    }

    public void deleteBill(Long id) {
        log.info("Deleting bill with ID: {}", id);
        Bill bill = getBillById(id);
        billRepository.delete(bill);
    }
}