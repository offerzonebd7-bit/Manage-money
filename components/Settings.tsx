
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { CURRENCIES } from '../constants';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
  const { user, setUser, role, moderatorName, t, syncUserProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', mobile: user?.mobile || '', currency: user?.currency || '৳' });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const updatedUser = { ...user, profilePic: reader.result as string };
        setUser(updatedUser, role, moderatorName);
        await syncUserProfile(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setIsUpdating(false);
    alert('Settings Saved!');
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter">Shop Settings</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
           <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-gray-100 dark:bg-gray-900 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                 {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-gray-300">LOGO</span>}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-xl shadow-lg">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth={2}/></svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} accept="image/*" className="hidden" />
           </div>
           <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4">
              <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl outline-none font-bold" placeholder="Shop Name" />
              <input type="text" value={profileData.mobile} onChange={(e) => setProfileData({...profileData, mobile: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl outline-none font-bold" placeholder="Mobile Number" />
              <select value={profileData.currency} onChange={(e) => setProfileData({...profileData, currency: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl outline-none font-black">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
              </select>
              <button type="submit" disabled={isUpdating} className="w-full py-4 bg-primary text-white font-black rounded-lg shadow-lg uppercase tracking-widest text-[10px] disabled:opacity-50">{isUpdating ? 'Saving...' : t('save')}</button>
           </form>
        </div>
      </section>
      <div className="text-center"><button onClick={handleLogout} className="px-10 py-3 bg-rose-50 text-rose-500 font-black rounded-xl uppercase tracking-widest text-[9px]">Logout Account</button></div>
    </div>
  );
};
export default Settings;
