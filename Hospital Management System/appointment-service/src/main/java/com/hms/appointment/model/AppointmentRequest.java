package com.hms.appointment.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    private Long patientId;
    private Long doctorId;
    private LocalDateTime appointmentDateTime;
    private Integer durationMinutes;
    private String reason;
    private String department;
}