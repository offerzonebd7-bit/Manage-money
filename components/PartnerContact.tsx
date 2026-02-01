
import React, { useState } from 'react';
import { useApp } from '../App';
import { Partner } from '../types';

const PartnerContact: React.FC = () => {
  const { user, setUser, role, moderatorName, t, language, syncUserProfile } = useApp();
  const [formData, setFormData] = useState({ name: '', mobile: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSyncing(true);
    const newPartner: Partner = {
      id: 'PAR-' + Date.now(),
      name: formData.name,
      mobile: formData.mobile,
      description: formData.description
    };
    const updatedUser = { ...user, partners: [...(user.partners || []), newPartner] };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setFormData({ name: '', mobile: '', description: '' });
    setIsSyncing(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingPartner) return;
    setIsSyncing(true);
    const updatedPartners = (user.partners || []).map(p => p.id === editingPartner.id ? editingPartner : p);
    const updatedUser = { ...user, partners: updatedPartners };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setEditingPartner(null);
    setIsSyncing(false);
  };

  const handleRemove = async (id: string) => {
    if (role === 'MODERATOR') return alert(t('insufficientPermissions'));
    if (!user || !confirm(language === 'EN' ? 'Delete this partner?' : 'পার্টনার ডিলিট করতে চান?')) return;
    setIsSyncing(true);
    const updatedUser = { ...user, partners: (user.partners || []).filter(p => p.id !== id) };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setIsSyncing(false);
  };

  const filtered = user?.partners?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mobile.includes(searchTerm)) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {editingPartner && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[30px] shadow-2xl overflow-hidden border-4 border-primary/10">
            <div className="p-8 bg-primary text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">Edit Partner</h2>
              <button onClick={() => setEditingPartner(null)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-4">
              <input type="text" value={editingPartner.name} onChange={e => setEditingPartner({...editingPartner, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" placeholder={t('partnerName')} required />
              <input type="text" value={editingPartner.mobile} onChange={e => setEditingPartner({...editingPartner, mobile: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" placeholder={t('partnerMobile')} required />
              <input type="text" value={editingPartner.description} onChange={e => setEditingPartner({...editingPartner, description: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" placeholder={t('partnerDesc')} />
              <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px] border-b-4 border-black/20">{t('save')}</button>
            </form>
          </div>
        </div>
      )}

      <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <input type="text" placeholder={t('partnerName')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="text" placeholder={t('partnerMobile')} value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" required />
             <input type="text" placeholder={t('partnerDesc')} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" />
          </div>
          <button type="submit" disabled={isSyncing} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px] border-b-4 border-black/20 disabled:opacity-50">
            {isSyncing ? 'Syncing...' : '+ Add Partner'}
          </button>
        </form>
      </section>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700 mb-6">
        <input type="text" placeholder={t('search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filtered.map(p => (
           <div key={p.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 group transition-all hover:scale-105 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">{p.name.charAt(0)}</div>
                 <div>
                    <h4 className="font-black dark:text-white leading-none">{p.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">{p.mobile}</p>
                 </div>
              </div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 italic mb-4">{p.description || "No description"}</p>
              <div className="flex gap-2">
                 <a href={`tel:${p.mobile}`} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-center text-[9px] font-black uppercase tracking-widest border-b-4 border-emerald-700">Call</a>
                 <button onClick={() => setEditingPartner(p)} className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border-b-4 border-blue-700">Edit</button>
                 <button onClick={() => handleRemove(p.id)} className="px-4 py-2.5 bg-rose-100 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest">Delete</button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default PartnerContact;
