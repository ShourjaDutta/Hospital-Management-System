package com.hms.appointment.model;


import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "appointments")
public class Appointment
{
    public enum AppointmentStatus{
        SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "appointment_date_time", nullable = false)
    private LocalDateTime appointmentDateTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 30;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(name = "reason")
    private String reason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "department")
    private String department;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

