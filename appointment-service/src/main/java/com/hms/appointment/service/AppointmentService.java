package com.hms.appointment.service;

import com.hms.appointment.model.Appointment;
import com.hms.appointment.model.AppointmentBookedEvent;
import com.hms.appointment.repository.AppointmentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.hms.appointment.model.AppointmentRequest;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class AppointmentService
{
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-key}")
    private String routingKey;

    public Appointment bookAppointment(AppointmentRequest request)
    {
        log.info("Booking appointment for patient ID: {} with doctor ID: {}",
                request.getPatientId(), request.getDoctorId());

        List<Appointment> conflictingAppointments = appointmentRepository
                .findByDoctorIdAndDateTimeRange(
                        request.getDoctorId(),
                        request.getAppointmentDateTime(),
                        request.getAppointmentDateTime().plusMinutes(request.getDurationMinutes())
                );

        if(!conflictingAppointments.isEmpty())
        {
            throw new RuntimeException("Doctor is not available at the requested time.");
        }

        Appointment appointment = new Appointment();
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(request.getDoctorId());
        appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setReason(request.getReason());
        appointment.setDepartment(request.getDepartment());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        publishAppointmentBookedEvent(savedAppointment);

        return savedAppointment;

    }

    private void publishAppointmentBookedEvent(Appointment appointment)
    {
        try
        {
            AppointmentBookedEvent event = new AppointmentBookedEvent(
                    appointment.getId(),
                    appointment.getPatientId(),
                    appointment.getDoctorId(),
                    appointment.getAppointmentDateTime(),
                    "sayan.banerjee262004@gmail.com"
            );
            rabbitTemplate.convertAndSend(exchange, routingKey, event);
            log.info("Appointment booked event" +
                    "published for appointment ID: {}", appointment.getId());
        }
        catch (Exception e)
        {
            log.error("Failed to publish appointment booked event for appointment ID: {}. Error: {}",
                    appointment.getId(), e.getMessage());
        }
    }

    public List<Appointment> getAllAppointments()
    {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(Long id)
    {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
    }

    public List<Appointment> getAppointmentsByPatientId(Long patientId)
    {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctorId(Long doctorId)
    {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsByStatus(Appointment.AppointmentStatus status)
    {
        return appointmentRepository.findByStatus(status);
    }

    public Appointment rescheduleAppointment(Long id, LocalDateTime newDateTime)
    {
        Appointment appointment = getAppointmentById(id);

        List<Appointment> conflicts = appointmentRepository
                .findByDoctorIdAndDateTimeRange(
                        appointment.getDoctorId(),
                        newDateTime,
                        newDateTime.plusMinutes(appointment.getDurationMinutes())
                );

        conflicts.removeIf(a -> a.getId().equals(id));

        if(!conflicts.isEmpty())
        {
            throw new RuntimeException("Doctor is not available at the requested new time.");
        }

        appointment.setAppointmentDateTime(newDateTime);
        return appointmentRepository.save(appointment);
    }

    public void cancelAppointment(Long id)
    {
        Appointment appointment = getAppointmentById(id);
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    public List<Appointment> getUpcomingAppointments()
    {
        return appointmentRepository.findAppointmentsInDateRange(
                LocalDateTime.now(),
                LocalDateTime.now().plusDays(7)
        );
    }

    public Appointment updateAppointmentStatus(Long id, Appointment.AppointmentStatus status) {
        Appointment appointment = getAppointmentById(id);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }


}