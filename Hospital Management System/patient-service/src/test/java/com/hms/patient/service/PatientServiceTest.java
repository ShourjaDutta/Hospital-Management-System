package com.hms.patient.service;

import com.hms.patient.model.Patient;
import com.hms.patient.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientService patientService;

    @Test
    void testCreatePatient() {
        // Setup
        Patient patient = new Patient();
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setEmail("john@example.com");

        when(patientRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(patientRepository.save(patient)).thenReturn(patient);

        // Execute
        Patient result = patientService.createPatient(patient);

        // Verify
        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        verify(patientRepository, times(1)).save(patient);
    }

    @Test
    void testGetAllPatients() {
        // Setup
        Patient patient1 = new Patient();
        patient1.setId(1L);
        patient1.setFirstName("John");

        Patient patient2 = new Patient();
        patient2.setId(2L);
        patient2.setFirstName("Jane");

        List<Patient> patients = Arrays.asList(patient1, patient2);
        when(patientRepository.findAll()).thenReturn(patients);

        // Execute
        List<Patient> result = patientService.getAllPatients();

        // Verify
        assertEquals(2, result.size());
        verify(patientRepository, times(1)).findAll();
    }

    @Test
    void testGetPatientById_Found() {
        // Setup
        Patient patient = new Patient();
        patient.setId(1L);
        patient.setFirstName("John");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        // Execute
        Optional<Patient> result = patientService.getPatientById(1L);

        // Verify
        assertTrue(result.isPresent());
        assertEquals("John", result.get().getFirstName());
    }

    @Test
    void testGetPatientById_NotFound() {
        // Setup
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        // Execute
        Optional<Patient> result = patientService.getPatientById(99L);

        // Verify
        assertFalse(result.isPresent());
    }

    @Test
    void testUpdatePatient() {
        // Setup
        Patient existingPatient = new Patient();
        existingPatient.setId(1L);
        existingPatient.setFirstName("Old Name");

        Patient updatedPatient = new Patient();
        updatedPatient.setFirstName("New Name");
        updatedPatient.setLastName("New Last");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(existingPatient));
        when(patientRepository.save(any(Patient.class))).thenReturn(updatedPatient);

        // Execute
        Patient result = patientService.updatePatient(1L, updatedPatient);

        // Verify
        assertEquals("New Name", result.getFirstName());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void testDeletePatient() {
        // Setup
        Patient patient = new Patient();
        patient.setId(1L);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        doNothing().when(patientRepository).delete(patient);

        // Execute
        patientService.deletePatient(1L);

        // Verify
        verify(patientRepository, times(1)).delete(patient);
    }
}