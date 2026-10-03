import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  SlidersHorizontal,
  Calendar,
  Layers,
  Package,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';
import { useCategoriesQuery } from '../../hooks/useCategoryQueries';
import { useToast } from '../../../../context/ToastContext';
import CategoryModal from '../components/CategoryModal';
import SubCategoryModal from '../components/SubCategoryModal';
import DynamicFieldsModal from '../components/DynamicFieldsModal';
import CategoryDeleteModal from '../components/CategoryDeleteModal';

const CategoryManagementPage = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMasterFilter, setSelectedMasterFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'table'
  const [expandedCategories, setExpandedCategories] = useState({});

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState('');
  const [editingSubCategory, setEditingSubCategory] = useState(null);

  const [dynamicFieldsModalOpen, setDynamicFieldsModalOpen] = useState(false);
  const [activeSubCategoryForFields, setActiveSubCategoryForFields] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('category'); // 'category' | 'subcategory'

  const { data: categories = [], isLoading, refetch, isFetching } = useCategoriesQuery(searchQuery);

  const handleRefresh = async () => {
    await refetch();
    toast.info('Categories data refreshed!');
  };

  // Initialize expanded categories when categories load
  React.useEffect(() => {
    if (categories.length > 0 && Object.keys(expandedCategories).length === 0) {
      const initialMap = {};
      categories.forEach((cat) => {
        initialMap[cat.id] = true; // expanded by default
      });
      setExpandedCategories(initialMap);
    }
  }, [categories]);

  const toggleExpand = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleExpandAll = () => {
    const map = {};
    categories.forEach((c) => (map[c.id] = true));
    setExpandedCategories(map);
  };

  const handleCollapseAll = () => {
    setExpandedCategories({});
  };

  // Filter categories by master category dropdown selection
  const filteredCategories = categories.filter((cat) => {
    if (selectedMasterFilter !== 'ALL' && cat.id !== selectedMasterFilter) {
      return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalMasterCategories = categories.length;
  const allSubCategories = categories.flatMap((c) => c.subCategories || []);
  const totalSubCategories = allSubCategories.length;
  const expiryEnabledCount = allSubCategories.filter((s) => s.enableExpiryDate).length;
  const totalFieldsCount = allSubCategories.reduce(
    (acc, curr) => acc + (curr.additionalFields?.length || 0),
    0
  );
  const totalProductsTagged = categories.reduce(
    (acc, curr) => acc + (curr._count?.products || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest">
              <FolderTree size={14} /> Catalog & Taxonomy Architecture
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Category & Sub-Category Manager
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Organize multi-tenant product hierarchies, configure batch expiry date tracking rules, and define custom dynamic attribute fields per sub-category.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-lg"
            >
              <Plus size={18} />
              <span>+ Master Category</span>
            </button>

            <button
              onClick={() => {
                setEditingSubCategory(null);
                setPreselectedCategoryId(categories[0]?.id || '');
                setSubCategoryModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/40 transition-all cursor-pointer border border-indigo-400/30"
            >
              <Plus size={18} />
              <span>+ Sub-Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-t-4 border-t-indigo-600 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shrink-0 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <FolderTree size={22} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Master Categories</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{totalMasterCategories}</div>
              <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                <Package size={12} /> {totalProductsTagged} Products Tagged
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-t-4 border-t-purple-600 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl shrink-0 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Layers size={22} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Sub-Categories</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{totalSubCategories}</div>
              <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Classifications
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-t-4 border-t-emerald-500 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shrink-0 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <Calendar size={22} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Expiry Trackers</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{expiryEnabledCount}</div>
              <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Mandatory Rules
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-t-4 border-t-amber-500 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shrink-0 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Custom Fields</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{totalFieldsCount}</div>
              <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Sparkles size={12} /> Dynamic Attributes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories or sub-categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {/* Filter Dropdown & Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={selectedMasterFilter}
            onChange={(e) => setSelectedMasterFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Master Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Refresh Data */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
            title="Refresh List"
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin text-indigo-600' : ''} />
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'tree' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tree Card View"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Tree View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Data Table View"
            >
              <List size={16} />
              <span className="hidden sm:inline">Table View</span>
            </button>
          </div>

          {/* Tree View Expand/Collapse toggle buttons */}
          {viewMode === 'tree' && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleExpandAll}
                className="px-3 py-2 text-[11px] font-extrabold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer border border-slate-200/80"
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-3 py-2 text-[11px] font-extrabold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer border border-slate-200/80"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <RefreshCw size={32} className="animate-spin text-indigo-600" />
          </div>
          <div className="text-base font-extrabold text-slate-900">Loading Categories & Dynamic Fields...</div>
          <p className="text-xs text-slate-500">Fetching taxonomy catalog and configuration rules.</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <FolderTree size={32} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">No Categories Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No categories match your search criteria. Click below to add your first master category.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={16} /> Create Master Category
          </button>
        </div>
      ) : viewMode === 'tree' ? (
        /* TREE CARDS ACCORDION VIEW */
        <div className="space-y-5">
          {filteredCategories.map((category) => {
            const isExpanded = Boolean(expandedCategories[category.id]);
            const q = searchQuery.trim().toLowerCase();

            // Filter sub-categories by search query if present
            const subCats = (category.subCategories || []).filter((sub) => {
              if (!q) return true;
              const catNameMatches = category.name.toLowerCase().includes(q);
              const catDescMatches = category.description && category.description.toLowerCase().includes(q);
              if (catNameMatches || catDescMatches) return true;

              const subNameMatches = sub.name.toLowerCase().includes(q);
              const subDescMatches = sub.description && sub.description.toLowerCase().includes(q);
              const fieldMatches = sub.additionalFields?.some((f) =>
                f.labelName.toLowerCase().includes(q)
              );
              return subNameMatches || subDescMatches || fieldMatches;
            });

            return (
              <div
                key={category.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300/80 transition-all duration-300 overflow-hidden group"
              >
                {/* Category Card Header */}
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/40 relative">
                  {/* Left edge gradient accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 via-indigo-600 to-purple-600 rounded-r-full" />

                  <div className="flex items-center gap-4 cursor-pointer flex-1 pl-2" onClick={() => toggleExpand(category.id)}>
                    <button className="p-1.5 rounded-xl text-slate-400 group-hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                      {isExpanded ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                      <FolderTree size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-black text-lg text-slate-900 tracking-tight">{category.name}</h3>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full border border-indigo-200/80 shadow-2xs">
                          {subCats.length} Sub-Categories
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-slate-200/80">
                          <Package size={14} className="text-slate-500" /> {category._count?.products || 0} Products
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">{category.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions for Master Category */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-2">
                    <button
                      onClick={() => {
                        setEditingSubCategory(null);
                        setPreselectedCategoryId(category.id);
                        setSubCategoryModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-indigo-200/80 shadow-2xs hover:shadow-md"
                    >
                      <Plus size={15} /> Add Sub-Cat
                    </button>

                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryModalOpen(true);
                      }}
                      className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer border border-slate-200/80"
                      title="Edit Master Category"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setTargetToDelete(category);
                        setDeleteType('category');
                        setDeleteModalOpen(true);
                      }}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-slate-200/80"
                      title="Delete Master Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Sub-Categories Expanded List */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-200/80 bg-white space-y-4">
                    {subCats.length === 0 ? (
                      <div className="p-8 bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-3xl text-center text-xs text-slate-500 space-y-3">
                        <div className="font-semibold">No sub-categories created under <strong className="text-slate-900">{category.name}</strong> yet.</div>
                        <button
                          onClick={() => {
                            setEditingSubCategory(null);
                            setPreselectedCategoryId(category.id);
                            setSubCategoryModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <Plus size={15} /> Add First Sub-Category
                        </button>
                      </div>
                    ) : (
                      subCats.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 bg-gradient-to-r from-slate-50/60 via-white to-slate-50/30 hover:bg-white shadow-xs hover:shadow-lg transition-all duration-300 space-y-3.5 group/sub"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-black text-sm text-slate-900 group-hover/sub:text-indigo-600 transition-colors">{sub.name}</span>

                                {/* Expiry Date Status Badge */}
                                {sub.enableExpiryDate ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-300/80 text-[10px] font-black rounded-full shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <Calendar size={12} /> Expiry Tracking Enabled
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200/80 text-[10px] font-bold rounded-full">
                                    Standard Stock
                                  </span>
                                )}

                                <span className="px-2.5 py-0.5 bg-slate-200/80 text-slate-700 text-[10px] font-bold rounded-md border border-slate-300/60">
                                  {sub._count?.products || 0} Products
                                </span>
                              </div>
                              {sub.description && (
                                <p className="text-xs text-slate-500 font-medium">{sub.description}</p>
                              )}
                            </div>

                            {/* Sub-Category Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setActiveSubCategoryForFields(sub);
                                  setDynamicFieldsModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200/80 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-md"
                              >
                                <SlidersHorizontal size={14} />
                                <span>Fields ({sub.additionalFields?.length || 0})</span>
                              </button>

                              <button
                                onClick={() => {
                                  setEditingSubCategory(sub);
                                  setPreselectedCategoryId(category.id);
                                  setSubCategoryModalOpen(true);
                                }}
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
                                title="Edit Sub-Category"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                onClick={() => {
                                  setTargetToDelete(sub);
                                  setDeleteType('subcategory');
                                  setDeleteModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
                                title="Delete Sub-Category"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Dynamic Custom Fields Tag Chips */}
                          {sub.additionalFields && sub.additionalFields.length > 0 && (
                            <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2 flex-wrap text-xs">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Sparkles size={12} className="text-amber-500" /> Attributes:
                              </span>
                              {sub.additionalFields.map((field) => (
                                <span
                                  key={field.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs hover:border-indigo-300 transition-colors"
                                >
                                  <span>{field.labelName}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded font-mono uppercase font-black">
                                    {field.inputType}
                                  </span>
                                  {field.isRequired && (
                                    <span className="text-amber-600 font-black text-xs" title="Required Field">
                                      *
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* DATA TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[11px] font-black text-slate-300 uppercase tracking-widest">
                  <th className="py-4 px-5">Sub-Category</th>
                  <th className="py-4 px-5">Master Parent Category</th>
                  <th className="py-4 px-5">Products Tagged</th>
                  <th className="py-4 px-5">Expiry Date Policy</th>
                  <th className="py-4 px-5">Dynamic Custom Fields</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCategories.flatMap((cat) => {
                  const q = searchQuery.trim().toLowerCase();
                  const subCats = (cat.subCategories || []).filter((sub) => {
                    if (!q) return true;
                    const catNameMatches = cat.name.toLowerCase().includes(q);
                    if (catNameMatches) return true;
                    const subNameMatches = sub.name.toLowerCase().includes(q);
                    const subDescMatches = sub.description && sub.description.toLowerCase().includes(q);
                    const fieldMatches = sub.additionalFields?.some((f) =>
                      f.labelName.toLowerCase().includes(q)
                    );
                    return subNameMatches || subDescMatches || fieldMatches;
                  });

                  return subCats.map((sub) => (
                    <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900">{sub.name}</div>
                        {sub.description && <div className="text-[11px] text-slate-500 font-medium">{sub.description}</div>}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-700">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black border border-indigo-200/80">
                          <FolderTree size={14} /> {cat.name}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">{sub._count?.products || 0}</span>
                      </td>
                      <td className="py-4 px-5">
                        {sub.enableExpiryDate ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-300">
                            <CheckCircle2 size={13} /> Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200">
                            <XCircle size={13} /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(sub.additionalFields || []).slice(0, 3).map((f) => (
                            <span key={f.id} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] font-bold border border-slate-200">
                              {f.labelName}
                            </span>
                          ))}
                          {(sub.additionalFields?.length || 0) > 3 && (
                            <span className="text-[10px] text-indigo-700 font-black bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">
                              +{sub.additionalFields.length - 3} more
                            </span>
                          )}
                          {(!sub.additionalFields || sub.additionalFields.length === 0) && (
                            <span className="text-slate-400 italic text-[11px]">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveSubCategoryForFields(sub);
                              setDynamicFieldsModalOpen(true);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer border border-purple-200/60"
                            title="Manage Dynamic Fields"
                          >
                            <SlidersHorizontal size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSubCategory(sub);
                              setPreselectedCategoryId(cat.id);
                              setSubCategoryModalOpen(true);
                            }}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200/80"
                            title="Edit Sub-Category"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setTargetToDelete(sub);
                              setDeleteType('subcategory');
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-200/60"
                            title="Delete Sub-Category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categoryToEdit={editingCategory}
      />

      <SubCategoryModal
        isOpen={subCategoryModalOpen}
        onClose={() => setSubCategoryModalOpen(false)}
        masterCategories={categories}
        preselectedCategoryId={preselectedCategoryId}
        subCategoryToEdit={editingSubCategory}
      />

      <DynamicFieldsModal
        isOpen={dynamicFieldsModalOpen}
        onClose={() => setDynamicFieldsModalOpen(false)}
        subCategory={activeSubCategoryForFields}
      />

      <CategoryDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        targetToDelete={targetToDelete}
        type={deleteType}
      />
    </div>
  );
};

export default CategoryManagementPage;
