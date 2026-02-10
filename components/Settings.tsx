
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { CURRENCIES, THEME_COLORS } from '../constants';
import { Moderator, UIConfig } from '../types';

const Settings: React.FC = () => {
  const { user, setUser, role, moderatorName, t, syncUserProfile, resetApp, language } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', mobile: user?.mobile || '', email: user?.email || '',
    currency: user?.currency || '৳', slogan: user?.slogan || '', description: user?.description || ''
  });

  const [uiConfig, setUiConfig] = useState<UIConfig>(user?.uiConfig || { headlineSize: 1.25, bodySize: 0.875, btnScale: 1 });
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'moderators' | 'appearance' | 'system'>('profile');
  const [modForm, setModForm] = useState({ name: '', email: '', code: '' });
  const [revealedPass, setRevealedPass] = useState<string | null>(null);

  useEffect(() => { if (user?.uiConfig) setUiConfig(user.uiConfig); }, [user?.uiConfig]);

  if (role === 'MODERATOR') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center border-4 border-rose-100 dark:border-rose-900 shadow-xl">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-widest dark:text-white">Moderator Access Restricted</h2>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const pin = prompt(t('enterSecret'));
    if (pin !== user.secretCode) return alert('Invalid PIN!');
    const updatedUser = { ...user, ...profileData, uiConfig };
    await syncUserProfile(updatedUser);
    alert('Profile Saved!');
  };

  const handleShowPassword = () => {
    const pin = prompt(t('enterSecret'));
    if (pin === user?.secretCode) setRevealedPass(user?.password || '');
    else alert('Incorrect PIN');
  };

  const handleChangePassword = () => {
    const pin = prompt(t('enterSecret'));
    if (pin === user?.secretCode) {
      const newPass = prompt('Enter New Password:');
      if (newPass && user) {
        syncUserProfile({ ...user, password: newPass });
        alert('Password Changed!');
      }
    } else alert('Incorrect PIN');
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.user && json.txs) {
          localStorage.setItem('mm_current_user', JSON.stringify(json.user));
          localStorage.setItem(`mm_txs_${json.user.id}`, json.txs);
          alert('Import Success! Reloading...');
          window.location.reload();
        }
      } catch (err) { alert('Import Failed!'); }
    };
    reader.readAsText(file);
  };

  const inputClass = "px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs focus:border-primary transition-all";

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <aside className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
        {[
          { id: 'profile', label: 'Shop Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
          { id: 'moderators', label: 'Moderators', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
          { id: 'system', label: 'System', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-xl' : 'bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            <svg className="w-5 h-5 mr-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} /></svg>
            {item.label}
          </button>
        ))}
      </aside>

      <div className="flex-1 space-y-6">
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-[40px] bg-gray-50 dark:bg-gray-900 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                   {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-primary/20">LOGO</span>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth={2.5}/></svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && user) {
                    const reader = new FileReader();
                    reader.onloadend = async () => syncUserProfile({ ...user, profilePic: reader.result as string });
                    reader.readAsDataURL(file);
                  }
                }} className="hidden" accept="image/*" />
              </div>
              <div className="flex-1 space-y-4 w-full">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className={inputClass} placeholder="Shop Name" />
                    <input type="text" value={profileData.mobile} onChange={e => setProfileData({...profileData, mobile: e.target.value})} className={inputClass} placeholder="Mobile" />
                 </div>
                 <input type="text" value={profileData.slogan} onChange={e => setProfileData({...profileData, slogan: e.target.value})} className={`${inputClass} w-full`} placeholder="Shop Slogan" />
                 <button onClick={handleUpdateProfile} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px] border-b-4 border-black/20">{t('save')}</button>
              </div>
            </div>
            
            <div className="mt-10 pt-10 border-t-2 dark:border-gray-700">
               <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[12px] font-black uppercase text-amber-500 tracking-[0.2em]">Switch To Moderator Mode</h4>
                  <div className="w-10 h-1 bg-amber-500/20 rounded-full"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user?.moderators?.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => setUser(user, 'MODERATOR', m.name)} 
                      className="group flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-950/50 rounded-[30px] border-2 border-transparent hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/10 transition-all active:scale-95 overflow-hidden relative"
                    >
                       <div className="flex items-center">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 mr-5">
                             {m.profilePic ? <img src={m.profilePic} className="w-full h-full object-cover" /> : m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                             <p className="font-black text-sm dark:text-white uppercase tracking-tighter leading-none">{m.name}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">Activate Session</p>
                          </div>
                       </div>
                       <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                       </div>
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
             <h3 className="text-xl font-black mb-10 dark:text-white uppercase tracking-tighter">Security & Passwords</h3>
             <div className="space-y-6">
                <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[30px] border-2 dark:border-gray-700 flex flex-col items-center gap-6">
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('showPassword')}</p>
                   {revealedPass ? (
                      <div className="text-3xl font-black text-primary tracking-tighter bg-white dark:bg-gray-800 px-10 py-6 rounded-3xl border-2 border-primary/20 shadow-xl">{revealedPass}</div>
                   ) : (
                      <button onClick={handleShowPassword} className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">{t('verify')}</button>
                   )}
                </div>
                <button onClick={handleChangePassword} className="w-full py-4 bg-gray-800 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">{t('resetPassword')}</button>
             </div>
          </div>
        )}

        {activeTab === 'moderators' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
             <h3 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tighter">Moderator Access</h3>
             <form onSubmit={async (e) => {
                e.preventDefault();
                if (!user) return;
                const updatedUser = { ...user, moderators: [...(user.moderators || []), { id: 'MOD-' + Date.now(), ...modForm }] };
                await syncUserProfile(updatedUser);
                setModForm({ name: '', email: '', code: '' });
             }} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                <input type="text" placeholder="Name" value={modForm.name} onChange={e => setModForm({...modForm, name: e.target.value})} className={inputClass} required />
                <input type="email" placeholder="Email" value={modForm.email} onChange={e => setModForm({...modForm, email: e.target.value})} className={inputClass} required />
                <input type="text" placeholder="PIN" value={modForm.code} onChange={e => setModForm({...modForm, code: e.target.value})} className={inputClass} required />
                <button type="submit" className="py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">+ Add</button>
             </form>
             <div className="space-y-4">
                {user?.moderators?.map(m => (
                   <div key={m.id} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 dark:border-gray-700">
                      <div><p className="font-black text-xs dark:text-white uppercase">{m.name}</p><p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">{m.email} • Code: {m.code}</p></div>
                      <button onClick={async () => {
                         if (confirm('Remove this moderator?')) syncUserProfile({ ...user!, moderators: user!.moderators.filter(x => x.id !== m.id) });
                      }} className="p-3 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
             <h3 className="text-xl font-black mb-10 dark:text-white uppercase tracking-tighter">UI Customization</h3>
             <div className="space-y-8">
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                   {THEME_COLORS.map(c => (
                      <button 
                        key={c.color} 
                        onClick={() => syncUserProfile({...user!, primaryColor: c.color})} 
                        className={`w-full aspect-square rounded-2xl border-4 transition-all ${user?.primaryColor === c.color ? 'border-primary shadow-2xl scale-110 rotate-3 z-10' : 'border-transparent hover:scale-110 hover:shadow-xl'}`} 
                        style={{ backgroundColor: c.color }} 
                        title={c.name}
                      />
                   ))}
                </div>
                <div className="space-y-6 p-8 bg-gray-50 dark:bg-gray-900 rounded-[35px]">
                   {[
                      { key: 'headlineSize', label: 'Headline Size', min: 1.0, max: 3.0, step: 0.05 },
                      { key: 'bodySize', label: 'Body Text Size', min: 0.7, max: 1.5, step: 0.02 },
                      { key: 'btnScale', label: 'Button Scaling', min: 0.5, max: 1.5, step: 0.05 }
                   ].map(s => (
                      <div key={s.key}>
                        <label className="flex justify-between text-[9px] font-black text-gray-400 uppercase mb-2"><span>{s.label}</span><span>{(uiConfig as any)[s.key]}</span></label>
                        <input type="range" min={s.min} max={s.max} step={s.step} value={(uiConfig as any)[s.key]} onChange={e => {
                           const val = parseFloat(e.target.value);
                           setUiConfig({...uiConfig, [s.key]: val});
                        }} className="w-full accent-primary" />
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
             <h3 className="text-xl font-black mb-10 dark:text-white uppercase tracking-tighter">System & Data</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-rose-50 dark:bg-rose-950/20 rounded-[30px] border-2 border-rose-100 dark:border-rose-900/30">
                   <h4 className="font-black text-rose-600 uppercase text-xs mb-4">Reset System</h4>
                   <button onClick={() => {
                      const pin = prompt(t('enterAdminSecret'));
                      if (pin === user?.secretCode && confirm('DELETE ALL DATA?')) resetApp(pin);
                   }} className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">{t('resetApp')}</button>
                </div>
                <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[30px] border-2 dark:border-gray-700">
                   <h4 className="font-black dark:text-white uppercase text-xs mb-4">Backup Operations</h4>
                   <div className="flex gap-4">
                      <button onClick={() => {
                          const data = { user, txs: localStorage.getItem(`mm_txs_${user?.id}`) };
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
                          a.download = `khurasan_backup_${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                      }} className="flex-1 py-4 bg-gray-800 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">{t('exportData')}</button>
                      <button onClick={() => importInputRef.current?.click()} className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">{t('importData')}</button>
                      <input type="file" ref={importInputRef} onChange={handleImportData} className="hidden" accept="application/json" />
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
