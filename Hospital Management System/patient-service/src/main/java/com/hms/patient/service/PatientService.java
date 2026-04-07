package com.hms.patient.service;

import com.hms.patient.model.Patient;
import com.hms.patient.repository.PatientRepository;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class PatientService {



    @Autowired
    private PatientRepository patientRepository;

    public Patient createPatient(Patient patient)
    {
;
        log.info("Creating new patient: {} {}", patient.getFirstName(), patient.getLastName());

        if(patientRepository.findByEmail((patient.getEmail())).isPresent())
        {
            throw new RuntimeException("Patient with email " + patient.getEmail() + " already exists.");
        }

        return patientRepository.save(patient);

    }
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Optional<Patient> getPatientByEmail(String email) {
        return patientRepository.findByEmail(email);
    }

    public List<Patient> searchPatientsByName(String name) {
        return patientRepository.findByNameContaining(name);
    }

    public Patient updatePatient(Long id, Patient patientDetails)
    {
        log.info("Updating patient with ID: {}", id);

        Patient patient = patientRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Patient not found with id " + id));

        patient.setFirstName(patientDetails.getFirstName());
        patient.setLastName(patientDetails.getLastName());
        patient.setPhoneNumber(patientDetails.getPhoneNumber());
        patient.setDateOfBirth(patientDetails.getDateOfBirth());
        patient.setAddress(patientDetails.getAddress());
        patient.setEmergencyContact(patientDetails.getEmergencyContact());
        patient.setBloodType(patientDetails.getBloodType());
        patient.setMedicalHistory(patientDetails.getMedicalHistory());
        patient.setAllergies(patientDetails.getAllergies());
        patient.setInsuranceProvider(patientDetails.getInsuranceProvider());
        patient.setInsuranceNumber(patientDetails.getInsuranceNumber());

        return patientRepository.save(patient);

    }

    public void deletePatient(Long id) {
        log.info("Deleting patient with ID: {}", id);

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        patientRepository.delete(patient);
    }

    public List<Patient> getPatientsByBloodType(String bloodType) {
        return patientRepository.findByBloodType(bloodType);
    }
}