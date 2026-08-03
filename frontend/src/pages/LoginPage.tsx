import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, User, AlertCircle, ArrowRight, Server } from 'lucide-react';
import api from '../services/api';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Backend readiness state
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout>;

    const checkBackend = async () => {
      try {
        await api.get('/auth/me');
        if (isMounted) {
          setIsBackendReady(true);
          setIsWarmingUp(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        const status = err.response?.status;
        // Any HTTP status response from backend (401, 200, etc.) means server is UP
        if (status === 401 || status === 200) {
          setIsBackendReady(true);
          setIsWarmingUp(false);
        } else {
          // Backend is still booting up (502, 504, connection error)
          setIsBackendReady(false);
          setIsWarmingUp(true);
          // Probe again in 1.5 seconds
          timerId = setTimeout(checkBackend, 1500);
        }
      }
    };

    checkBackend();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      if (!err.response || status === 502 || status === 503 || status === 504) {
        setError("Le serveur Backend (http://localhost:8080) est en cours de démarrage ou indisponible. Veuillez patienter.");
        setIsBackendReady(false);
        setIsWarmingUp(true);
      } else if (status === 401) {
        setError("Nom d'utilisateur ou mot de passe incorrect.");
      } else {
        const msg = err.response?.data?.message || 'Identifiants invalides. Veuillez réessayer.';
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header & Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white rounded-2xl p-2 border border-gray-200 shadow-sm">
            <img src="/logo.svg" alt="PGSI Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PGSI</h1>
          <p className="text-sm text-gray-500 mt-1">Plateforme de Gestion des Services Informatiques</p>
        </div>

        {/* Clean White Login Box */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Connexion à votre espace</h2>

          {/* Backend warming up / Startup banner */}
          {isWarmingUp && !isBackendReady && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3 animate-pulse">
              <Server className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="font-semibold text-amber-900">Initialisation du serveur backend...</p>
                <p className="text-xs text-amber-700 mt-0.5">Veuillez patienter quelques instants pendant le démarrage du serveur. Cette bannière disparaîtra automatiquement dès qu'il sera prêt.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (isWarmingUp && !isBackendReady)}
              className="w-full mt-2 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Connexion...
                </>
              ) : isWarmingUp && !isBackendReady ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>En attente du serveur...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
