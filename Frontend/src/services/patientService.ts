import api from '@/config/api';

export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  bloodType: string;
  medicalHistory?: string;
  allergies?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const patientService = {
  getAllPatients: () => api.get<Patient[]>('/api/patients'),
  getPatientById: (id: number) => api.get<Patient>(`/api/patients/${id}`),
  getPatientByEmail: (email: string) => api.get<Patient>(`/api/patients/email/${email}`),
  getPatientsByBloodType: (bloodType: string) => api.get<Patient[]>(`/api/patients/blood-type/${bloodType}`),
  createPatient: (data: Patient) => api.post<Patient>('/api/patients', data),
  updatePatient: (id: number, data: Patient) => api.put<Patient>(`/api/patients/${id}`, data),
  deletePatient: (id: number) => api.delete(`/api/patients/${id}`),
};
