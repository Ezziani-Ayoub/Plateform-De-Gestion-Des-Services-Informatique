import api from './api';
import { JwtResponse, User } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<JwtResponse> {
    const response = await api.post<JwtResponse>('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('pgsi_token', response.data.token);
      localStorage.setItem('pgsi_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('pgsi_token');
    localStorage.removeItem('pgsi_user');
  },

  getStoredToken(): string | null {
    return localStorage.getItem('pgsi_token');
  },

  getStoredUser(): User | null {
    const userJson = localStorage.getItem('pgsi_user');
    return userJson ? JSON.parse(userJson) : null;
  }
};
