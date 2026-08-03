import api from './api';
import type { Ticket, CreateTicketPayload, UpdateTicketStatusPayload } from '../types';

export const ticketService = {
  getAllTickets: async (): Promise<Ticket[]> => {
    const res = await api.get<Ticket[]>('/tickets');
    return res.data;
  },

  getMyTickets: async (): Promise<Ticket[]> => {
    const res = await api.get<Ticket[]>('/tickets/my');
    return res.data;
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    const res = await api.get<Ticket>(`/tickets/${id}`);
    return res.data;
  },

  createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
    const res = await api.post<Ticket>('/tickets', payload);
    return res.data;
  },

  updateTicketStatus: async (id: number, payload: UpdateTicketStatusPayload): Promise<Ticket> => {
    const res = await api.put<Ticket>(`/tickets/${id}/status`, payload);
    return res.data;
  },

  deleteTicket: async (id: number): Promise<void> => {
    await api.delete(`/tickets/${id}`);
  },
};
