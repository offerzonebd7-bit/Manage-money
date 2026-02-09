
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
    { id: 'website', url: BRAND_INFO.website, color: 'text-blue-500', svg: <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8s8 3.589 8 8s-3.589 8-8 8m-5.5-8c0-.552.448-1 1-1h1v-1c0-.552.448-1 1-1s1 .448 1 1v1h1c.552 0 1 .448 1 1s-.448 1-1 1h-1v1c0 .552-.448 1-1 1s-1-.448-1-1v-1h-1c-.552 0-1-.448-1-1" /> },
    { id: 'facebook', url: BRAND_INFO.facebook, color: 'text-indigo-600', svg: <path fill="currentColor" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89c1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /> },
    { id: 'whatsapp', url: BRAND_INFO.whatsapp, color: 'text-emerald-500', svg: <path fill="currentColor" d="M12.01 2C6.48 2 2 6.48 2 12.01c0 1.91.53 3.69 1.45 5.22L2 22l4.95-1.45c1.47.82 3.16 1.28 4.95 1.28c5.51 0 10.01-4.5 10.01-10.01c0-2.67-1.04-5.18-2.93-7.07C17.09 2.85 14.58 1.82 12.01 2zm0 2c2.14 0 4.15.84 5.66 2.34c1.51 1.5 2.34 3.52 2.34 5.67c0 4.41-3.59 8.01-8.01 8.01c-1.57 0-3.08-.46-4.37-1.32l-.31-.21l-2.69.79l.8-2.62l-.23-.37a8.03 8.03 0 0 1-1.21-4.28c0-4.42 3.59-8.01 8.01-8.01z" /> },
    { id: 'instagram', url: BRAND_INFO.instagram, color: 'text-pink-500', svg: <path fill="currentColor" d="M12 2c-2.717 0-3.056.01-4.122.06c-1.065.05-1.79.217-2.428.465c-.66.255-1.22.597-1.777 1.154c-.557.558-.899 1.118-1.154 1.777c-.247.637-.415 1.363-.465 2.428C2.01 8.944 2 9.283 2 12c0 2.717.01 3.056.06 4.122c.05 1.065.217 1.79.465 2.428c.254.66.596 1.22 1.154 1.777c.558.557 1.117.899 1.777 1.154c.638.247 1.362.415 2.428.465c1.066.05 1.405.06 4.122.06s3.056-.01 4.122-.06c1.065-.05 1.79-.217 2.428-.465c.66-.255 1.22-.597 1.777-1.154c.557-.558.899-1.118 1.154-1.777c.247-.637.415-1.363.465-2.428c.05-1.066.06-1.405.06-4.122s-.01-3.056-.06-4.122c-.05-1.065-.217-1.79-.465-2.428a4.883 4.883 0 0 0-1.154-1.777a4.885 4.885 0 0 0-1.777-1.154c-.637-.248-1.363-.415-2.428-.465C15.056 2.01 14.717 2 12 2zm0 2.163c2.67 0 2.987.01 4.042.059c.976.045 1.505.207 1.858.344c.467.182.8.398 1.15.748c.35.35.566.683.748 1.15c.137.353.3.882.344 1.857c.048 1.055.058 1.371.058 4.042s-.01 2.987-.058 4.042c-.045.975-.207 1.504-.344 1.857c-.182.466-.399.8-.748 1.15c-.35.35-.683.566-1.15.748c-.353.137-.882.3-1.857.344c-1.055.048-1.371.058-4.042.058s-2.987-.01-4.042-.058c-.975-.045-1.504-.207-1.857-.344a3.029 3.029 0 0 1-1.15-.748a3.033 3.033 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.857c-.049-1.055-.059-1.371-.059-4.042s.01-2.987.059-4.042c.045-.975.207-1.504.344-1.857c.182-.466.399-.8.748-1.15c.35-.35.683-.566 1.15-.748c.353-.137.882-.3 1.857-.344c1.055-.048 1.371-.059 4.042-.059zM12 6.865A5.135 5.135 0 1 0 17.135 12A5.135 5.135 0 0 0 12 6.865zm0 8.108A2.973 2.973 0 1 1 14.973 12A2.973 2.973 0 0 1 12 14.973zm4.846-9.157a1.2 1.2 0 1 0 1.2 1.2a1.2 1.2 0 0 0-1.2-1.2z" /> },
    { id: 'email', url: BRAND_INFO.email, color: 'text-rose-500', svg: <path fill="currentColor" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5l-8-5h16zm0 12H4V8l8 5l8-5v10z" /> },
  ];

  const displayName = role === 'MODERATOR' ? moderatorName : (user?.name || 'User');
  const currentProfilePic = role === 'MODERATOR' 
    ? user?.moderators?.find(m => m.name === moderatorName)?.profilePic || ''
    : user?.profilePic || '';
  const fallbackInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Calculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      {/* Switch Account Modal */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl overflow-hidden border-4 border-primary/10">
            <div className="p-8 bg-primary text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">{t('switchAccount')}</h2>
              <button onClick={() => setIsSwitchModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
              {allUsers.map((u) => (
                <div key={u.id} className="space-y-2">
                  <button 
                    onClick={() => { setUser(u, 'ADMIN'); setIsSwitchModalOpen(false); }}
                    className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all ${user?.id === u.id && role === 'ADMIN' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-700 hover:border-primary/50'}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black mr-4 shadow-lg overflow-hidden shrink-0">
                      {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-xs dark:text-white uppercase">{u.name}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase">Administrator</p>
                    </div>
                  </button>
                  {u.moderators?.map(m => (
                    <button 
                      key={m.id}
                      onClick={() => { setUser(u, 'MODERATOR', m.name); setIsSwitchModalOpen(false); }}
                      className={`w-full ml-4 flex items-center p-3 rounded-2xl border-2 transition-all ${moderatorName === m.name ? 'border-amber-500 bg-amber-500/5' : 'border-gray-50 dark:border-gray-800 hover:border-amber-500/50'}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-black mr-4 overflow-hidden shrink-0">
                        {m.profilePic ? <img src={m.profilePic} className="w-full h-full object-cover" /> : m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-black text-[10px] dark:text-white uppercase">{m.name}</p>
                        <p className="text-[7px] font-bold text-gray-400 uppercase">Moderator</p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
               <button onClick={() => { setUser(null); setIsSwitchModalOpen(false); }} className="w-full py-4 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-2 border-dashed border-primary flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  Add New Account
               </button>
            </div>
          </div>
        </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform bg-white dark:bg-gray-900 border-r dark:border-gray-800 md:translate-x-0 md:static md:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
                <svg className="w-5 h-5" viewBox="0 0 24 24">{link.svg}</svg>
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

      <main className="flex-1 relative overflow-y-auto focus:outline-none transition-colors duration-300 flex flex-col h-full">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 md:px-10">
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

        <div className="p-4 md:p-6 max-w-7xl mx-auto flex-grow">
          {children}
        </div>

        <footer className="w-full py-8 text-center border-t dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 space-y-4">
           <div className="flex justify-center items-center gap-6">
              {socialLinks.map(link => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all ${link.color} border dark:border-gray-700`}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">{link.svg}</svg>
                </a>
              ))}
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
             Developed by <a href={BRAND_INFO.developerUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{BRAND_INFO.developer}</a>
           </p>
        </footer>

        <button onClick={() => setIsCalcOpen(!isCalcOpen)} className="fixed bottom-16 right-6 z-[90] w-12 h-12 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all" style={{ boxShadow: '0 10px 15px -3px var(--primary-color)80' }} title={t('calculator')}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </button>
      </main>
    </div>
  );
};

export default Layout;
