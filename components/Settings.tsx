
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { CURRENCIES, THEME_COLORS } from '../constants';
import { Moderator, UIConfig } from '../types';

const Settings: React.FC = () => {
  const { user, setUser, role, moderatorName, t, syncUserProfile, resetApp, theme, language } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', 
    mobile: user?.mobile || '', 
    currency: user?.currency || '৳',
    password: user?.password || ''
  });

  const [uiConfig, setUiConfig] = useState<UIConfig>(user?.uiConfig || {
    headlineSize: 1.25,
    bodySize: 0.875,
    btnScale: 1
  });

  const [showPin, setShowPin] = useState(false);
  const [pinVerification, setPinVerification] = useState('');
  const [modForm, setModForm] = useState({ name: '', email: '', code: '' });
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'moderators' | 'appearance' | 'system'>('profile');

  useEffect(() => {
    if (user?.uiConfig) setUiConfig(user.uiConfig);
  }, [user?.uiConfig]);

  if (role === 'MODERATOR') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center border-4 border-rose-100 dark:border-rose-900 shadow-xl">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <div>
           <h2 className="text-2xl font-black uppercase tracking-widest dark:text-white">Moderator Access</h2>
           <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-widest">You have limited permissions in this view.</p>
        </div>
        <button 
          onClick={() => {
            const pin = prompt(language === 'EN' ? 'Enter Admin Secret PIN to switch:' : 'এডমিন মোডে ফিরতে সিক্রেট পিন দিন:');
            if (pin === user?.secretCode) {
              setUser(user, 'ADMIN');
            } else if (pin !== null) {
              alert(language === 'EN' ? 'Incorrect PIN!' : 'ভুল পিন কোড!');
            }
          }}
          className="px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-2xl uppercase tracking-[0.2em] text-[11px] border-b-8 border-black/20 hover:scale-105 active:scale-95 transition-all"
        >
          Switch to Admin
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const pin = prompt(language === 'EN' ? 'Enter Secret PIN to save profile:' : 'প্রোফাইল সেভ করতে সিক্রেট পিন দিন:');
    if (pin !== user.secretCode) return alert(language === 'EN' ? 'Invalid PIN!' : 'ভুল পিন!');
    
    const updatedUser = { ...user, ...profileData, uiConfig };
    await syncUserProfile(updatedUser);
    alert('Settings Updated Successfully!');
  };

  const handleUiChange = (key: keyof UIConfig, value: number) => {
    setUiConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleColorChange = async (color: string) => {
    if (!user) return;
    const updatedUser = { ...user, primaryColor: color };
    await syncUserProfile(updatedUser);
  };

  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newMod: Moderator = { id: 'MOD-' + Date.now(), ...modForm };
    const updatedUser = { ...user, moderators: [...(user.moderators || []), newMod] };
    await syncUserProfile(updatedUser);
    setModForm({ name: '', email: '', code: '' });
  };

  const handleRemoveMod = async (id: string) => {
    if (!user) return;
    const updatedUser = { ...user, moderators: user.moderators.filter(m => m.id !== id) };
    await syncUserProfile(updatedUser);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(user);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `MM_Backup_${user?.name}_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          if (importedData.id && importedData.name) {
             syncUserProfile(importedData);
             alert('Data Imported Successfully! Refreshing...');
             window.location.reload();
          }
        } catch (err) {
          alert('Invalid Backup File');
        }
      };
      reader.readAsText(file);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Shop Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'moderators', label: 'Moderators', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { id: 'system', label: 'System', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <aside className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex items-center px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-4 ${activeTab === item.id ? 'bg-primary text-white shadow-xl border-black/20' : 'bg-white dark:bg-gray-800 text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <svg className="w-5 h-5 mr-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} /></svg>
            {item.label}
          </button>
        ))}
      </aside>

      <div className="flex-1 space-y-6">
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
            <h3 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tighter">Shop Profile</h3>
            <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[40px] bg-gray-50 dark:bg-gray-900 border-4 border-primary/20 flex items-center justify-center overflow-hidden shadow-inner">
                   {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-primary/20">LOGO</span>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth={2.5}/></svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && user) {
                    if (file.size > 10 * 1024 * 1024) {
                       alert(language === 'EN' ? 'Maximum image size is 10MB' : 'সর্বোচ্চ ১০ এমবি পর্যন্ত ছবি আপলোড দিতে পারবেন');
                       return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const updatedUser = { ...user, profilePic: reader.result as string };
                      await syncUserProfile(updatedUser);
                    };
                    reader.readAsDataURL(file);
                  }
                }} accept="image/*" className="hidden" />
              </div>
              <div className="flex-1 space-y-4 w-full">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs" placeholder="Shop Name" />
                    <input type="text" value={profileData.mobile} onChange={e => setProfileData({...profileData, mobile: e.target.value})} className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs" placeholder="Mobile Number" />
                 </div>
                 <select value={profileData.currency} onChange={e => setProfileData({...profileData, currency: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-black text-xs">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                 </select>
                 
                 {/* UI Customization Sliders */}
                 <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-900 rounded-[30px] space-y-6">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Interface Scaling</p>
                    <div className="space-y-4">
                       <div>
                          <label className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-2">
                             <span>Headline Size</span>
                             <span>{uiConfig.headlineSize}rem</span>
                          </label>
                          <input type="range" min="1.25" max="2.5" step="0.05" value={uiConfig.headlineSize} onChange={e => handleUiChange('headlineSize', parseFloat(e.target.value))} className="w-full accent-primary" />
                       </div>
                       <div>
                          <label className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-2">
                             <span>Body Text Size</span>
                             <span>{uiConfig.bodySize}rem</span>
                          </label>
                          <input type="range" min="0.7" max="1.1" step="0.02" value={uiConfig.bodySize} onChange={e => handleUiChange('bodySize', parseFloat(e.target.value))} className="w-full accent-primary" />
                       </div>
                       <div>
                          <label className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-2">
                             <span>Button Scale</span>
                             <span>{uiConfig.btnScale}x</span>
                          </label>
                          <input type="range" min="0.8" max="1.2" step="0.05" value={uiConfig.btnScale} onChange={e => handleUiChange('btnScale', parseFloat(e.target.value))} className="w-full accent-primary" />
                       </div>
                    </div>
                 </div>

                 <button onClick={handleUpdateProfile} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px] border-b-4 border-black/20">{t('save')}</button>
              </div>
            </div>
            
            <div className="pt-10 border-t-2 dark:border-gray-700 text-center">
               <button 
                  onClick={() => {
                     if(confirm(language === 'EN' ? 'Switch to Moderator view?' : 'আপনি কি মডারেটর মোড চালু করতে চান?')) {
                        setUser(user, 'MODERATOR', 'Staff Member');
                     }
                  }}
                  className="px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-3xl shadow-xl uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all"
               >
                  Switch to Moderator
               </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
             <h3 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tighter">Security & Privacy</h3>
             <div className="space-y-6">
                <div className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40">
                   <p className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] mb-4">Secret Recovery PIN</p>
                   {!showPin ? (
                      <div className="flex gap-4">
                         <input type="password" value={pinVerification} onChange={e => setPinVerification(e.target.value)} className="flex-1 px-5 py-3 rounded-xl border-2 dark:bg-gray-900 outline-none font-black text-sm" placeholder="Enter Login Password" />
                         <button 
                            onClick={() => { if(pinVerification === user?.password) setShowPin(true); else alert('Wrong Password!'); }}
                            className="px-6 py-3 bg-rose-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest"
                         >
                            Reveal
                         </button>
                      </div>
                   ) : (
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border-2 border-rose-500 shadow-lg">
                         <span className="text-2xl font-black font-mono tracking-[0.5em] text-rose-600">{user?.secretCode}</span>
                         <button onClick={() => { setShowPin(false); setPinVerification(''); }} className="text-[10px] font-black text-gray-400 uppercase">Hide</button>
                      </div>
                   )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl space-y-4">
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Change Password</p>
                   <input type="password" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} className="w-full px-5 py-3 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm" placeholder="New Password" />
                   <button 
                    onClick={async (e) => {
                       const pin = prompt(language === 'EN' ? 'Enter Secret PIN to change password:' : 'পাসওয়ার্ড পরিবর্তন করতে সিক্রেট পিন দিন:');
                       if (pin === user?.secretCode) {
                          handleUpdateProfile(e as any);
                       } else {
                          alert(language === 'EN' ? 'Wrong PIN!' : 'ভুল পিন!');
                       }
                    }} 
                    className="px-8 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-black rounded-xl text-[10px] uppercase tracking-widest"
                   >
                      Update Password
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'moderators' && (
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
              <h3 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tighter">{t('moderatorSettings')}</h3>
              <form onSubmit={handleAddModerator} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                 <input type="text" value={modForm.name} onChange={e => setModForm({...modForm, name: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs" placeholder="Name" required />
                 <input type="email" value={modForm.email} onChange={e => setModForm({...modForm, email: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs" placeholder="Email" required />
                 <input type="text" value={modForm.code} onChange={e => setModForm({...modForm, code: e.target.value})} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs" placeholder="Access Code" required />
                 <button type="submit" className="md:col-span-3 py-4 bg-primary text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg">+ Add Moderator</button>
              </form>

              <div className="space-y-4">
                 {(user?.moderators || []).map(mod => (
                    <div key={mod.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border dark:border-gray-600">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">{mod.name.charAt(0)}</div>
                          <div>
                             <p className="font-black text-xs dark:text-white leading-none">{mod.name}</p>
                             <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{mod.email} • Code: {mod.code}</p>
                          </div>
                       </div>
                       <button onClick={() => handleRemoveMod(mod.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'appearance' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
             <h3 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tighter">Theme Appearance</h3>
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">Pick Your Brand Color</p>
             <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                {THEME_COLORS.map(c => (
                   <button 
                      key={c.color}
                      onClick={() => handleColorChange(c.color)}
                      className={`group relative w-full aspect-square rounded-[24px] shadow-lg transition-all active:scale-90 flex items-center justify-center border-4 ${user?.primaryColor === c.color ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: c.color }}
                   >
                      {user?.primaryColor === c.color && <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>}
                      <span className="absolute -bottom-6 left-0 right-0 text-[7px] font-black uppercase tracking-tighter text-center opacity-0 group-hover:opacity-100">{c.name}</span>
                   </button>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
             <h3 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tighter">System & Data</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                   <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-4">Export Backup</p>
                   <button onClick={handleExport} className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest border-b-4 border-emerald-800">Download Data</button>
                </div>
                <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                   <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-4">Import Data</p>
                   <label className="block w-full py-3 bg-blue-600 text-white text-center font-black rounded-xl text-[10px] uppercase tracking-widest border-b-4 border-blue-800 cursor-pointer">
                      Upload File
                      <input type="file" onChange={handleImport} accept=".json" className="hidden" />
                   </label>
                </div>
             </div>

             <div className="mt-8 p-8 bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-100 dark:border-rose-900/30 text-center">
                <h4 className="text-lg font-black text-rose-700 mb-2">Danger Zone</h4>
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-6 leading-relaxed">System Reset will delete all records and account data permanently. Proceed with absolute caution.</p>
                <button 
                  onClick={async () => {
                    const pin = prompt('Enter Secret PIN to confirm full system reset:');
                    if (pin === user?.secretCode) {
                      await resetApp(pin);
                      alert('System Resetted Successfully');
                      window.location.reload();
                    } else if (pin !== null) {
                      alert('Invalid PIN!');
                    }
                  }} 
                  className="px-10 py-4 bg-rose-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-rose-700 transition-all active:scale-95"
                >
                  Full System Reset
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
