package com.hms.appointment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.appointment.model.Appointment;
import com.hms.appointment.model.AppointmentRequest;
import com.hms.appointment.service.AppointmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testBookAppointment() throws Exception {
        // Setup
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(1L);
        request.setDoctorId(1L);
        request.setAppointmentDateTime(LocalDateTime.now().plusDays(1));

        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setPatientId(1L);
        appointment.setDoctorId(1L);

        when(appointmentService.bookAppointment(any(AppointmentRequest.class))).thenReturn(appointment);

        // Execute & Verify
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.patientId").value(1));
    }

    @Test
    void testGetAllAppointments() throws Exception {
        // Setup
        Appointment appointment1 = new Appointment();
        appointment1.setId(1L);
        appointment1.setPatientId(1L);

        Appointment appointment2 = new Appointment();
        appointment2.setId(2L);
        appointment2.setPatientId(2L);

        List<Appointment> appointments = Arrays.asList(appointment1, appointment2);
        when(appointmentService.getAllAppointments()).thenReturn(appointments);

        // Execute & Verify
        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    void testGetAppointmentById() throws Exception {
        // Setup
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setPatientId(1L);

        when(appointmentService.getAppointmentById(1L)).thenReturn(appointment);

        // Execute & Verify
        mockMvc.perform(get("/api/appointments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.patientId").value(1));
    }

    @Test
    void testGetAppointmentsByPatient() throws Exception {
        // Setup
        Appointment appointment1 = new Appointment();
        appointment1.setId(1L);
        appointment1.setPatientId(1L);

        Appointment appointment2 = new Appointment();
        appointment2.setId(2L);
        appointment2.setPatientId(1L);

        List<Appointment> appointments = Arrays.asList(appointment1, appointment2);
        when(appointmentService.getAppointmentsByPatientId(1L)).thenReturn(appointments);

        // Execute & Verify
        mockMvc.perform(get("/api/appointments/patient/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].patientId").value(1))
                .andExpect(jsonPath("$[1].patientId").value(1));
    }

    @Test
    void testUpdateAppointmentStatus() throws Exception {
        // Setup
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);

        when(appointmentService.updateAppointmentStatus(1L, Appointment.AppointmentStatus.CONFIRMED))
                .thenReturn(appointment);

        // Execute & Verify
        mockMvc.perform(put("/api/appointments/1/status")
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void testCancelAppointment() throws Exception {
        // Execute & Verify
        mockMvc.perform(put("/api/appointments/1/cancel"))
                .andExpect(status().isOk());
    }
}