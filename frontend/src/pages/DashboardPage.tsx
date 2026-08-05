import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../types';
import { Users, Monitor, CheckCircle, Clock, Wrench, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats', err);
      setError('Impossible de charger les statistiques.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      badgeColor: 'bg-blue-500',
      description: 'Comptes actifs enregistrés',
      link: '/users',
    },
    {
      title: 'Total Équipements',
      value: stats?.totalEquipments ?? 0,
      icon: Monitor,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badgeColor: 'bg-indigo-500',
      description: 'Matériels dans le parc IT',
      link: '/equipment',
    },
    {
      title: 'Équipements Affectés',
      value: stats?.assignedEquipments ?? 0,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeColor: 'bg-emerald-500',
      description: 'Attribués aux collaborateurs',
      link: '/equipment',
    },
    {
      title: 'Équipements Disponibles',
      value: stats?.availableEquipments ?? 0,
      icon: Clock,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
      badgeColor: 'bg-sky-500',
      description: 'En stock et attribuables',
      link: '/equipment',
    },
    {
      title: 'En Maintenance',
      value: stats?.maintenanceEquipments ?? 0,
      icon: Wrench,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeColor: 'bg-amber-500',
      description: 'En cours de réparation',
      link: '/equipment',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30 mb-3">
              SOS Villages d'Enfants Maroc
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Bonjour, {user?.fullName || user?.username} 👋
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Plateforme de Gestion des Services Informatiques (PGSI). Suivez et gérez efficacement les ressources IT et utilisateurs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all border border-white/10 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <Link
              to="/equipment"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
            >
              <span>Gérer les équipements</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${card.color} transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`w-2 h-2 rounded-full ${card.badgeColor}`} />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">{card.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  {isLoading ? (
                    <div className="h-8 w-14 bg-gray-100 animate-pulse rounded-md" />
                  ) : (
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {card.value}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{card.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <Link
                  to={card.link}
                  className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 group-hover:underline"
                >
                  Détails <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
};
