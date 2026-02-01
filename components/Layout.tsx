
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { BRAND_INFO } from '../constants';
import { UserProfile } from '../types';
import Calculator from './Calculator';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setView, view, t, theme, themeMode, setThemeMode, setLanguage, language, user, setUser, role, moderatorName } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    setAllUsers(users);
  }, [isSwitchModalOpen]);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'sale', label: t('productSale'), icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'transactions', label: t('transactions'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'products', label: t('productStock'), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'partners', label: t('partners'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'reports', label: t('reports'), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'settings', label: t('settings'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  const displayName = role === 'MODERATOR' ? moderatorName : user?.name;
  
  // Find moderator profile pic if role is MODERATOR
  const currentProfilePic = role === 'MODERATOR' 
    ? user?.moderators?.find(m => m.name === moderatorName)?.profilePic || ''
    : user?.profilePic || '';

  const contactIcons = [
    { id: 'web', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', url: BRAND_INFO.website, color: '#4169E1' },
    { id: 'mail', icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', url: BRAND_INFO.email, color: '#D44638' },
    { id: 'wa', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z', url: BRAND_INFO.whatsapp, color: '#25D366' },
    { id: 'tg', icon: 'M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 8.146l-1.988 9.33c-.149.659-.54 1.222-1.087 1.564-.547.342-1.221.432-1.84.249l-3.033-1.011-1.464 1.412c-.172.166-.403.259-.644.259-.126 0-.253-.025-.373-.075-.366-.153-.611-.513-.611-.912v-2.111l6.736-6.426c.205-.195.101-.303-.131-.157l-8.324 5.244-3.213-1.07c-.705-.235-.718-1.002.023-1.303l12.42-5.175c.668-.278 1.341.117 1.13 1.17z', url: BRAND_INFO.telegram, color: '#0088cc' },
    { id: 'fb', icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z', url: BRAND_INFO.facebook, color: '#1877F2' },
  ];

  return (
    <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Calculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      {/* Switch Account Modal */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[30px] shadow-2xl overflow-hidden border-4 border-primary/10">
              <div className="p-8 bg-primary text-white flex justify-between items-center">
                 <h2 className="text-xl font-black uppercase tracking-tighter">{t('switchAccount')}</h2>
                 <button onClick={() => setIsSwitchModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                 {allUsers.map(u => (
                    <button 
                       key={u.id}
                       onClick={() => { setUser(u, 'ADMIN'); setIsSwitchModalOpen(false); }}
                       className={`flex items-center w-full p-4 rounded-xl border-2 transition-all group ${user?.id === u.id && role === 'ADMIN' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-700 hover:border-primary/50'}`}
                    >
                       <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white text-xl font-black mr-4 shadow-md overflow-hidden shrink-0">
                          {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                       </div>
                       <div className="text-left flex-1 overflow-hidden">
                          <p className="font-black text-sm truncate dark:text-white">{u.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{u.email}</p>
                       </div>
                    </button>
                 ))}
                 
                 <button 
                    onClick={() => { setUser(null, 'ADMIN'); setIsSwitchModalOpen(false); }}
                    className="flex items-center justify-center w-full p-5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                 >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    {t('signup')} / Add New Shop
                 </button>
              </div>
           </div>
        </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform bg-white dark:bg-gray-900 border-r dark:border-gray-800 md:translate-x-0 md:static md:inset-0 print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-800">
          <span className="text-2xl font-black text-primary tracking-tighter italic">ManageMoney</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="mt-6 px-4 space-y-2 overflow-y-auto h-[calc(100vh-280px)]">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setView(item.id); setIsSidebarOpen(false); }} 
              className={`flex items-center w-full px-5 py-3.5 text-xs font-black transition-all rounded-xl ${view === item.id ? 'bg-primary text-white shadow-xl' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} /></svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex justify-center gap-2 mb-4 no-print flex-wrap">
             {contactIcons.map(item => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:scale-110 transition-all border dark:border-gray-700" style={{ color: item.color }}>
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={item.icon}/></svg>
                </a>
             ))}
          </div>
          <div className="flex items-center px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white text-md font-black mr-3 shadow-lg overflow-hidden shrink-0">
              {currentProfilePic ? <img src={currentProfilePic} alt="P" className="w-full h-full object-cover" /> : displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black truncate dark:text-gray-100">{displayName}</p>
              <p className="text-[8px] font-bold text-gray-400 truncate uppercase">{role === 'MODERATOR' ? t('moderator') : user?.mobile}</p>
            </div>
          </div>
          <button onClick={() => setUser(null, 'ADMIN')} className="flex items-center w-full px-5 py-2 text-[10px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-all">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto focus:outline-none transition-colors duration-300 print:overflow-visible">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 md:px-10 print:hidden">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-lg font-black dark:text-white uppercase tracking-tighter leading-none">{t(view)}</h1>
          </div>
          <div className="flex items-center space-x-2">
             <button onClick={() => setIsSwitchModalOpen(true)} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm" title={t('switchAccount')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             </button>
             <button onClick={() => setLanguage(language === 'EN' ? 'BN' : 'EN')} className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-sm" title={t('language')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </button>
             <button onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light')} className="p-2.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition-all shadow-sm" title={t('themeMode')}>
                {themeMode === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : themeMode === 'light' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.657 7.657l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                )}
             </button>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-7xl mx-auto print:p-0">
          {children}
        </div>

        <button 
           onClick={() => setIsCalcOpen(!isCalcOpen)}
           className="fixed bottom-6 right-6 z-[90] w-12 h-12 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all print:hidden"
           style={{ boxShadow: '0 10px 15px -3px var(--primary-color)80' }}
           title={t('calculator')}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </button>

        <footer className="mt-auto py-8 text-center border-t dark:border-gray-800 print:hidden bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex justify-center space-x-4 mb-4 flex-wrap">
             {contactIcons.map(item => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" 
                   className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:scale-110 transition-all border border-gray-100 dark:border-gray-700"
                   style={{ color: item.color }}>
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d={item.icon} /></svg>
                </a>
             ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Developed by {BRAND_INFO.developer}</p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
