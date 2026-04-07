import api from '@/config/api';

export enum ItemCategory {
  MEDICATION = 'MEDICATION',
  EQUIPMENT = 'EQUIPMENT',
  SUPPLY = 'SUPPLY',
  LAB_SUPPLY = 'LAB_SUPPLY',
  SURGICAL = 'SURGICAL',
}

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

export interface MedicalItem {
  id?: string;
  itemCode: string;
  name: string;
  description?: string;
  category: ItemCategory;
  status?: ItemStatus;
  currentStock?: number;
  minimumStock?: number;
  maximumStock?: number;
  unit?: string;
  unitPrice?: number;
  supplier?: string;
  storageLocation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const inventoryService = {
  getAllItems: () => api.get<MedicalItem[]>('/api/inventory'),
  getItemById: (id: string) => api.get<MedicalItem>(`/api/inventory/${id}`),
  getItemByCode: (code: string) => api.get<MedicalItem>(`/api/inventory/code/${code}`),
  getItemsByCategory: (category: ItemCategory) => api.get<MedicalItem[]>(`/api/inventory/category/${category}`),
  getItemsByStatus: (status: ItemStatus) => api.get<MedicalItem[]>(`/api/inventory/status/${status}`),
  getLowStockItems: () => api.get<MedicalItem[]>('/api/inventory/low-stock'),
  getCriticalStockItems: () => api.get<MedicalItem[]>('/api/inventory/critical-stock'),
  searchItems: (name: string) => api.get<MedicalItem[]>('/api/inventory/search', { params: { name } }),
  createItem: (data: MedicalItem) => api.post<MedicalItem>('/api/inventory', data),
  updateItem: (id: string, data: MedicalItem) => api.put<MedicalItem>(`/api/inventory/${id}`, data),
  updateStock: (id: string, stock: number) => 
    api.patch<MedicalItem>(`/api/inventory/${id}/stock`, null, { params: { stock } }),
  restockItem: (id: string, quantity: number) => 
    api.post<MedicalItem>(`/api/inventory/${id}/restock`, null, { params: { quantity } }),
  consumeItem: (id: string, quantity: number) => 
    api.post<MedicalItem>(`/api/inventory/${id}/consume`, null, { params: { quantity } }),
  deleteItem: (id: string) => api.delete(`/api/inventory/${id}`),
};
