
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { BRAND_INFO, CURRENCIES, THEME_COLORS } from '../constants';
import { Moderator, ThemeMode } from '../types';

const Settings: React.FC = () => {
  const { user, setUser, role, moderatorName, t, language, setLanguage, themeMode, setThemeMode, resetApp } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    currency: user?.currency || '৳',
  });

  const [newMod, setNewMod] = useState({ name: '', email: '', code: '' });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [verifySecret, setVerifySecret] = useState('');
  const [showVerifySecret, setShowVerifySecret] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [resetCode, setResetCode] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    setTimeout(() => {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser, role, moderatorName);
      
      const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
      const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        allUsers[userIndex] = updatedUser;
        localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
      }

      setIsUpdating(false);
      alert(t('save') + ' Successful!');
    }, 500);
  };

  const handleExport = () => {
    if (!user) return;
    const transactions = localStorage.getItem(`mm_tx_${user.id}`);
    const data = {
      user,
      transactions: transactions ? JSON.parse(transactions) : [],
      allUsers: JSON.parse(localStorage.getItem('mm_all_users') || '[]')
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShopBackup_${user.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.user && data.allUsers) {
          localStorage.setItem('mm_all_users', JSON.stringify(data.allUsers));
          localStorage.setItem(`mm_tx_${data.user.id}`, JSON.stringify(data.transactions));
          localStorage.setItem('mm_active_user', JSON.stringify(data.user));
          alert(language === 'EN' ? 'Data Restored Successfully! Please refresh.' : 'ডাটা সফলভাবে রিস্টোর হয়েছে! অ্যাপটি রিফ্রেশ করুন।');
          window.location.reload();
        }
      } catch {
        alert('Invalid backup file!');
      }
    };
    reader.readAsText(file);
  };

  const handleAddModerator = () => {
    if (!user || !newMod.name || !newMod.email || !newMod.code) {
      alert(language === 'EN' ? 'Please fill all fields' : 'সবগুলো ঘর পূরণ করুন');
      return;
    }
    
    const moderator: Moderator = {
      id: 'M-' + Date.now(),
      name: newMod.name,
      email: newMod.email,
      code: newMod.code
    };

    const updatedModerators = [...(user.moderators || []), moderator];
    const updatedUser = { ...user, moderators: updatedModerators };
    setUser(updatedUser, role, moderatorName);

    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    }

    setNewMod({ name: '', email: '', code: '' });
    alert(language === 'EN' ? 'Moderator Added!' : 'মডারেটর যুক্ত করা হয়েছে!');
  };

  const handleRemoveModerator = (id: string) => {
    if (!user) return;
    if (!confirm(language === 'EN' ? 'Remove this moderator?' : 'আপনি কি মডারেটরটি ডিলিট করতে চান?')) return;

    const updatedModerators = user.moderators.filter(m => m.id !== id);
    const updatedUser = { ...user, moderators: updatedModerators };
    setUser(updatedUser, role, moderatorName);

    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    }
  };

  const handleSetPrimaryColor = (color: string) => {
    if (!user) return;
    const updatedUser = { ...user, primaryColor: color };
    setUser(updatedUser, role, moderatorName);
    
    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    }
  };

  const handleShowPassword = () => {
    if (verifySecret === user?.secretCode) {
      setIsPasswordVisible(true);
      setVerifySecret('');
    } else {
      alert(language === 'EN' ? 'Invalid Secret Code!' : 'ভুল সিক্রেট কোড!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* Reset Security Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in zoom-in duration-300">
           <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl overflow-hidden border-4 border-rose-500/10">
              <div className="p-8 bg-rose-600 text-white flex justify-between items-center">
                 <h2 className="text-xl font-black uppercase tracking-tighter">{t('resetSecurityTitle')}</h2>
                 <button onClick={() => setShowResetModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="p-8 space-y-6">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('enterAdminSecret')}</p>
                 <input 
                    type="password" 
                    value={resetCode} 
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-black text-2xl tracking-[0.4em] text-center"
                    placeholder="••••"
                 />
                 <div className="flex gap-4">
                    <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-black rounded-xl uppercase tracking-widest text-[9px]">{t('cancel')}</button>
                    <button onClick={() => { if(resetApp(resetCode)) setShowResetModal(false); }} className="flex-1 py-4 bg-rose-600 text-white font-black rounded-xl uppercase tracking-widest text-[9px] shadow-lg shadow-rose-600/30">Confirm Reset</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Theme Mode & Color Section */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
           <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
           {t('theme')} & {t('language')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('themeMode')}</label>
              <div className="flex p-1 bg-gray-50 dark:bg-gray-900 rounded-2xl border dark:border-gray-700">
                 {(['light', 'dark', 'system'] as ThemeMode[]).map(m => (
                    <button key={m} onClick={() => setThemeMode(m)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${themeMode === m ? 'bg-primary text-white shadow-lg' : 'text-gray-400'}`}>
                       {t(m)}
                    </button>
                 ))}
              </div>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('themeColor')}</label>
              <div className="flex flex-wrap gap-2.5">
                {THEME_COLORS.map(tc => (
                   <button key={tc.color} type="button" onClick={() => handleSetPrimaryColor(tc.color)} className={`w-9 h-9 rounded-xl border-4 transition-all hover:scale-110 ${user?.primaryColor === tc.color ? 'border-white dark:border-gray-800 shadow-lg scale-110' : 'border-transparent'}`} style={{ backgroundColor: tc.color }} />
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* Backup & Restore */}
      {role === 'ADMIN' && (
        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
          <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
             <svg className="w-6 h-6 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
             {t('backupRestore')}
          </h3>
          <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">Move your data between Web and APK using these buttons.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button onClick={handleExport} className="flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-[10px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {t('exportData')}
             </button>
             <label className="flex items-center justify-center gap-3 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-[10px] cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                {t('importData')}
                <input type="file" className="hidden" accept=".json" onChange={handleImport} />
             </label>
          </div>
        </section>
      )}

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-black border-2 border-white dark:border-gray-800 shadow-xl overflow-hidden">
              {user?.profilePic && role === 'ADMIN' ? <img src={user.profilePic} className="w-full h-full object-cover" /> : (role === 'MODERATOR' ? moderatorName.charAt(0).toUpperCase() : user?.name.charAt(0).toUpperCase())}
            </div>
            {role === 'ADMIN' && (
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3.5 bg-primary text-white rounded-2xl shadow-xl border-2 border-white dark:border-gray-800 hover:scale-110 active:scale-90 transition-all z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && user) {
                const reader = new FileReader();
                reader.onloadend = () => setUser({ ...user, profilePic: reader.result as string }, role, moderatorName);
                reader.readAsDataURL(file);
              }
            }} className="hidden" accept="image/*" />
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter flex items-center">
               <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
               {role === 'MODERATOR' ? `${t('moderator')}: ${moderatorName}` : t('profile')}
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{language === 'EN' ? 'Name' : 'নাম'}</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} disabled={role === 'MODERATOR'} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none font-bold text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('currency')}</label>
                  <select value={profileData.currency} onChange={(e) => setProfileData({...profileData, currency: e.target.value})} disabled={role === 'MODERATOR'} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none font-black text-xs">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
              </div>

              {/* Multi-Moderator Section */}
              {role === 'ADMIN' && (
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border-2 border-blue-100 dark:border-blue-800/50 space-y-6">
                   <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{t('moderatorSettings')}</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="text" value={newMod.name} onChange={(e) => setNewMod({...newMod, name: e.target.value})} placeholder="Name" className="px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-xs outline-none" />
                      <input type="email" value={newMod.email} onChange={(e) => setNewMod({...newMod, email: e.target.value})} placeholder="Email" className="px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-xs outline-none" />
                      <input type="text" value={newMod.code} onChange={(e) => setNewMod({...newMod, code: e.target.value})} placeholder="Code" className="px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-xs outline-none" />
                   </div>
                   <button type="button" onClick={handleAddModerator} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[9px] uppercase tracking-widest">Add Moderator</button>
                   <div className="space-y-2 mt-4">
                      {user?.moderators?.map(mod => (
                         <div key={mod.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-blue-900/50">
                            <span className="text-xs font-black dark:text-white">{mod.name} ({mod.email})</span>
                            <button type="button" onClick={() => handleRemoveModerator(mod.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              <button type="submit" disabled={role === 'MODERATOR'} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50">
                {isUpdating ? '...' : t('save')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Official Support */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700 text-center">
        <h3 className="text-lg font-black mb-6 dark:text-white uppercase tracking-tighter">Graphico Global Support</h3>
        <div className="flex justify-center flex-wrap gap-6 mb-4">
           <a href={BRAND_INFO.website} target="_blank" className="p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl text-blue-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></a>
           <a href={BRAND_INFO.whatsapp} target="_blank" className="p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl text-emerald-500"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-4">Developed by {BRAND_INFO.developer}</p>
      </section>

      {/* Recovery Section */}
      {role === 'ADMIN' && (
        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
            <svg className="w-5 h-5 mr-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            {t('accountRecovery')}
          </h3>
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-6 border dark:border-gray-700">
            {!isPasswordVisible ? (
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-1 relative">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('enterSecret')}</label>
                  <input type={showVerifySecret ? "text" : "password"} value={verifySecret} onChange={(e) => setVerifySecret(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-xl outline-none font-bold text-lg tracking-[0.2em] pr-12" placeholder="••••" />
                  <button type="button" onClick={() => setShowVerifySecret(!showVerifySecret)} className="absolute right-4 top-[38px] text-gray-400">{showVerifySecret ? "H" : "V"}</button>
                </div>
                <button onClick={handleShowPassword} className="h-12 px-8 bg-rose-600 text-white font-black rounded-xl uppercase tracking-widest text-[9px]">{t('verify')}</button>
              </div>
            ) : (
              <div className="p-6 bg-primary rounded-2xl flex justify-between items-center text-white">
                <div>
                  <p className="text-[8px] font-black opacity-60 uppercase">{t('password')}</p>
                  <p className="text-3xl font-black">{user?.password}</p>
                </div>
                <button onClick={() => setIsPasswordVisible(false)} className="px-5 py-2 bg-white/20 rounded-lg text-[9px] font-black">HIDE</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Danger Section */}
      {role === 'ADMIN' && (
        <section className="bg-rose-50 dark:bg-rose-950 p-8 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 uppercase leading-none">{t('resetApp')}</h3>
            <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">Wipes all your transaction data.</p>
          </div>
          <button onClick={() => setShowResetModal(true)} className="px-10 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[9px]">Reset System</button>
        </section>
      )}
    </div>
  );
};

export default Settings;
