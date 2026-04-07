package com.hms.staff.controller;

import com.hms.staff.model.Staff;
import com.hms.staff.service.StaffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/staff")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody Staff staff) {
        try {
            Staff savedStaff = staffService.createStaff(staff);
            return new ResponseEntity<>(savedStaff, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            log.error("Error creating staff: {}", e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Staff>> getAllStaff() {
        List<Staff> staff = staffService.getAllStaff();
        return new ResponseEntity<>(staff, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(@PathVariable Long id) {
        Optional<Staff> staff = staffService.getStaffById(id);
        return staff.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Staff> getStaffByEmail(@PathVariable String email) {
        Optional<Staff> staff = staffService.getStaffByEmail(email);
        return staff.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Staff> getStaffByEmployeeId(@PathVariable String employeeId) {
        Optional<Staff> staff = staffService.getStaffByEmployeeId(employeeId);
        return staff.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<Staff>> getStaffByRole(@PathVariable String role) {
        try {
            Staff.StaffRole roleEnum = Staff.StaffRole.valueOf(role.toUpperCase());
            List<Staff> staff = staffService.getStaffByRole(roleEnum);
            return new ResponseEntity<>(staff, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<Staff>> getStaffByDepartment(@PathVariable String department) {
        try {
            Staff.Department departmentEnum = Staff.Department.valueOf(department.toUpperCase());
            List<Staff> staff = staffService.getStaffByDepartment(departmentEnum);
            return new ResponseEntity<>(staff, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<Staff>> getActiveStaff() {
        List<Staff> staff = staffService.getActiveStaff();
        return new ResponseEntity<>(staff, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Staff>> searchStaffByName(@RequestParam String name) {
        List<Staff> staff = staffService.searchStaffByName(name);
        return new ResponseEntity<>(staff, HttpStatus.OK);
    }

    @GetMapping("/doctors/active")
    public ResponseEntity<List<Staff>> getAllActiveDoctors() {
        List<Staff> doctors = staffService.getAllActiveDoctors();
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    @GetMapping("/role/{role}/department/{department}")
    public ResponseEntity<List<Staff>> getStaffByRoleAndDepartment(
            @PathVariable String role,
            @PathVariable String department) {
        try {
            Staff.StaffRole roleEnum = Staff.StaffRole.valueOf(role.toUpperCase());
            Staff.Department departmentEnum = Staff.Department.valueOf(department.toUpperCase());
            List<Staff> staff = staffService.getStaffByRoleAndDepartment(roleEnum, departmentEnum);
            return new ResponseEntity<>(staff, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(@PathVariable Long id, @RequestBody Staff staffDetails) {
        try {
            Staff updatedStaff = staffService.updateStaff(id, staffDetails);
            return new ResponseEntity<>(updatedStaff, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Staff> updateStaffStatus(@PathVariable Long id, @RequestParam Boolean active) {
        try {
            Staff updatedStaff = staffService.updateStaffStatus(id, active);
            return new ResponseEntity<>(updatedStaff, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        try {
            staffService.deleteStaff(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}