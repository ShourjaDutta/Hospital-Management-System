import api from '@/config/api';

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  INSURANCE = 'INSURANCE',
  ONLINE = 'ONLINE',
}

export interface Bill {
  id?: number;
  patientId: number;
  appointmentId?: number;
  billAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  status?: BillStatus;
  billDate?: string;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  insuranceClaimNumber?: string;
  insuranceCoverage?: number;
  itemizedCharges?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const billingService = {
  getAllBills: () => api.get<Bill[]>('/api/bills'),
  getBillById: (id: number) => api.get<Bill>(`/api/bills/${id}`),
  getBillsByPatient: (patientId: number) => api.get<Bill[]>(`/api/bills/patient/${patientId}`),
  getBillsByStatus: (status: BillStatus) => api.get<Bill[]>(`/api/bills/status/${status}`),
  getBillsByAppointment: (appointmentId: number) => api.get<Bill[]>(`/api/bills/appointment/${appointmentId}`),
  getOverdueBills: () => api.get<Bill[]>('/api/bills/overdue'),
  getTotalDue: (patientId: number) => api.get<number>(`/api/bills/patient/${patientId}/total-due`),
  createBill: (data: Bill) => api.post<Bill>('/api/bills', data),
  updateBill: (id: number, data: Bill) => api.put<Bill>(`/api/bills/${id}`, data),
  makePayment: (id: number, amount: number, paymentMethod: PaymentMethod) => 
    api.post<Bill>(`/api/bills/${id}/payment`, null, { params: { amount, paymentMethod } }),
  deleteBill: (id: number) => api.delete(`/api/bills/${id}`),
  updateOverdueBills: () => api.post<void>('/api/bills/update-overdue'),
};
