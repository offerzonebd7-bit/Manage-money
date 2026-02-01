
import React, { useState } from 'react';
import { useApp } from '../App';
import { Product } from '../types';

const ProductStock: React.FC = () => {
  const { user, setUser, role, moderatorName, t, language, syncUserProfile } = useApp();
  const [formData, setFormData] = useState({ name: '', code: '', buyPrice: '', sellPrice: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSyncing(true);
    const newProduct: Product = {
      id: 'P-' + Date.now(),
      name: formData.name,
      code: formData.code,
      buyPrice: parseFloat(formData.buyPrice) || 0,
      sellPrice: parseFloat(formData.sellPrice) || 0,
      addedAt: new Date().toISOString()
    };
    const updatedUser = { ...user, products: [...(user.products || []), newProduct] };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setFormData({ name: '', code: '', buyPrice: '', sellPrice: '' });
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
    if (!user || !confirm(language === 'EN' ? 'Delete this product?' : 'পণ্যটি ডিলিট করতে চান?')) return;
    setIsSyncing(true);
    const updatedUser = { ...user, products: (user.products || []).filter(p => p.id !== id) };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setIsSyncing(false);
  };

  const filtered = user?.products?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {editingProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[30px] shadow-2xl overflow-hidden border-4 border-primary/10">
            <div className="p-8 bg-primary text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-4">
              <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" placeholder={t('productName')} required />
              <input type="text" value={editingProduct.code} onChange={e => setEditingProduct({...editingProduct, code: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" placeholder={t('productCode')} required />
              <input type="number" value={editingProduct.buyPrice} onChange={e => setEditingProduct({...editingProduct, buyPrice: parseFloat(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" placeholder={t('buyPrice')} required />
              <input type="number" value={editingProduct.sellPrice} onChange={e => setEditingProduct({...editingProduct, sellPrice: parseFloat(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" placeholder={t('sellPrice')} required />
              <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px] border-b-4 border-black/20">{t('save')}</button>
            </form>
          </div>
        </div>
      )}

      <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <input type="text" placeholder={t('productName')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="text" placeholder={t('productCode')} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="number" placeholder={t('buyPrice')} value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="number" placeholder={t('sellPrice')} value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
          </div>
          <button type="submit" disabled={isSyncing} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px] border-b-4 border-black/20 disabled:opacity-50">
            {isSyncing ? 'Syncing...' : '+ Add Product'}
          </button>
        </form>
      </section>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700">
        <input type="text" placeholder={t('search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full mb-6 px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 text-[9px] font-black text-gray-400 uppercase tracking-widest">
               <tr><th className="px-6 py-4">{t('productName')}</th><th className="px-6 py-4">Code</th><th className="px-6 py-4">Buy</th><th className="px-6 py-4">Sell</th><th className="px-6 py-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
               {filtered.map(p => (
                 <tr key={p.id} className="text-xs font-bold dark:text-gray-200 group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4 text-gray-400">{p.code}</td>
                    <td className="px-6 py-4 text-rose-500">{p.buyPrice}</td>
                    <td className="px-6 py-4 text-emerald-500 font-black">{p.sellPrice}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingProduct(p)} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => handleRemove(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductStock;
