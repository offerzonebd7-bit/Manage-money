
import React, { useState } from 'react';
import { useApp } from '../App';
import { Product } from '../types';

const ProductStock: React.FC = () => {
  const { user, setUser, role, moderatorName, t, language } = useApp();
  const [formData, setFormData] = useState({ name: '', code: '', buyPrice: '', sellPrice: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
    
    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const userIdx = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIdx !== -1) {
      allUsers[userIdx] = updatedUser;
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    }
    setFormData({ name: '', code: '', buyPrice: '', sellPrice: '' });
  };

  const handleRemove = (id: string) => {
    if (role === 'MODERATOR') return alert(t('insufficientPermissions'));
    if (!user || !confirm(language === 'EN' ? 'Delete this product?' : 'পণ্যটি ডিলিট করতে চান?')) return;
    const updatedUser = { ...user, products: user.products.filter(p => p.id !== id) };
    setUser(updatedUser, role, moderatorName);
    
    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const userIdx = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIdx !== -1) {
      allUsers[userIdx] = updatedUser;
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    }
  };

  const filtered = user?.products?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <input type="text" placeholder={t('productName')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="text" placeholder={t('productCode')} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="number" placeholder={t('buyPrice')} value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="number" placeholder={t('sellPrice')} value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px]">+ Add Product</button>
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
                 <tr key={p.id} className="text-xs font-bold dark:text-gray-200">
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4 text-gray-400">{p.code}</td>
                    <td className="px-6 py-4 text-rose-500">{p.buyPrice}</td>
                    <td className="px-6 py-4 text-emerald-500 font-black">{p.sellPrice}</td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleRemove(p.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">Delete</button>
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
