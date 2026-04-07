package com.hms.appointment.repository;

import com.hms.appointment.model.Appointment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class AppointmentRepositoryTest {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Test
    void testSaveAppointment() {
        // Setup
        Appointment appointment = new Appointment();
        appointment.setPatientId(1L);
        appointment.setDoctorId(1L);
        appointment.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        appointment.setReason("Checkup");

        // Execute
        Appointment saved = appointmentRepository.save(appointment);

        // Verify
        assertNotNull(saved.getId());
        assertEquals(1L, saved.getPatientId());
        assertEquals(1L, saved.getDoctorId());
    }

    @Test
    void testFindByPatientId() {
        // Setup
        Appointment appointment = new Appointment();
        appointment.setPatientId(1L);
        appointment.setDoctorId(1L);
        appointment.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        appointmentRepository.save(appointment);

        // Execute
        List<Appointment> result = appointmentRepository.findByPatientId(1L);

        // Verify
        assertFalse(result.isEmpty());
        assertEquals(1L, result.get(0).getPatientId());
    }

    @Test
    void testFindByDoctorId() {
        // Setup
        Appointment appointment = new Appointment();
        appointment.setPatientId(1L);
        appointment.setDoctorId(2L);
        appointment.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        appointmentRepository.save(appointment);

        // Execute
        List<Appointment> result = appointmentRepository.findByDoctorId(2L);

        // Verify
        assertFalse(result.isEmpty());
        assertEquals(2L, result.get(0).getDoctorId());
    }
}