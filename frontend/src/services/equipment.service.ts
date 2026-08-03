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
    const response = await api.get<PageResponse<Equipment>>('/equipment', { params });
    return response.data;
  },

  async getEquipmentById(id: number): Promise<Equipment> {
    const response = await api.get<Equipment>(`/equipment/${id}`);
    return response.data;
  },

  async createEquipment(payload: CreateEquipmentPayload): Promise<Equipment> {
    const response = await api.post<Equipment>('/equipment', payload);
    return response.data;
  },

  async updateEquipment(id: number, payload: UpdateEquipmentPayload): Promise<Equipment> {
    const response = await api.put<Equipment>(`/equipment/${id}`, payload);
    return response.data;
  },

  async deleteEquipment(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/equipment/${id}`);
    return response.data;
  }
};
