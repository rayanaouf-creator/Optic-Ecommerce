import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProductGroup, Frame } from '../../types';
import { 
  FolderTree, Plus, Edit2, Trash2, X, Check, Search, 
  Package, Layers, Eye, CheckSquare, Square, AlertCircle, Sparkles
} from 'lucide-react';

const COLOR_PRESETS = [
  { id: 'indigo', name: 'Indigo Élégant', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', hex: '#6366f1' },
  { id: 'emerald', name: 'Vert Émeraude', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', hex: '#10b981' },
  { id: 'amber', name: 'Ambre & Or', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', hex: '#f59e0b' },
  { id: 'rose', name: 'Rose & Rubis', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', hex: '#f43f5e' },
  { id: 'sky', name: 'Bleu Azur', bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', hex: '#0ea5e9' },
  { id: 'purple', name: 'Violet Prestige', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', hex: '#a855f7' },
  { id: 'slate', name: 'Gris Neutre', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', hex: '#64748b' }
];

export function getGroupColorClasses(colorId?: string) {
  const found = COLOR_PRESETS.find(c => c.id === colorId);
  return found || COLOR_PRESETS[0];
}

export function AdminGroups() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupColor, setGroupColor] = useState('indigo');
  const [submitting, setSubmitting] = useState(false);

  // Manage Assigned Products modal state
  const [managingGroup, setManagingGroup] = useState<ProductGroup | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [assignedProductIds, setAssignedProductIds] = useState<Set<string>>(new Set());
  const [savingAssignments, setSavingAssignments] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [groupsSnap, framesSnap] = await Promise.all([
        getDocs(collection(db, 'groups')),
        getDocs(collection(db, 'frames'))
      ]);

      const groupsList = groupsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProductGroup));

      const framesList = framesSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          groupIds: Array.isArray(data.groupIds) ? data.groupIds : [],
          groupNames: Array.isArray(data.groupNames) ? data.groupNames : []
        } as Frame;
      });

      setGroups(groupsList);
      setFrames(framesList);
    } catch (err) {
      console.error('Error fetching groups or frames:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingGroup(null);
    setGroupName('');
    setGroupDescription('');
    setGroupColor('indigo');
    setIsModalOpen(true);
  }

  function openEditModal(group: ProductGroup) {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setGroupColor(group.color || 'indigo');
    setIsModalOpen(true);
  }

  async function handleSaveGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) return;

    setSubmitting(true);
    try {
      const dataToSave = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        color: groupColor,
      };

      if (editingGroup) {
        await updateDoc(doc(db, 'groups', editingGroup.id), dataToSave);
        
        // Update local state
        setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, ...dataToSave } : g));

        // If the group name changed, synchronize it on all frames that hold this group
        if (editingGroup.name !== groupName.trim()) {
          const framesToUpdate = frames.filter(f => f.groupIds?.includes(editingGroup.id));
          if (framesToUpdate.length > 0) {
            const batch = writeBatch(db);
            framesToUpdate.forEach(f => {
              const updatedNames = (f.groupIds || []).map(gid => {
                if (gid === editingGroup.id) return groupName.trim();
                const matched = groups.find(g => g.id === gid);
                return matched ? matched.name : '';
              }).filter(Boolean);

              batch.update(doc(db, 'frames', f.id), { groupNames: updatedNames });
            });
            await batch.commit();

            // Refresh frames locally
            setFrames(prev => prev.map(f => {
              if (f.groupIds?.includes(editingGroup.id)) {
                const updatedNames = (f.groupIds || []).map(gid => gid === editingGroup.id ? groupName.trim() : (groups.find(g => g.id === gid)?.name || ''));
                return { ...f, groupNames: updatedNames };
              }
              return f;
            }));
          }
        }
      } else {
        const docRef = await addDoc(collection(db, 'groups'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        setGroups(prev => [...prev, { id: docRef.id, ...dataToSave }]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving group:', err);
      alert('Erreur lors de l\'enregistrement du groupe.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteGroup(group: ProductGroup) {
    const assignedCount = frames.filter(f => f.groupIds?.includes(group.id)).length;
    const confirmMessage = assignedCount > 0 
      ? `Êtes-vous sûr de vouloir supprimer le groupe "${group.name}" ? Il est actuellement assigné à ${assignedCount} produit(s). Les produits seront automatiquement retirés de ce groupe.`
      : `Êtes-vous sûr de vouloir supprimer le groupe "${group.name}" ?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      // 1. Delete the group document
      await deleteDoc(doc(db, 'groups', group.id));

      // 2. Unassign from all products
      const framesWithGroup = frames.filter(f => f.groupIds?.includes(group.id));
      if (framesWithGroup.length > 0) {
        const batch = writeBatch(db);
        framesWithGroup.forEach(f => {
          const nextGroupIds = (f.groupIds || []).filter(id => id !== group.id);
          const nextGroupNames = (f.groupNames || []).filter(name => name !== group.name);
          batch.update(doc(db, 'frames', f.id), {
            groupIds: nextGroupIds,
            groupNames: nextGroupNames
          });
        });
        await batch.commit();

        setFrames(prev => prev.map(f => {
          if (f.groupIds?.includes(group.id)) {
            return {
              ...f,
              groupIds: (f.groupIds || []).filter(id => id !== group.id),
              groupNames: (f.groupNames || []).filter(name => name !== group.name)
            };
          }
          return f;
        }));
      }

      setGroups(prev => prev.filter(g => g.id !== group.id));
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Erreur lors de la suppression du groupe.');
    }
  }

  // Open "Manage Products" for a specific group
  function openManageProducts(group: ProductGroup) {
    setManagingGroup(group);
    setProductSearch('');
    // Initialize set of product IDs currently belonging to this group
    const initialAssigned = new Set<string>();
    frames.forEach(f => {
      if (f.groupIds?.includes(group.id)) {
        initialAssigned.add(f.id);
      }
    });
    setAssignedProductIds(initialAssigned);
  }

  function toggleProductAssignment(productId: string) {
    setAssignedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }

  async function handleSaveAssignments() {
    if (!managingGroup) return;

    setSavingAssignments(true);
    try {
      const batch = writeBatch(db);
      const updatedFrames = [...frames];

      for (let i = 0; i < updatedFrames.length; i++) {
        const f = updatedFrames[i];
        const isCurrentlyAssigned = f.groupIds?.includes(managingGroup.id);
        const shouldBeAssigned = assignedProductIds.has(f.id);

        if (isCurrentlyAssigned !== shouldBeAssigned) {
          let nextGroupIds = [...(f.groupIds || [])];
          let nextGroupNames = [...(f.groupNames || [])];

          if (shouldBeAssigned) {
            if (!nextGroupIds.includes(managingGroup.id)) {
              nextGroupIds.push(managingGroup.id);
              nextGroupNames.push(managingGroup.name);
            }
          } else {
            nextGroupIds = nextGroupIds.filter(id => id !== managingGroup.id);
            nextGroupNames = nextGroupNames.filter(name => name !== managingGroup.name);
          }

          batch.update(doc(db, 'frames', f.id), {
            groupIds: nextGroupIds,
            groupNames: nextGroupNames
          });

          updatedFrames[i] = {
            ...f,
            groupIds: nextGroupIds,
            groupNames: nextGroupNames
          };
        }
      }

      await batch.commit();
      setFrames(updatedFrames);
      setManagingGroup(null);
    } catch (err) {
      console.error('Error saving assignments:', err);
      alert('Erreur lors de la mise à jour des assignations de produits.');
    } finally {
      setSavingAssignments(false);
    }
  }

  // Filter groups
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Products filtered for the assignment modal
  const filteredProductsForAssignment = frames.filter(f => {
    const q = productSearch.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      (f.brand && f.brand.toLowerCase().includes(q)) ||
      (f.sku && f.sku.toLowerCase().includes(q))
    );
  });

  const totalAssignedLinks = frames.reduce((count, f) => count + (f.groupIds?.length || 0), 0);

  if (loading) {
    return <div className="text-slate-500 py-10 text-center">Chargement des groupes de produits...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-slate-800" />
            Groupes de Produits (Collections)
          </h2>
          <p className="text-sm text-slate-500">
            Créez des groupes (ex: Promotions, Nouveautés, Solaires, Titane) et assignez vos articles facilement.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouveau Groupe
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>GROUPES CRÉÉS</span>
            <FolderTree className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{groups.length}</div>
          <div className="text-xs text-slate-400 mt-1">Catégories & ensembles configurés</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>PRODUITS CLASSÉS</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            {frames.filter(f => (f.groupIds?.length || 0) > 0).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Sur {frames.length} articles au catalogue</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>TOTAL LIENS D'ASSIGNATION</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-indigo-600">{totalAssignedLinks}</div>
          <div className="text-xs text-slate-400 mt-1">Multi-assignations incluses</div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un groupe par nom..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline-block">
          {filteredGroups.length} groupe{filteredGroups.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Groups List Grid */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FolderTree className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {searchQuery ? 'Aucun groupe ne correspond à votre recherche' : 'Aucun groupe de produits'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Les groupes vous permettent de catégoriser vos articles (ex. "Nouveautés", "Promotions", "Lunettes de Soleil", "Luxe").
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Créer le premier groupe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map(group => {
            const colorMeta = getGroupColorClasses(group.color);
            const assignedProducts = frames.filter(f => f.groupIds?.includes(group.id));
            const count = assignedProducts.length;

            return (
              <div 
                key={group.id} 
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3.5 h-3.5 rounded-full ${colorMeta.bg} ring-2 ring-white border ${colorMeta.border} shrink-0`} />
                      <h3 className="font-bold text-slate-900 text-base">{group.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(group)}
                        title="Modifier le groupe"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group)}
                        title="Supprimer le groupe"
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {group.description ? (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-4">
                      Aucune description spécifiée
                    </p>
                  )}

                  {/* Preview Thumbnails of Assigned Products */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                      <span>Articles assignés</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${colorMeta.bg} ${colorMeta.text}`}>
                        {count} produit{count > 1 ? 's' : ''}
                      </span>
                    </div>

                    {count === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        Aucun produit assigné à ce groupe.
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {assignedProducts.slice(0, 5).map(p => (
                          <div 
                            key={p.id}
                            title={`${p.name} - ${p.brand}`} 
                            className="w-9 h-9 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs"
                          >
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {count > 5 && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                            +{count - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Action */}
                <button
                  onClick={() => openManageProducts(group)}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  Assigner / Gérer les produits
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Group */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingGroup ? 'Modifier le Groupe' : 'Nouveau Groupe de Produits'}
                </h3>
                <p className="text-xs text-slate-500">Définissez le nom et l'apparence du groupe</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nom du groupe *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="Ex: Promotions Spéciales, Nouvelle Collection, Solaires..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description (optionnelle)
                </label>
                <textarea
                  rows={2}
                  value={groupDescription}
                  onChange={e => setGroupDescription(e.target.value)}
                  placeholder="Brève description ou critères du groupe..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Couleur du badge
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setGroupColor(preset.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                        groupColor === preset.id 
                          ? `${preset.border} ${preset.bg} ${preset.text} ring-2 ring-slate-900` 
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0" 
                        style={{ backgroundColor: preset.hex }} 
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !groupName.trim()}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? 'Enregistrement...' : 'Enregistrer le groupe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Products Assigned to Group */}
      {managingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${getGroupColorClasses(managingGroup.color).bg} border ${getGroupColorClasses(managingGroup.color).border}`} />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Assigner des produits à : <span className="underline decoration-slate-300">{managingGroup.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cochez ou décochez les articles pour les ajouter ou retirer du groupe
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setManagingGroup(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter toolbar inside modal */}
            <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Rechercher par nom, marque, SKU..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = new Set(assignedProductIds);
                    filteredProductsForAssignment.forEach(p => next.add(p.id));
                    setAssignedProductIds(next);
                  }}
                  className="text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Tout cocher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = new Set(assignedProductIds);
                    filteredProductsForAssignment.forEach(p => next.delete(p.id));
                    setAssignedProductIds(next);
                  }}
                  className="text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Tout décocher
                </button>
              </div>
            </div>

            {/* Selected Count Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1 shrink-0">
              <span>{filteredProductsForAssignment.length} produit{filteredProductsForAssignment.length > 1 ? 's' : ''} listé(s)</span>
              <span className="font-semibold text-slate-900">
                {assignedProductIds.size} sélectionné{assignedProductIds.size > 1 ? 's' : ''} au total
              </span>
            </div>

            {/* Products Checklist */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-[50vh]">
              {filteredProductsForAssignment.map(product => {
                const isSelected = assignedProductIds.has(product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProductAssignment(product.id)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-md transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </div>

                      <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>

                      <div>
                        <div className="text-sm font-bold text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">
                          {product.brand} • {product.price.toLocaleString()} DA
                          {product.sku && <span className="ml-2 font-mono text-[10px] text-slate-400">[{product.sku}]</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        product.inStock !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {product.inStock !== false ? 'En stock' : 'Rupture'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredProductsForAssignment.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Aucun produit ne correspond à cette recherche.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4 shrink-0">
              <span className="text-xs text-slate-500">
                {assignedProductIds.size} produit{assignedProductIds.size > 1 ? 's' : ''} feront partie de ce groupe
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setManagingGroup(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={savingAssignments}
                  onClick={handleSaveAssignments}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  {savingAssignments ? 'Enregistrement...' : 'Valider les assignations'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
