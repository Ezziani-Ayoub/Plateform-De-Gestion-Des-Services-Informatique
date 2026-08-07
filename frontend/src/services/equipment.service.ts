import api from './api';
import { Equipment, CreateEquipmentPayload, UpdateEquipmentPayload, PageResponse, EquipmentStatus } from '../types';

export interface EquipmentFilterParams {
  search?: string;
  category?: string;
  status?: EquipmentStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const equipmentService = {
  async getEquipments(params: EquipmentFilterParams = {}): Promise<PageResponse<Equipment>> {
    const response = await api.get<PageResponse<Equipment>>('/equipments', { params });
    return response.data;
  },

  async getEquipmentById(id: number): Promise<Equipment> {
    const response = await api.get<Equipment>(`/equipments/${id}`);
    return response.data;
  },

  async createEquipment(payload: CreateEquipmentPayload): Promise<Equipment> {
    const response = await api.post<Equipment>('/equipments', payload);
    return response.data;
  },

  async updateEquipment(id: number, payload: UpdateEquipmentPayload): Promise<Equipment> {
    const response = await api.put<Equipment>(`/equipments/${id}`, payload);
    return response.data;
  },

  async deleteEquipment(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/equipments/${id}`);
    return response.data;
  },

  async importEquipments(file: File): Promise<import('../types').ExcelImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<import('../types').ExcelImportResult>('/equipments/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async downloadTemplate(): Promise<Blob> {
    const response = await api.get('/equipments/import/template', {
      responseType: 'blob',
    });
    return response.data;
  }
};
