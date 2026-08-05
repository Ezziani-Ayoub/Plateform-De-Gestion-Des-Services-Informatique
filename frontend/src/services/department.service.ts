import api from './api';
import { Department } from '../types';

export const departmentService = {
  async getDepartments(): Promise<Department[]> {
    const response = await api.get<Department[]>('/departments');
    return response.data;
  },

  async createDepartment(data: { name: string; description?: string }): Promise<Department> {
    const response = await api.post<Department>('/departments', data);
    return response.data;
  },

  async updateDepartment(id: number, data: { name: string; description?: string }): Promise<Department> {
    const response = await api.put<Department>(`/departments/${id}`, data);
    return response.data;
  },

  async deleteDepartment(id: number): Promise<void> {
    await api.delete(`/departments/${id}`);
  }
};
