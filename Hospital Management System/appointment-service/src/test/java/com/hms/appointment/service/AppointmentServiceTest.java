package com.hms.appointment.service;

import com.hms.appointment.model.Appointment;
import com.hms.appointment.model.AppointmentRequest;
import com.hms.appointment.repository.AppointmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private AppointmentService appointmentService;

    @Test
    void testBookAppointment_Success() {
        // Setup
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(1L);
        request.setDoctorId(1L);
        request.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        request.setDurationMinutes(30);
        request.setReason("Checkup");
        request.setDepartment("CARDIOLOGY");

        when(appointmentRepository.findByDoctorIdAndDateTimeRange(any(), any(), any()))
                .thenReturn(Arrays.asList()); // No conflicts
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment appointment = invocation.getArgument(0);
            appointment.setId(1L); // Simulate saved entity with ID
            return appointment;
        });

        // Execute
        Appointment result = appointmentService.bookAppointment(request);

        // Verify
        assertNotNull(result);
        assertEquals(1L, result.getPatientId());
        assertEquals(1L, result.getDoctorId());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void testBookAppointment_TimeConflict_ThrowsException() {
        // Setup
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(1L);
        request.setDoctorId(1L);
        request.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        request.setDurationMinutes(30); // ← important

        Appointment conflictingAppointment = new Appointment();
        when(appointmentRepository.findByDoctorIdAndDateTimeRange(any(), any(), any()))
                .thenReturn(Arrays.asList(conflictingAppointment)); // Has conflicts

        // Execute & Verify
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> appointmentService.bookAppointment(request));
        assertEquals("Doctor is not available at the requested time.", exception.getMessage());


        verify(appointmentRepository, never()).save(any(Appointment.class));
    }


    @Test
    void testGetAllAppointments() {
        // Setup
        Appointment appointment1 = new Appointment();
        appointment1.setId(1L);
        appointment1.setPatientId(1L);

        Appointment appointment2 = new Appointment();
        appointment2.setId(2L);
        appointment2.setPatientId(2L);

        List<Appointment> appointments = Arrays.asList(appointment1, appointment2);
        when(appointmentRepository.findAll()).thenReturn(appointments);

        // Execute
        List<Appointment> result = appointmentService.getAllAppointments();

        // Verify
        assertEquals(2, result.size());
        verify(appointmentRepository, times(1)).findAll();
    }

    @Test
    void testGetAppointmentById_Found() {
        // Setup
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setPatientId(1L);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        // Execute
        Appointment result = appointmentService.getAppointmentById(1L);

        // Verify
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(appointmentRepository, times(1)).findById(1L);
    }

    @Test
    void testGetAppointmentById_NotFound() {
        // Setup
        when(appointmentRepository.findById(99L)).thenReturn(Optional.empty());

        // Execute & Verify
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> appointmentService.getAppointmentById(99L));
        assertEquals("Appointment not found with ID: 99", exception.getMessage());

    }

    @Test
    void testGetAppointmentsByPatientId() {
        // Setup
        Appointment appointment1 = new Appointment();
        appointment1.setId(1L);
        appointment1.setPatientId(1L);

        Appointment appointment2 = new Appointment();
        appointment2.setId(2L);
        appointment2.setPatientId(1L);

        List<Appointment> appointments = Arrays.asList(appointment1, appointment2);
        when(appointmentRepository.findByPatientId(1L)).thenReturn(appointments);

        // Execute
        List<Appointment> result = appointmentService.getAppointmentsByPatientId(1L);

        // Verify
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(apt -> apt.getPatientId() == 1L));
        verify(appointmentRepository, times(1)).findByPatientId(1L);
    }

    @Test
    void testUpdateAppointmentStatus() {
        // Setup
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        // Execute
        Appointment result = appointmentService.updateAppointmentStatus(1L,
                Appointment.AppointmentStatus.CONFIRMED);

        // Verify
        assertEquals(Appointment.AppointmentStatus.CONFIRMED, result.getStatus());
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void testCancelAppointment() {
        // Setup
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        // Execute
        appointmentService.cancelAppointment(1L);

        // Verify
        assertEquals(Appointment.AppointmentStatus.CANCELLED, appointment.getStatus());
        verify(appointmentRepository, times(1)).save(appointment);
    }
}