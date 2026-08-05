import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import { departmentService } from '../services/department.service';
import { User, Department, CreateUserPayload, UpdateUserPayload } from '../types';
import { Search, Plus, Edit2, Trash2, UserCheck, UserX, Building2, RefreshCw } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password?: string;
    fullName: string;
    role: string;
    departmentId: number | '';
    enabled: boolean;
  }>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'ROLE_EMPLOYEE',
    departmentId: '',
    enabled: true,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getUsers({
        search: search || undefined,
        departmentId: selectedDept !== '' ? (selectedDept as number) : undefined,
        page,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      setUsers(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      console.error('Failed to load users', err);
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await departmentService.getDepartments();
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, selectedDept, page]);

  const handleOpenCreateModal = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'ROLE_EMPLOYEE',
      departmentId: '',
      enabled: true,
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    const mainRole = user.roles?.[0] || 'ROLE_EMPLOYEE';
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.fullName || '',
      role: mainRole,
      departmentId: user.departmentId || '',
      enabled: user.enabled ?? true,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.username || !formData.email || !formData.password) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateUserPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || formData.username,
        roles: [formData.role],
        departmentId: formData.departmentId !== '' ? Number(formData.departmentId) : undefined,
      };
      await userService.createUser(payload);
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);

    setIsSubmitting(true);
    try {
      const payload: UpdateUserPayload = {
        email: formData.email,
        fullName: formData.fullName,
        roles: [formData.role],
        departmentId: formData.departmentId !== '' ? Number(formData.departmentId) : -1,
        enabled: formData.enabled,
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      await userService.updateUser(selectedUser.id, payload);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.updateUser(user.id, { enabled: !user.enabled });
      fetchUsers();
    } catch (err: any) {
      alert('Erreur lors du changement de statut');
    }
  };

  const getRoleBadge = (roles?: string[]) => {
    const role = roles?.[0] || 'ROLE_EMPLOYEE';
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Administrateur</span>;
      case 'ROLE_TECHNICIAN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Technicien IT</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Employé</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-xs text-gray-500 mt-1">Gérez les comptes, rôles et affectations aux départements.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, nom d'utilisateur ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value ? Number(e.target.value) : '');
              setPage(0);
            }}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            <option value="">Tous les départements</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all flex items-center justify-center"
          title="Actualiser"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase text-[11px] tracking-wider">
                <th className="px-6 py-3.5 font-semibold">Utilisateur</th>
                <th className="px-6 py-3.5 font-semibold">Contact</th>
                <th className="px-6 py-3.5 font-semibold">Rôle</th>
                <th className="px-6 py-3.5 font-semibold">Département</th>
                <th className="px-6 py-3.5 font-semibold">Statut</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
                          {u.fullName?.charAt(0) || u.username.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.fullName || u.username}</p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.roles)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {u.departmentName ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {u.departmentName}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Non affecté</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          u.enabled ?? true
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {u.enabled ?? true ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Actif
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Inactif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(u)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>Total : {totalElements} utilisateur(s)</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              <span>
                Page {page + 1} sur {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer un utilisateur"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom d'utilisateur *</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="ex: jdupont"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="ex: Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="jean.dupont@sos-maroc.org"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Au moins 6 caractères"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Rôle *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ROLE_EMPLOYEE">Employé</option>
              <option value="ROLE_TECHNICIAN">Technicien IT</option>
              <option value="ROLE_ADMIN">Administrateur</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Département</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value ? Number(e.target.value) : '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Aucun département</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'utilisateur"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nouveau mot de passe (optionnel)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Laisser vide pour ne pas modifier"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ROLE_EMPLOYEE">Employé</option>
              <option value="ROLE_TECHNICIAN">Technicien IT</option>
              <option value="ROLE_ADMIN">Administrateur</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Département</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value ? Number(e.target.value) : '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Aucun département</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabledCheck"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
            />
            <label htmlFor="enabledCheck" className="text-xs font-semibold text-gray-700">
              Compte actif
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${selectedUser?.fullName || selectedUser?.username}" ? Cette action est irréversible.`}
      />
    </div>
  );
};
