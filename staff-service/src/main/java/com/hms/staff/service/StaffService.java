package com.hms.staff.service;

import com.hms.staff.model.Staff;
import com.hms.staff.repository.StaffRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class StaffService {

    @Autowired
    private StaffRepository staffRepository;

    public Staff createStaff(Staff staff) {
        log.info("Creating new staff member: {} {}", staff.getFirstName(), staff.getLastName());

        // Generate employee ID if not provided
        if (staff.getEmployeeId() == null || staff.getEmployeeId().isEmpty()) {
            staff.setEmployeeId(generateEmployeeId(staff.getRole()));
        }

        // Check if email already exists
        if (staffRepository.findByEmail(staff.getEmail()).isPresent()) {
            throw new RuntimeException("Staff with email " + staff.getEmail() + " already exists");
        }

        // Set hire date if not provided
        if (staff.getHireDate() == null) {
            staff.setHireDate(LocalDate.now());
        }

        return staffRepository.save(staff);
    }

    private String generateEmployeeId(Staff.StaffRole role) {
        String prefix = switch (role) {
            case DOCTOR -> "DOC";
            case NURSE -> "NUR";
            case RECEPTIONIST -> "REC";
            case ADMINISTRATOR -> "ADM";
            case LAB_TECHNICIAN -> "LAB";
            case PHARMACIST -> "PHA";
        };

        long count = staffRepository.count();
        return prefix + String.format("%04d", count + 1);
    }

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    public Optional<Staff> getStaffById(Long id) {
        return staffRepository.findById(id);
    }

    public Optional<Staff> getStaffByEmail(String email) {
        return staffRepository.findByEmail(email);
    }

    public Optional<Staff> getStaffByEmployeeId(String employeeId) {
        return staffRepository.findByEmployeeId(employeeId);
    }

    public List<Staff> getStaffByRole(Staff.StaffRole role) {
        return staffRepository.findByRole(role);
    }

    public List<Staff> getStaffByDepartment(Staff.Department department) {
        return staffRepository.findByDepartment(department);
    }

    public List<Staff> getActiveStaff() {
        return staffRepository.findByIsActive(true);
    }

    public List<Staff> searchStaffByName(String name) {
        return staffRepository.findByNameContaining(name);
    }

    public List<Staff> getAllActiveDoctors() {
        return staffRepository.findAllActiveDoctors();
    }

    public Staff updateStaff(Long id, Staff staffDetails) {
        log.info("Updating staff with ID: {}", id);

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));

        staff.setFirstName(staffDetails.getFirstName());
        staff.setLastName(staffDetails.getLastName());
        staff.setPhoneNumber(staffDetails.getPhoneNumber());
        staff.setRole(staffDetails.getRole());
        staff.setDepartment(staffDetails.getDepartment());
        staff.setSpecialization(staffDetails.getSpecialization());
        staff.setQualifications(staffDetails.getQualifications());
        staff.setLicenseNumber(staffDetails.getLicenseNumber());
        staff.setSalary(staffDetails.getSalary());
        staff.setShiftStart(staffDetails.getShiftStart());
        staff.setShiftEnd(staffDetails.getShiftEnd());
        staff.setIsActive(staffDetails.getIsActive());

        return staffRepository.save(staff);
    }

    public Staff updateStaffStatus(Long id, Boolean isActive) {
        log.info("Updating staff status for ID: {} to {}", id, isActive);

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));

        staff.setIsActive(isActive);
        return staffRepository.save(staff);
    }

    public void deleteStaff(Long id) {
        log.info("Deleting staff with ID: {}", id);

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));

        staffRepository.delete(staff);
    }

    public List<Staff> getStaffByRoleAndDepartment(Staff.StaffRole role, Staff.Department department) {
        return staffRepository.findByRole(role).stream()
                .filter(staff -> staff.getDepartment() == department && staff.getIsActive())
                .toList();
    }
}