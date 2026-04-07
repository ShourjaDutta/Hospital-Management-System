package com.hms.billing.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "bills")
public class Bill {

    public enum BillStatus {
        PENDING, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED
    }

    public enum PaymentMethod {
        CASH, CREDIT_CARD, DEBIT_CARD, INSURANCE, ONLINE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "bill_amount", precision = 10, scale = 2)
    private BigDecimal billAmount;

    @Column(name = "paid_amount", precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "due_amount", precision = 10, scale = 2)
    private BigDecimal dueAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BillStatus status = BillStatus.PENDING;

    @Column(name = "bill_date")
    private LocalDate billDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDateTime paidDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method" , nullable = false)
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Column(name = "insurance_claim_number")
    private String insuranceClaimNumber;

    @Column(name = "insurance_coverage", precision = 10, scale = 2)
    private BigDecimal insuranceCoverage = BigDecimal.ZERO;

    @Column(name = "itemized_charges", columnDefinition = "TEXT")
    private String itemizedCharges;

    @Column(name = "notes")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void calculateDueAmount() {
        if (billAmount != null && paidAmount != null) {
            dueAmount = billAmount.subtract(paidAmount);
            if (dueAmount.compareTo(BigDecimal.ZERO) <= 0 && billAmount.compareTo(BigDecimal.ZERO) > 0) {
                status = BillStatus.PAID;
                if (paidDate == null) {
                    paidDate = LocalDateTime.now();
                }
            }
        }
    }
}