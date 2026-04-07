package com.hms.appointment.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentBookedEvent {

    private long appointmentId;
    private long patientId;
    private long doctorId;
    private LocalDateTime appointmentDateTime;
    private String patientEmail;
}