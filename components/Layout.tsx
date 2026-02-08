
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
    { id: 'todaySales', label: t('todaySalesHistory'), icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'transactions', label: t('transactions'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'products', label: t('productStock'), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'partners', label: t('partners'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'reports', label: t('reports'), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'settings', label: t('settings'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  const socialLinks = [
    { id: 'website', url: BRAND_INFO.website, color: 'text-blue-500', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
    { id: 'facebook', url: BRAND_INFO.facebook, color: 'text-indigo-600', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { id: 'whatsapp', url: BRAND_INFO.whatsapp, color: 'text-emerald-500', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { id: 'instagram', url: BRAND_INFO.instagram, color: 'text-pink-500', icon: 'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 4a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 000-4zm4.5-1.5a1 1 0 110 2 1 1 0 010-2z' },
    { id: 'email', url: BRAND_INFO.email, color: 'text-rose-500', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  const displayName = role === 'MODERATOR' ? moderatorName : (user?.name || 'User');
  
  const currentProfilePic = role === 'MODERATOR' 
    ? user?.moderators?.find(m => m.name === moderatorName)?.profilePic || ''
    : user?.profilePic || '';

  const fallbackInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Calculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform bg-white dark:bg-gray-900 border-r dark:border-gray-800 md:translate-x-0 md:static md:inset-0 print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-800">
          <span className="text-2xl font-black text-primary tracking-tighter italic">Khurasan</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="mt-6 px-4 space-y-2 overflow-y-auto h-[calc(100vh-320px)] no-scrollbar">
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

        <div className="absolute bottom-0 w-full bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-4">
          <div className="flex justify-center items-center gap-3 mb-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            {socialLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:scale-110 active:scale-95 transition-all ${link.color}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={link.icon} /></svg>
              </a>
            ))}
          </div>
          <div className="flex items-center px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white text-md font-black mr-3 shadow-lg overflow-hidden shrink-0">
              {currentProfilePic ? <img src={currentProfilePic} alt="P" className="w-full h-full object-cover" /> : fallbackInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black truncate dark:text-gray-100">{displayName}</p>
              <p className="text-[8px] font-bold text-gray-400 truncate uppercase">{role === 'MODERATOR' ? t('moderator') : (user?.mobile || 'Admin')}</p>
            </div>
          </div>
          <button onClick={() => { const pin = prompt(language === 'EN' ? 'Enter Secret PIN:' : 'সিক্রেট পিন দিন:'); if (pin === user?.secretCode) setUser(null); }} className="flex items-center w-full px-5 py-2 text-[10px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-all">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto focus:outline-none transition-colors duration-300 print:overflow-visible flex flex-col h-full">
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

        <div className="p-4 md:p-6 max-w-7xl mx-auto print:p-0 flex-grow">
          {children}
        </div>

        <footer className="w-full py-8 text-center border-t dark:border-gray-800 print:hidden bg-white/50 dark:bg-gray-900/50 space-y-4">
           <div className="flex justify-center items-center gap-6">
              {socialLinks.map(link => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all ${link.color} border dark:border-gray-700`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={link.icon} /></svg>
                </a>
              ))}
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
             Developed by <a href={BRAND_INFO.developerUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{BRAND_INFO.developer}</a>
           </p>
        </footer>

        <button onClick={() => setIsCalcOpen(!isCalcOpen)} className="fixed bottom-16 right-6 z-[90] w-12 h-12 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all print:hidden" style={{ boxShadow: '0 10px 15px -3px var(--primary-color)80' }} title={t('calculator')}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </button>
      </main>
    </div>
  );
};

export default Layout;
