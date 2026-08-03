import { useState, useEffect, useCallback } from 'react';
import { ticketService } from '../services/ticket.service';
import type { Ticket, CreateTicketPayload, UpdateTicketStatusPayload } from '../types';

export const useTickets = (myTicketsOnly = false) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = myTicketsOnly
        ? await ticketService.getMyTickets()
        : await ticketService.getAllTickets();
      setTickets(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erreur de chargement des tickets');
    } finally {
      setIsLoading(false);
    }
  }, [myTicketsOnly]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = useCallback(async (payload: CreateTicketPayload) => {
    const created = await ticketService.createTicket(payload);
    setTickets((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTicketStatus = useCallback(async (id: number, payload: UpdateTicketStatusPayload) => {
    const updated = await ticketService.updateTicketStatus(id, payload);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTicket = useCallback(async (id: number) => {
    await ticketService.deleteTicket(id);
    setTickets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    tickets,
    isLoading,
    error,
    refresh: fetchTickets,
    createTicket,
    updateTicketStatus,
    deleteTicket,
  };
};
