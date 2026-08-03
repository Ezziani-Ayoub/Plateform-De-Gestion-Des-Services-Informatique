export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface Equipment {
  id: number;
  name: string;
  serialNumber: string;
  category: string;
  status: EquipmentStatus;
  location?: string;
  purchaseDate?: string;
  description?: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentPayload {
  name: string;
  serialNumber: string;
  category: string;
  status: EquipmentStatus;
  location?: string;
  purchaseDate?: string;
  description?: string;
  assignedToUserId?: number;
}

export interface UpdateEquipmentPayload extends CreateEquipmentPayload {}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
