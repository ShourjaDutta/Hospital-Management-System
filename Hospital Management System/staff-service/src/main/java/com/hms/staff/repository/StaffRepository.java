package com.hms.staff.repository;

import com.hms.staff.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByEmail(String email);
    Optional<Staff> findByEmployeeId(String employeeId);
    List<Staff> findByRole(Staff.StaffRole role);
    List<Staff> findByDepartment(Staff.Department department);
    List<Staff> findByIsActive(Boolean isActive);

    @Query("SELECT s FROM Staff s WHERE LOWER(s.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Staff> findByNameContaining(@Param("name") String name);

    @Query("SELECT s FROM Staff s WHERE s.role = 'DOCTOR' AND s.isActive = true")
    List<Staff> findAllActiveDoctors();
}