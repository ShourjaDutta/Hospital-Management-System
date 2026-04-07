package com.hms.appointment.repository;


import com.hms.appointment.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface AppointmentRepository extends JpaRepository<Appointment,Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);


    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND "+
            "a.appointmentDateTime BETWEEN :start AND :end")
    List<Appointment> findByDoctorIdAndDateTimeRange(@Param("doctorId") Long doctorId, @Param("start")LocalDateTime start,
                                                     @Param("end")LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime BETWEEN :start AND :end")
    List<Appointment> findAppointmentsInDateRange(@Param("start") LocalDateTime start,
                                                  @Param("end") LocalDateTime end);
}
