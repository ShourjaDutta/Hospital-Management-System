import api from '@/config/api';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  appointmentDateTime: string;
  durationMinutes?: number;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const appointmentService = {
  getAllAppointments: () => api.get<Appointment[]>('/api/appointments'),
  getAppointmentById: (id: number) => api.get<Appointment>(`/api/appointments/${id}`),
  getAppointmentsByPatient: (patientId: number) => api.get<Appointment[]>(`/api/appointments/patient/${patientId}`),
  getAppointmentsByDoctor: (doctorId: number) => api.get<Appointment[]>(`/api/appointments/doctor/${doctorId}`),
  getAppointmentsByStatus: (status: AppointmentStatus) => api.get<Appointment[]>(`/api/appointments/status/${status}`),
  getUpcomingAppointments: () => api.get<Appointment[]>('/api/appointments/upcoming'),
  createAppointment: (data: Appointment) => api.post<Appointment>('/api/appointments', data),
  updateAppointmentStatus: (id: number, status: AppointmentStatus) => 
    api.put<Appointment>(`/api/appointments/${id}/status`, null, { params: { status } }),
  rescheduleAppointment: (id: number, newDateTime: string) => 
    api.put<Appointment>(`/api/appointments/${id}/reschedule`, null, { params: { newDateTime } }),
  cancelAppointment: (id: number) => api.put<void>(`/api/appointments/${id}/cancel`),
};
