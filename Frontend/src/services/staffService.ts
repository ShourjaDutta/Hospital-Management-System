import api from '@/config/api';

export enum StaffRole {
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  ADMINISTRATOR = 'ADMINISTRATOR',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  PHARMACIST = 'PHARMACIST',
}

export enum Department {
  CARDIOLOGY = 'CARDIOLOGY',
  NEUROLOGY = 'NEUROLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  PEDIATRICS = 'PEDIATRICS',
  EMERGENCY = 'EMERGENCY',
  SURGERY = 'SURGERY',
  RADIOLOGY = 'RADIOLOGY',
  LABORATORY = 'LABORATORY',
}

export interface Staff {
  id?: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: StaffRole;
  department: Department;
  specialization?: string;
  qualifications?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  hireDate?: string;
  salary?: number;
  shiftStart?: string;
  shiftEnd?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const staffService = {
  getAllStaff: () => api.get<Staff[]>('/api/staff'),
  getStaffById: (id: number) => api.get<Staff>(`/api/staff/${id}`),
  getStaffByEmail: (email: string) => api.get<Staff>(`/api/staff/email/${email}`),
  getStaffByRole: (role: StaffRole) => api.get<Staff[]>(`/api/staff/role/${role}`),
  getStaffByDepartment: (department: Department) => api.get<Staff[]>(`/api/staff/department/${department}`),
  getActiveDoctors: () => api.get<Staff[]>('/api/staff/doctors/active'),
  getActiveStaff: () => api.get<Staff[]>('/api/staff/active'),
  searchStaffByName: (name: string) => api.get<Staff[]>('/api/staff/search', { params: { name } }),
  createStaff: (data: Staff) => api.post<Staff>('/api/staff', data),
  updateStaff: (id: number, data: Staff) => api.put<Staff>(`/api/staff/${id}`, data),
  updateStaffStatus: (id: number, active: boolean) => 
    api.patch<Staff>(`/api/staff/${id}/status`, null, { params: { active } }),
  deleteStaff: (id: number) => api.delete(`/api/staff/${id}`),
};
