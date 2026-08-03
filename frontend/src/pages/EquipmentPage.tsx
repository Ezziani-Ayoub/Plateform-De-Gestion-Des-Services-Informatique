import React, { useState } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Equipment, EquipmentStatus, CreateEquipmentPayload } from '../types';
import { Plus, Search, Filter, Edit2, Trash2, Monitor, RefreshCw, AlertCircle } from 'lucide-react';

export const EquipmentPage: React.FC = () => {
  const {
    equipments,
    pageData,
    params,
    setParams,
    isLoading,
    error,
    refresh,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  } = useEquipment();

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState<CreateEquipmentPayload>({
    name: '',
    serialNumber: '',
    category: 'LAPTOP',
    status: 'AVAILABLE',
    location: '',
    purchaseDate: '',
    description: '',
  });

  const handleOpenAddModal = () => {
    setEditingEquipment(null);
    setFormData({
      name: '',
      serialNumber: '',
      category: 'LAPTOP',
      status: 'AVAILABLE',
      location: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      description: '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormData({
      name: equipment.name,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      status: equipment.status,
      location: equipment.location || '',
      purchaseDate: equipment.purchaseDate || '',
      description: equipment.description || '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, formData);
      } else {
        await createEquipment(formData);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de l\'enregistrement de l\'équipement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await deleteEquipment(deletingId);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || 'Impossible de supprimer cet équipement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-sky-600" />
            <span>Gestion du Parc Informatique</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gérez et suivez l'ensemble du matériel informatique de l'entreprise.
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
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Équipement</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, n° de série ou emplacement..."
            value={params.search || ''}
            onChange={(e) => setParams({ ...params, search: e.target.value, page: 0 })}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={params.category || ''}
              onChange={(e) => setParams({ ...params, category: e.target.value || undefined, page: 0 })}
              className="bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 px-3 py-2 focus:outline-none focus:border-sky-500"
            >
              <option value="">Toutes catégories</option>
              <option value="LAPTOP">Ordinateur Portable</option>
              <option value="DESKTOP">PC Fixe</option>
              <option value="SERVER">Serveur</option>
              <option value="NETWORK">Matériel Réseau</option>
              <option value="PRINTER">Imprimante</option>
            </select>
          </div>

          <select
            value={params.status || ''}
            onChange={(e) => setParams({ ...params, status: (e.target.value as EquipmentStatus) || undefined, page: 0 })}
            className="bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="">Tous les statuts</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="IN_USE">En Utilisation</option>
            <option value="MAINTENANCE">En Maintenance</option>
            <option value="RETIRED">Réformé</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table View */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Nom de l'équipement</th>
                <th className="px-6 py-4">N° de Série</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Emplacement</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && equipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></span>
                      <span>Chargement du matériel...</span>
                    </div>
                  </td>
                </tr>
              ) : equipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun équipement trouvé.
                  </td>
                </tr>
              ) : (
                equipments.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 font-normal truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{item.serialNumber}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      <span className="px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">{item.location || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
        {pageData && pageData.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
            <div>
              Affichage de {pageData.number * pageData.size + 1} à{' '}
              {Math.min((pageData.number + 1) * pageData.size, pageData.totalElements)} sur{' '}
              {pageData.totalElements} équipements
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pageData.first}
                onClick={() => setParams({ ...params, page: pageData.number - 1 })}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <span className="font-semibold text-gray-700">
                {pageData.number + 1} / {pageData.totalPages}
              </span>
              <button
                disabled={pageData.last}
                onClick={() => setParams({ ...params, page: pageData.number + 1 })}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEquipment ? "Modifier l'Équipement" : "Ajouter un Nouvel Équipement"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom du matériel *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-sky-500"
              placeholder="ex: MacBook Pro 16 M3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">N° de Série *</label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-sky-500"
                placeholder="ex: SN-998822"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Catégorie *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-sky-500"
              >
                <option value="LAPTOP">Ordinateur Portable</option>
                <option value="DESKTOP">PC Fixe</option>
                <option value="SERVER">Serveur</option>
                <option value="NETWORK">Matériel Réseau</option>
                <option value="PRINTER">Imprimante</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Statut *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-sky-500"
              >
                <option value="AVAILABLE">Disponible</option>
                <option value="IN_USE">En Utilisation</option>
                <option value="MAINTENANCE">En Maintenance</option>
                <option value="RETIRED">Réformé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Emplacement</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-sky-500"
                placeholder="ex: Bureau 102"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Date d'achat</label>
            <input
              type="date"
              value={formData.purchaseDate || ''}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Notes</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-sky-500"
              placeholder="Détails..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'Équipement"
        message="Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible."
        isLoading={isSubmitting}
      />
    </div>
  );
};
