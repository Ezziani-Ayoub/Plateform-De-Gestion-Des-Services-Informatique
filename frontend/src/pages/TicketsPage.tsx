import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import type { Ticket, TicketStatus, TicketPriority, TicketCategory, CreateTicketPayload, UpdateTicketStatusPayload } from '../types';
import {
  Ticket as TicketIcon,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  Filter,
  Search,
  User,
  Cpu,
  Wifi,
  ShieldAlert,
  HelpCircle,
  ArrowUpCircle,
  Flame,
  TrendingUp,
  Minus,
  Eye,
  Trash2,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';

// ─── Status & Priority config ────────────────────────────────────────────────

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: React.ElementType }> = {
  OPEN: { label: 'Ouvert', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  IN_PROGRESS: { label: 'En cours', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: RefreshCw },
  RESOLVED: { label: 'Résolu', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  CLOSED: { label: 'Fermé', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: XCircle },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; icon: React.ElementType }> = {
  LOW: { label: 'Faible', color: 'text-slate-500', icon: Minus },
  MEDIUM: { label: 'Moyen', color: 'text-blue-500', icon: TrendingUp },
  HIGH: { label: 'Élevé', color: 'text-orange-500', icon: ArrowUpCircle },
  CRITICAL: { label: 'Critique', color: 'text-red-600', icon: Flame },
};

const CATEGORY_CONFIG: Record<TicketCategory, { label: string; icon: React.ElementType }> = {
  HARDWARE: { label: 'Matériel', icon: Cpu },
  SOFTWARE: { label: 'Logiciel', icon: ClipboardList },
  NETWORK: { label: 'Réseau', icon: Wifi },
  ACCESS_RIGHTS: { label: 'Accès / Droits', icon: ShieldAlert },
  OTHER: { label: 'Autre', icon: HelpCircle },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const { label, color, icon: Icon } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  const { label, color, icon: Icon } = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

const CategoryBadge: React.FC<{ category: TicketCategory }> = ({ category }) => {
  const { label, icon: Icon } = CATEGORY_CONFIG[category];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700">
      <Icon className="w-3 h-3 text-gray-500" />
      {label}
    </span>
  );
};

const TimeAgo: React.FC<{ dateStr: string }> = ({ dateStr }) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let display = '';
  if (diffMins < 1) display = "À l'instant";
  else if (diffMins < 60) display = `Il y a ${diffMins} min`;
  else if (diffHours < 24) display = `Il y a ${diffHours}h`;
  else if (diffDays === 1) display = 'Hier';
  else display = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return <span className="text-xs text-gray-400">{display}</span>;
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const TicketsPage: React.FC = () => {
  const { user } = useAuth();

  const isAdminOrTech = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_TECHNICIAN') ?? false;

  const { tickets, isLoading, error, refresh, createTicket, updateTicketStatus, deleteTicket } = useTickets();

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | ''>('');
  const [filterCategory, setFilterCategory] = useState<TicketCategory | ''>('');

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [processingTicket, setProcessingTicket] = useState<Ticket | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Create form state ─────────────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState<CreateTicketPayload>({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
  });

  // ── Update form state ─────────────────────────────────────────────────────────
  const [updateForm, setUpdateForm] = useState<UpdateTicketStatusPayload>({});

  // ── Filtering logic ───────────────────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Non-admin/tech employees only see their own tickets
    if (!isAdminOrTech) {
      result = result.filter(t => t.createdByUsername === user?.username);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.createdByFullName.toLowerCase().includes(q)
      );
    }
    if (filterStatus) result = result.filter(t => t.status === filterStatus);
    if (filterPriority) result = result.filter(t => t.priority === filterPriority);
    if (filterCategory) result = result.filter(t => t.category === filterCategory);

    return result;
  }, [tickets, search, filterStatus, filterPriority, filterCategory, isAdminOrTech, user]);

  // ── Counts ────────────────────────────────────────────────────────────────────
  const counts = useMemo(() => {
    const base = isAdminOrTech ? tickets : tickets.filter(t => t.createdByUsername === user?.username);
    return {
      open: base.filter(t => t.status === 'OPEN').length,
      inProgress: base.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: base.filter(t => t.status === 'RESOLVED').length,
      total: base.length,
    };
  }, [tickets, isAdminOrTech, user]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.description.trim()) {
      setFormError('Le titre et la description sont obligatoires.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await createTicket(createForm);
      setIsCreateOpen(false);
      setCreateForm({ title: '', description: '', category: 'OTHER', priority: 'MEDIUM' });
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Erreur lors de la création du ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenUpdateModal = (ticket: Ticket) => {
    setProcessingTicket(ticket);
    setUpdateForm({
      status: ticket.status,
      resolutionNotes: ticket.resolutionNotes || '',
    });
    setFormError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingTicket) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await updateTicketStatus(processingTicket.id, updateForm);
      setProcessingTicket(null);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await deleteTicket(deletingId);
      setDeletingId(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Impossible de supprimer ce ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-indigo-600" />
            <span>{isAdminOrTech ? 'File de Support IT' : 'Mes Tickets de Support'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isAdminOrTech
              ? 'Gérez et traitez toutes les demandes d\'assistance IT des employés.'
              : 'Soumettez et suivez vos demandes d\'assistance informatique.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setIsCreateOpen(true); setFormError(null); }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Ticket</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', dot: 'bg-indigo-400' },
          { label: 'Ouverts', value: counts.open, color: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-400' },
          { label: 'En cours', value: counts.inProgress, color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-400' },
          { label: 'Résolus', value: counts.resolved, color: 'bg-green-50 text-green-600 border-green-100', dot: 'bg-green-400' },
        ].map(({ label, value, color, dot }) => (
          <div key={label} className={`p-4 rounded-2xl border ${color} flex items-center gap-3`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
            <div>
              <p className="text-2xl font-bold leading-none">{value}</p>
              <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="p-4 bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 hidden md:block" />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TicketStatus | '')}
            className="bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Tous les statuts</option>
            <option value="OPEN">Ouvert</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolu</option>
            <option value="CLOSED">Fermé</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TicketPriority | '')}
            className="bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Toutes les priorités</option>
            <option value="LOW">Faible</option>
            <option value="MEDIUM">Moyen</option>
            <option value="HIGH">Élevé</option>
            <option value="CRITICAL">Critique</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as TicketCategory | '')}
            className="bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Toutes les catégories</option>
            <option value="HARDWARE">Matériel</option>
            <option value="SOFTWARE">Logiciel</option>
            <option value="NETWORK">Réseau</option>
            <option value="ACCESS_RIGHTS">Accès / Droits</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Ticket List ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading && tickets.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <div className="inline-flex flex-col items-center gap-3">
              <span className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Chargement des tickets...</span>
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <TicketIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">Aucun ticket trouvé</p>
            <p className="text-xs mt-1">
              {!isAdminOrTech && "Cliquez sur « Nouveau Ticket » pour soumettre votre première demande."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTickets.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                isAdminOrTech={isAdminOrTech}
                currentUsername={user?.username || ''}
                onView={() => setViewingTicket(ticket)}
                onProcess={() => handleOpenUpdateModal(ticket)}
                onDelete={() => setDeletingId(ticket.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────── MODALS ─────────────────────────────────── */}

      {/* CREATE TICKET MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Nouveau Ticket de Support"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Titre *</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
              placeholder="Décrivez brièvement le problème..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description détaillée *</label>
            <textarea
              required
              rows={4}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="Expliquez le problème en détail (quand cela est arrivé, ce que vous avez essayé, etc.)..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Catégorie</label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as TicketCategory })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="HARDWARE">🖥️ Matériel</option>
                <option value="SOFTWARE">💻 Logiciel</option>
                <option value="NETWORK">🌐 Réseau</option>
                <option value="ACCESS_RIGHTS">🔐 Accès / Droits</option>
                <option value="OTHER">❓ Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priorité</label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as TicketPriority })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">🔵 Faible</option>
                <option value="MEDIUM">🟡 Moyen</option>
                <option value="HIGH">🟠 Élevé</option>
                <option value="CRITICAL">🔴 Critique</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi...
                </>
              ) : (
                'Soumettre le Ticket'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW TICKET MODAL */}
      {viewingTicket && (
        <Modal
          isOpen={viewingTicket !== null}
          onClose={() => setViewingTicket(null)}
          title={`Ticket #${viewingTicket.id}`}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={viewingTicket.status} />
              <PriorityBadge priority={viewingTicket.priority} />
              <CategoryBadge category={viewingTicket.category} />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">{viewingTicket.title}</h3>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <User className="w-3 h-3" />
                Créé par <strong className="text-gray-600">{viewingTicket.createdByFullName}</strong>
                &nbsp;·&nbsp;
                <TimeAgo dateStr={viewingTicket.createdAt} />
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingTicket.description}</p>
            </div>

            {viewingTicket.assignedToFullName && (
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Assigné à <strong>{viewingTicket.assignedToFullName}</strong></span>
              </div>
            )}

            {viewingTicket.resolutionNotes && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Notes de résolution
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">{viewingTicket.resolutionNotes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingTicket(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* UPDATE STATUS MODAL (Admin / Tech) */}
      {processingTicket && (
        <Modal
          isOpen={processingTicket !== null}
          onClose={() => setProcessingTicket(null)}
          title={`Traiter — Ticket #${processingTicket.id}`}
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-gray-800">{processingTicket.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">Par {processingTicket.createdByFullName}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nouveau statut</label>
              <select
                value={updateForm.status || processingTicket.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as TicketStatus })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="OPEN">🔵 Ouvert</option>
                <option value="IN_PROGRESS">🟡 En cours de traitement</option>
                <option value="RESOLVED">🟢 Résolu</option>
                <option value="CLOSED">⚫ Fermé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes de résolution</label>
              <textarea
                rows={4}
                value={updateForm.resolutionNotes || ''}
                onChange={(e) => setUpdateForm({ ...updateForm, resolutionNotes: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Décrivez la solution apportée ou les prochaines étapes..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setProcessingTicket(null)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Supprimer le Ticket"
        message="Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible."
        isLoading={isSubmitting}
      />
    </div>
  );
};

// ─── Ticket Row ───────────────────────────────────────────────────────────────

interface TicketRowProps {
  ticket: Ticket;
  isAdminOrTech: boolean;
  currentUsername: string;
  onView: () => void;
  onProcess: () => void;
  onDelete: () => void;
}

const TicketRow: React.FC<TicketRowProps> = ({ ticket, isAdminOrTech, currentUsername, onView, onProcess, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const isOwner = ticket.createdByUsername === currentUsername;

  return (
    <div className={`transition-colors ${expanded ? 'bg-indigo-50/30' : 'hover:bg-gray-50/80'}`}>
      <div className="px-6 py-4 flex items-start gap-4">
        {/* Priority indicator strip */}
        <div className={`mt-1 w-1 h-12 rounded-full shrink-0 ${
          ticket.priority === 'CRITICAL' ? 'bg-red-500' :
          ticket.priority === 'HIGH' ? 'bg-orange-400' :
          ticket.priority === 'MEDIUM' ? 'bg-blue-400' :
          'bg-gray-300'
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
            <StatusBadge status={ticket.status} />
            <CategoryBadge category={ticket.category} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <p className="font-semibold text-gray-900 text-sm truncate">{ticket.title}</p>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {ticket.createdByFullName}
            </span>
            {ticket.assignedToFullName && (
              <span className="flex items-center gap-1 text-indigo-600">
                <User className="w-3 h-3" />
                → {ticket.assignedToFullName}
              </span>
            )}
            <TimeAgo dateStr={ticket.createdAt} />
          </div>

          {/* Preview / Expanded */}
          {expanded && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-200 rounded-xl px-4 py-3 whitespace-pre-wrap">
                {ticket.description}
              </p>
              {ticket.resolutionNotes && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Notes de résolution
                  </p>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{ticket.resolutionNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 mt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title={expanded ? 'Réduire' : 'Détails'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={onView}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Voir détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          {isAdminOrTech && (
            <button
              onClick={onProcess}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Traiter le ticket"
            >
              <ClipboardList className="w-4 h-4" />
            </button>
          )}
          {(isAdminOrTech || isOwner) && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
