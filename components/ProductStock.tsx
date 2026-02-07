
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Product } from '../types';
import { CLOTHING_SIZES, DEFAULT_COLORS } from '../constants';

const ProductStock: React.FC = () => {
  const { user, setUser, role, moderatorName, t, language, syncUserProfile } = useApp();
  const [formData, setFormData] = useState({ 
    name: '', code: '', category: '', 
    selectedColors: [] as string[], 
    selectedSizes: [] as string[],
    customColor: '', 
    stockQuantity: '', buyPrice: '', sellPrice: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Grouping Logic for Inventory
  const groupedInventory = useMemo(() => {
    const products = user?.products || [];
    const groups: Record<string, { name: string, code: string, totalStock: number, items: Product[] }> = {};
    
    products.forEach(p => {
      const key = `${p.name}-${p.code}`.toLowerCase();
      if (!groups[key]) {
        groups[key] = { name: p.name, code: p.code, totalStock: 0, items: [] };
      }
      groups[key].totalStock += p.stockQuantity;
      groups[key].items.push(p);
    });

    return Object.values(groups).filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [user?.products, searchTerm]);

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(size) 
        ? prev.selectedSizes.filter(s => s !== size) 
        : [...prev.selectedSizes, size]
    }));
  };

  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(color) 
        ? prev.selectedColors.filter(c => c !== color) 
        : [...prev.selectedColors, color]
    }));
  };

  const selectAllSizes = () => {
    setFormData(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.length === CLOTHING_SIZES.length ? [] : [...CLOTHING_SIZES]
    }));
  };

  const selectAllColors = () => {
    setFormData(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.length === DEFAULT_COLORS.length ? [] : [...DEFAULT_COLORS]
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (formData.selectedColors.length === 0 || formData.selectedSizes.length === 0) {
      alert(language === 'EN' ? 'Select at least one color and one size' : 'অন্তত একটি কালার এবং একটি সাইজ সিলেক্ট করুন');
      return;
    }

    setIsSyncing(true);
    
    const newProducts: Product[] = [];
    const baseCode = formData.code || ('C-' + Date.now().toString().slice(-6));
    
    // Generate individual variants for each color-size combination
    formData.selectedColors.forEach(color => {
      formData.selectedSizes.forEach(size => {
        newProducts.push({
          id: 'P-' + Math.random().toString(36).substr(2, 9),
          name: formData.name,
          code: baseCode,
          category: formData.category || 'Clothing',
          color: color,
          size: size,
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          buyPrice: parseFloat(formData.buyPrice) || 0,
          sellPrice: parseFloat(formData.sellPrice) || 0,
          addedAt: new Date().toISOString()
        });
      });
    });

    const updatedUser = { ...user, products: [...(user.products || []), ...newProducts] };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    
    setFormData({ 
      name: '', code: '', category: '', selectedColors: [], selectedSizes: [], 
      customColor: '', stockQuantity: '', buyPrice: '', sellPrice: '' 
    });
    setIsSyncing(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingProduct) return;
    setIsSyncing(true);
    const updatedProducts = (user.products || []).map(p => p.id === editingProduct.id ? editingProduct : p);
    const updatedUser = { ...user, products: updatedProducts };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setEditingProduct(null);
    setIsSyncing(false);
  };

  const handleRemove = async (id: string) => {
    if (role === 'MODERATOR') return alert(t('insufficientPermissions'));
    if (!user || !confirm(language === 'EN' ? 'Delete this variant?' : 'এই ভেরিয়েন্টটি ডিলিট করতে চান?')) return;
    setIsSyncing(true);
    const updatedUser = { ...user, products: (user.products || []).filter(p => p.id !== id) };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setIsSyncing(false);
  };

  const inputClass = "px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent dark:border-gray-700 rounded-xl outline-none font-bold text-xs focus:border-primary transition-all w-full";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Edit Modal (Flat view for single item adjustment) */}
      {editingProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-[30px] shadow-2xl overflow-hidden border-4 border-primary/10">
            <div className="p-8 bg-primary text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">Edit Variant</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className={inputClass} placeholder="Name" required />
                <input type="text" value={editingProduct.code} onChange={e => setEditingProduct({...editingProduct, code: e.target.value})} className={inputClass} placeholder="Code" required />
                <input type="text" value={editingProduct.color} onChange={e => setEditingProduct({...editingProduct, color: e.target.value})} className={inputClass} placeholder="Color" required />
                <select value={editingProduct.size} onChange={e => setEditingProduct({...editingProduct, size: e.target.value})} className={inputClass}>
                  {CLOTHING_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="number" value={editingProduct.stockQuantity} onChange={e => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value) || 0})} className={inputClass} placeholder="Stock" required />
                <input type="number" value={editingProduct.buyPrice} onChange={e => setEditingProduct({...editingProduct, buyPrice: parseFloat(e.target.value) || 0})} className={inputClass} placeholder="Buy Price" required />
                <input type="number" value={editingProduct.sellPrice} onChange={e => setEditingProduct({...editingProduct, sellPrice: parseFloat(e.target.value) || 0})} className={`${inputClass} col-span-2`} placeholder="Sell Price" required />
              </div>
              <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px] border-b-4 border-black/20 mt-4">{t('save')}</button>
            </form>
          </div>
        </div>
      )}

      {/* Main Stock In Section */}
      <section className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-[40px] shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tighter flex items-center">
           <span className="w-2.5 h-8 bg-primary mr-4 rounded-full"></span>
           Stock In (Multi-Variant Creation)
        </h3>
        <form onSubmit={handleAdd} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">{t('productName')}</label>
                <input type="text" placeholder="e.g. Premium Panjabi" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} required />
             </div>
             <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">{t('productCode')}</label>
                <input type="text" placeholder="SKU-101" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className={inputClass} />
             </div>
          </div>

          {/* Color Multi-Select */}
          <div className="space-y-3">
             <div className="flex items-center justify-between px-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Colors</label>
                <button type="button" onClick={selectAllColors} className="text-[9px] font-black text-primary uppercase border-b-2 border-primary/20">
                   {formData.selectedColors.length === DEFAULT_COLORS.length ? 'Deselect All' : 'Select All Colors'}
                </button>
             </div>
             <div className="flex flex-wrap gap-2 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed dark:border-gray-700">
                {DEFAULT_COLORS.map(color => (
                   <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${formData.selectedColors.includes(color) ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}
                   >
                      {color}
                   </button>
                ))}
             </div>
          </div>

          {/* Size Multi-Select Grid */}
          <div className="space-y-3">
             <div className="flex items-center justify-between px-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Sizes</label>
                <button type="button" onClick={selectAllSizes} className="text-[9px] font-black text-primary uppercase border-b-2 border-primary/20">
                   {formData.selectedSizes.length === CLOTHING_SIZES.length ? 'Deselect All' : 'Select All Sizes'}
                </button>
             </div>
             <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed dark:border-gray-700">
                {CLOTHING_SIZES.map(size => (
                   <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${formData.selectedSizes.includes(size) ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}
                   >
                      {size}
                   </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Initial Stock / Variant</label>
                <input type="number" placeholder="Qty per combination" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className={inputClass} required />
                <span className="absolute right-4 top-10 text-[8px] font-black text-gray-300">PCS</span>
             </div>
             <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">{t('buyPrice')}</label>
                <input type="number" placeholder="Purchase Price" value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} className={inputClass} required />
             </div>
             <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">{t('sellPrice')}</label>
                <input type="number" placeholder="Selling Price" value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} className={inputClass} required />
             </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-3xl border-2 border-primary/10">
             <p className="text-[11px] font-black text-primary uppercase tracking-widest text-center">
                Generating <span className="text-lg underline mx-1">{formData.selectedColors.length * formData.selectedSizes.length}</span> unique variants for this stock entry.
             </p>
          </div>

          <button type="submit" disabled={isSyncing} className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-2xl uppercase tracking-[0.3em] text-[11px] border-b-8 border-black/20 disabled:opacity-50 active:scale-95 transition-all">
            {isSyncing ? 'Processing Multi-Variants...' : 'Add to Inventory (Bulk Stock In)'}
          </button>
        </form>
      </section>

      {/* Grouped Inventory Display */}
      <section className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-[40px] shadow-sm border dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
           <div>
              <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Inventory Status</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Grouped by Model & Code</p>
           </div>
           <div className="relative w-full md:w-80">
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={3}/></svg>
              <input type="text" placeholder="Search models or codes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border-2 dark:border-gray-700 rounded-3xl outline-none font-bold text-xs" />
           </div>
        </div>

        <div className="space-y-4">
           {groupedInventory.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-[30px] border-2 border-dashed dark:border-gray-700">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No products in inventory</p>
              </div>
           ) : groupedInventory.map(group => {
              const groupKey = `${group.name}-${group.code}`;
              const isExpanded = expandedGroup === groupKey;
              
              return (
                 <div key={groupKey} className="overflow-hidden border-2 dark:border-gray-700 rounded-[30px] transition-all hover:border-primary/30">
                    <button 
                       onClick={() => setExpandedGroup(isExpanded ? null : groupKey)}
                       className={`w-full flex items-center justify-between p-6 sm:p-8 text-left transition-all ${isExpanded ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800'}`}
                    >
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${isExpanded ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                             {group.name.charAt(0)}
                          </div>
                          <div>
                             <h4 className="font-black text-sm sm:text-lg leading-none uppercase tracking-tighter">{group.name}</h4>
                             <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isExpanded ? 'text-white/70' : 'text-gray-400'}`}>Code: {group.code}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                             <p className={`text-[10px] font-black uppercase tracking-widest ${isExpanded ? 'text-white/60' : 'text-gray-400'}`}>Total Items</p>
                             <p className="text-xl font-black mt-1">{group.totalStock} PCS</p>
                          </div>
                          <svg className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                       </div>
                    </button>
                    
                    {isExpanded && (
                       <div className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-900/50 border-t-2 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                             {group.items.map(p => (
                                <div key={p.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-sm flex items-center justify-between group">
                                   <div>
                                      <div className="flex gap-2 mb-2">
                                         <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase rounded">{p.color}</span>
                                         <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase rounded">{p.size}</span>
                                      </div>
                                      <p className="text-[13px] font-black dark:text-white">{p.stockQuantity} <span className="text-[9px] text-gray-400">PCS</span></p>
                                      <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">Price: {user?.currency}{p.sellPrice}</p>
                                   </div>
                                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                      <button onClick={(e) => { e.stopPropagation(); handleRemove(p.id); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>
              );
           })}
        </div>
      </section>
    </div>
  );
};

export default ProductStock;
