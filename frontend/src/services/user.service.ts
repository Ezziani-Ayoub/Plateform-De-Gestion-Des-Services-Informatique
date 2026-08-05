import api from './api';
import { User, CreateUserPayload, UpdateUserPayload, PageResponse } from '../types';

export interface UserFilterParams {
  search?: string;
  departmentId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const userService = {
  async getUsers(params: UserFilterParams = {}): Promise<PageResponse<User>> {
    const response = await api.get<PageResponse<User>>('/users', { params });
    return response.data;
  },

  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users/all');
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await api.post<User>('/users', payload);
    return response.data;
  },

  async updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, payload);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  }
};
