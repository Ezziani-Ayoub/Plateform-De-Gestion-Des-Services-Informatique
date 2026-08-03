import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Bonjour, {user?.fullName || user?.username}
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Bienvenue sur la plateforme de gestion du parc informatique.
          </p>
          <div className="mt-6">
            <Link
              to="/equipment"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
            >
              <span>Gérer les équipements</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>


    </div>
  );
};
