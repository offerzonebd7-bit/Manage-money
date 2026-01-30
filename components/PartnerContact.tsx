
import React, { useState } from 'react';
import { useApp } from '../App';
import { Partner } from '../types';

const PartnerContact: React.FC = () => {
  const { user, setUser, role, moderatorName, t, language } = useApp();
  const [formData, setFormData] = useState({ name: '', mobile: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newPartner: Partner = {
      id: 'PAR-' + Date.now(),
      name: formData.name,
      mobile: formData.mobile,
      description: formData.description
    };
    const updatedUser = { ...user, partners: [...(user.partners || []), newPartner] };
    setUser(updatedUser, role, moderatorName);
    
    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const userIdx = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIdx !== -1) {
      allUsers[userIdx] = updatedUser;
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    }
    setFormData({ name: '', mobile: '', description: '' });
  };

  const handleRemove = (id: string) => {
    if (role === 'MODERATOR') return alert(t('insufficientPermissions'));
    if (!user || !confirm(language === 'EN' ? 'Delete this partner?' : 'পার্টনার ডিলিট করতে চান?')) return;
    const updatedUser = { ...user, partners: user.partners.filter(p => p.id !== id) };
    setUser(updatedUser, role, moderatorName);
    
    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const userIdx = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIdx !== -1) {
      allUsers[userIdx] = updatedUser;
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    }
  };

  const filtered = user?.partners?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mobile.includes(searchTerm)) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <input type="text" placeholder={t('partnerName')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="text" placeholder={t('partnerMobile')} value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="text" placeholder={t('partnerDesc')} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" />
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px]">+ Add Partner</button>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filtered.map(p => (
           <div key={p.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 group transition-all hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">{p.name.charAt(0)}</div>
                 <div>
                    <h4 className="font-black dark:text-white leading-none">{p.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">{p.mobile}</p>
                 </div>
              </div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 italic mb-4">{p.description || "No description"}</p>
              <div className="flex gap-2">
                 <a href={`tel:${p.mobile}`} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-center text-[9px] font-black uppercase tracking-widest">Call</a>
                 <button onClick={() => handleRemove(p.id)} className="px-4 py-2 bg-rose-100 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest">Delete</button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default PartnerContact;
