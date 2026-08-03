import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Monitor } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Tableau de bord',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Équipements IT',
      path: '/equipment',
      icon: Monitor,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header with Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-200 p-0.5 bg-white">
            <img src="/logo.svg" alt="PGSI" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 tracking-tight text-base leading-none">PGSI</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">Services IT</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs">
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.fullName || user?.username}</p>
            <p className="text-[10px] text-gray-400 truncate">
              {user?.roles?.[0]?.replace('ROLE_', '') || 'USER'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
