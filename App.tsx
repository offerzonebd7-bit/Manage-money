
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { TRANSLATIONS, BRAND_INFO } from './constants';
import { Transaction, UserProfile, Language, Theme, TransactionType, UserRole, ThemeMode } from './types';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Settings from './components/Settings';
import ProductStock from './components/ProductStock';
import PartnerContact from './components/PartnerContact';

interface AppContextType {
  user: UserProfile | null;
  role: UserRole;
  moderatorName: string;
  setUser: (u: UserProfile | null, r?: UserRole, modName?: string) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => void;
  updateTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  view: 'dashboard' | 'transactions' | 'reports' | 'settings' | 'profile' | 'products' | 'partners';
  setView: (v: any) => void;
  t: (key: string) => string;
  resetApp: (code: string) => boolean;
  locationName: string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export default function App() {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mm_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('mm_active_role') as UserRole) || 'ADMIN';
  });

  const [moderatorName, setModeratorName] = useState<string>(() => {
    return localStorage.getItem('mm_moderator_name') || '';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const userId = user?.id;
      if (!userId) return [];
      const saved = localStorage.getItem(`mm_tx_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('mm_lang') as Language) || 'EN';
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('mm_theme_mode') as ThemeMode) || 'system';
  });

  const [theme, setTheme] = useState<Theme>('light');
  const [locationName, setLocationName] = useState('Chittagong, Bangladesh');
  const [view, setView] = useState<'dashboard' | 'transactions' | 'reports' | 'settings' | 'profile' | 'products' | 'partners'>('dashboard');

  const setUser = (u: UserProfile | null, r: UserRole = 'ADMIN', modName: string = '') => {
    setUserState(u);
    setRole(r);
    setModeratorName(modName);
    if (u) {
      localStorage.setItem('mm_active_user', JSON.stringify(u));
      localStorage.setItem('mm_active_role', r);
      localStorage.setItem('mm_moderator_name', modName);
    } else {
      localStorage.removeItem('mm_active_user');
      localStorage.removeItem('mm_active_role');
      localStorage.removeItem('mm_moderator_name');
    }
  };

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = themeMode === 'dark';
      }
      
      setTheme(isDark ? 'dark' : 'light');
      
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('mm_theme_mode', themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  useEffect(() => {
    if (user) {
      const savedTx = localStorage.getItem(`mm_tx_${user.id}`);
      try {
        setTransactions(savedTx ? JSON.parse(savedTx) : []);
      } catch {
        setTransactions([]);
      }
      const color = user.primaryColor || '#4169E1';
      document.documentElement.style.setProperty('--primary-color', color);
    } else {
      setTransactions([]);
      document.documentElement.style.setProperty('--primary-color', '#4169E1');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`mm_tx_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  useEffect(() => {
    localStorage.setItem('mm_lang', language);
  }, [language]);

  const t = (key: string) => {
    const langSet = (TRANSLATIONS[language] as any) || TRANSLATIONS['EN'];
    return langSet[key] || key;
  };

  const addTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    const tx: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updated } : tx));
  };

  const deleteTransaction = (id: string) => {
    if (role === 'MODERATOR') {
      alert(t('insufficientPermissions'));
      return;
    }
    if (confirm(language === 'EN' ? 'Are you sure?' : 'আপনি কি নিশ্চিত?')) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const resetApp = (code: string): boolean => {
    if (role === 'MODERATOR') {
      alert(t('insufficientPermissions'));
      return false;
    }
    if (code === user?.secretCode) {
      setTransactions([]);
      localStorage.removeItem(`mm_tx_${user?.id}`);
      return true;
    } else {
      alert(language === 'EN' ? 'Invalid Admin Secret Code!' : 'ভুল এডমিন সিক্রেট কোড!');
      return false;
    }
  };

  const contextValue = useMemo(() => ({
    user, role, moderatorName, setUser,
    transactions, addTransaction, updateTransaction, deleteTransaction,
    language, setLanguage,
    theme, themeMode, setThemeMode,
    view, setView,
    t,
    resetApp,
    locationName
  }), [user, role, moderatorName, transactions, language, theme, themeMode, view, locationName]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen transition-colors duration-300">
        {!user ? <Auth /> : (
          <Layout>
            {view === 'dashboard' && <Dashboard />}
            {view === 'transactions' && <Transactions />}
            {view === 'reports' && <Reports />}
            {view === 'settings' && <Settings />}
            {view === 'profile' && <Settings />}
            {view === 'products' && <ProductStock />}
            {view === 'partners' && <PartnerContact />}
          </Layout>
        )}
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp error');
  return context;
};
