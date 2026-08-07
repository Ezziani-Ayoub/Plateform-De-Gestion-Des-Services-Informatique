import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, CheckCheck, Ticket, AlertCircle, Info, RefreshCw, Filter
} from 'lucide-react';
import { notificationService } from '../services/notification.service';
import type { Notification } from '../types';
import { Navbar } from '../components/Navbar';

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `Il y a ${Math.floor(diff / 86400)} j`;
  return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function notifMeta(type: string): { icon: React.ReactNode; color: string; label: string } {
  switch (type) {
    case 'TICKET_CREATED':
      return { icon: <Ticket className="w-5 h-5" />, color: 'text-sky-500 bg-sky-100', label: 'Ticket créé' };
    case 'TICKET_ASSIGNED':
      return { icon: <AlertCircle className="w-5 h-5" />, color: 'text-violet-500 bg-violet-100', label: 'Assignation' };
    case 'TICKET_STATUS_CHANGED':
      return { icon: <RefreshCw className="w-5 h-5" />, color: 'text-amber-500 bg-amber-100', label: 'Statut mis à jour' };
    case 'TICKET_RESOLVED':
    case 'TICKET_CLOSED':
      return { icon: <CheckCheck className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-100', label: 'Ticket résolu' };
    default:
      return { icon: <Info className="w-5 h-5" />, color: 'text-gray-500 bg-gray-100', label: 'Information' };
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

type FilterMode = 'all' | 'unread';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recent, count] = await Promise.all([
        notificationService.getRecent(50),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(recent);
      setUnreadCount(count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleMarkOneRead = async (notif: Notification) => {
    if (notif.read) return;
    await notificationService.markAsRead(notif.id);
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Notifications" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center shadow-md">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-sky-600 font-medium">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Tout marquer lu
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Tabs ───────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          {(['all', 'unread'] as FilterMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === mode
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {mode === 'all' ? 'Toutes' : 'Non lues'}
              {mode === 'unread' && unreadCount > 0 && (
                <span className="ml-1 bg-white/20 rounded-full px-1.5 text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── List ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Chargement…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-600">Aucune notification</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'unread' ? 'Vous avez tout lu !' : 'Aucune notification pour le moment.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {displayed.map(notif => {
              const meta = notifMeta(notif.type);
              return (
                <button
                  key={notif.id}
                  onClick={() => handleMarkOneRead(notif)}
                  className={`w-full text-left flex items-start gap-4 px-6 py-5 hover:bg-gray-50 transition-colors ${
                    !notif.read ? 'bg-sky-50/40' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}>
                    {meta.icon}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          {meta.label}
                        </span>
                        <p className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-sky-500 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{timeAgo(notif.createdAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
