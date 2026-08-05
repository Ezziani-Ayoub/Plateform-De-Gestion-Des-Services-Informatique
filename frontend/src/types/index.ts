export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'ACCESS_RIGHTS' | 'OTHER';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  enabled?: boolean;
  departmentId?: number;
  departmentName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password?: string;
  fullName?: string;
  roles?: string[];
  departmentId?: number;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  roles?: string[];
  departmentId?: number;
  enabled?: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalEquipments: number;
  assignedEquipments: number;
  availableEquipments: number;
  maintenanceEquipments: number;
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
  assignedToId?: number;
  assignedToUsername?: string;
  assignedToFullName?: string;
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
  assignedToId?: number;
}

export interface UpdateEquipmentPayload extends CreateEquipmentPayload {}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: number;
  createdByUsername: string;
  createdByFullName: string;
  assignedToId?: number;
  assignedToUsername?: string;
  assignedToFullName?: string;
  equipmentId?: number;
  equipmentName?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  equipmentId?: number;
}

export interface UpdateTicketStatusPayload {
  status?: TicketStatus;
  assignedToId?: number;
  resolutionNotes?: string;
}

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
