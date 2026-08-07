import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LogOut, User as UserIcon, Bell, CheckCheck, Ticket, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notification.service';
import type { Notification } from '../types';

interface NavbarProps {
  title?: string;
}

// How often to poll for new notifications (ms)
const POLL_INTERVAL_MS = 30_000;

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

function notifIcon(type: string) {
  switch (type) {
    case 'TICKET_CREATED':   return <Ticket className="w-4 h-4 text-sky-500" />;
    case 'TICKET_ASSIGNED':  return <AlertCircle className="w-4 h-4 text-violet-500" />;
    case 'TICKET_RESOLVED':
    case 'TICKET_CLOSED':    return <CheckCheck className="w-4 h-4 text-emerald-500" />;
    default:                 return <Info className="w-4 h-4 text-amber-500" />;
  }
}

export const Navbar: React.FC<NavbarProps> = ({ title = 'Tableau de bord' }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const [recent, count] = await Promise.all([
        notificationService.getRecent(15),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(recent);
      setUnreadCount(count);
    } catch {
      // silently ignore network errors
    }
  }, []);

  // Initial load + periodic polling
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open && unreadCount > 0) {
      // Refresh list when opening
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkOneRead = async (notif: Notification) => {
    if (notif.read) return;
    await notificationService.markAsRead(notif.id);
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* ── Notification Bell ─────────────────────────────────────── */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="notification-bell"
            onClick={handleOpen}
            className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-sky-500 ring-2 ring-white text-white text-[10px] font-bold px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-12 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slideDown">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Notifications</p>
                  {unreadCount > 0 && (
                    <p className="text-xs text-sky-600 font-medium">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-medium transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout marquer lu
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => handleMarkOneRead(notif)}
                      className={`w-full text-left px-5 py-4 flex gap-3 hover:bg-gray-50 transition-colors ${
                        !notif.read ? 'bg-sky-50/60' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                        !notif.read ? 'bg-sky-100' : 'bg-gray-100'
                      }`}>
                        {notifIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[11px] text-gray-400 mt-1.5">{timeAgo(notif.createdAt)}</p>
                      </div>

                      {/* Unread dot */}
                      {!notif.read && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-sky-500 mt-2 self-start" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 text-center">
                <p className="text-xs text-gray-400">Les notifications sont actualisées toutes les 30 s</p>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-[1px] bg-gray-200" />

        {/* ── User Pill ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full pl-3 pr-2 py-1">
          <UserIcon className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-semibold text-gray-700">{user?.username}</span>
          <button
            onClick={logout}
            className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
