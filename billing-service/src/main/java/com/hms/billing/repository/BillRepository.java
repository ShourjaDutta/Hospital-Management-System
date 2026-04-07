package com.hms.billing.repository;

import com.hms.billing.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByPatientId(Long patientId);
    List<Bill> findByStatus(Bill.BillStatus status);
    List<Bill> findByAppointmentId(Long appointmentId);

    @Query("SELECT SUM(b.dueAmount) FROM Bill b WHERE b.patientId = :patientId AND b.status = 'PENDING'")
    BigDecimal findTotalDueAmountByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT b FROM Bill b WHERE b.dueDate < CURRENT_TIMESTAMP AND b.status = 'PENDING'")
    List<Bill> findOverdueBills();
}