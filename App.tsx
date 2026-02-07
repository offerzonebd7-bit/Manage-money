
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { TRANSLATIONS, BRAND_INFO } from './constants';
import { Transaction, UserProfile, Language, Theme, TransactionType, UserRole, ThemeMode, SaleRecord } from './types';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Settings from './components/Settings';
import ProductStock from './components/ProductStock';
import PartnerContact from './components/PartnerContact';
import ProductSale from './components/ProductSale';
import TodaySales from './components/TodaySales';

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
  view: 'dashboard' | 'transactions' | 'reports' | 'settings' | 'profile' | 'products' | 'partners' | 'sale' | 'todaySales';
  setView: (v: any) => void;
  t: (key: string) => string;
  resetApp: (code: string) => Promise<boolean>;
  syncUserProfile: (updatedUser: UserProfile) => Promise<void>;
  locationName: string;
  addSaleRecord: (sales: SaleRecord[]) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export default function App() {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mm_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('mm_role') as UserRole) || 'ADMIN';
  });
  
  const [moderatorName, setModeratorName] = useState<string>(() => {
    return localStorage.getItem('mm_mod_name') || '';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`mm_txs_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('mm_lang') as Language) || 'EN';
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('mm_theme_mode') as ThemeMode) || 'system';
  });

  const [theme, setTheme] = useState<Theme>('light');
  const [locationName] = useState('Chittagong, Bangladesh');
  const [view, setView] = useState<'dashboard' | 'transactions' | 'reports' | 'settings' | 'profile' | 'products' | 'partners' | 'sale' | 'todaySales'>('dashboard');

  // Persistence Logic
  useEffect(() => {
    localStorage.setItem('mm_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('mm_theme_mode', themeMode);
    const isDark = themeMode === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : themeMode === 'dark';
    setTheme(isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [themeMode]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('mm_current_user', JSON.stringify(user));
      localStorage.setItem(`mm_txs_${user.id}`, JSON.stringify(transactions));
      document.documentElement.style.setProperty('--primary-color', user.primaryColor || '#4169E1');
    } else {
      localStorage.removeItem('mm_current_user');
    }
  }, [user, transactions]);

  const setUser = (u: UserProfile | null, r: UserRole = 'ADMIN', modName: string = '') => {
    setUserState(u);
    setRole(r);
    setModeratorName(modName);
    localStorage.setItem('mm_role', r);
    localStorage.setItem('mm_mod_name', modName);
    
    if (u) {
      const savedTxs = localStorage.getItem(`mm_txs_${u.id}`);
      setTransactions(savedTxs ? JSON.parse(savedTxs) : []);
    }
  };

  const syncUserProfile = async (updatedUser: UserProfile) => {
    setUserState(updatedUser);
    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const updatedAll = allUsers.map((u: any) => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('mm_all_users', JSON.stringify(updatedAll));
  };

  const addSaleRecord = async (newSales: SaleRecord[]) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      sales: [...(user.sales || []), ...newSales]
    };
    await syncUserProfile(updatedUser);
  };

  const t = (key: string) => (TRANSLATIONS[language] as any)[key] || key;

  const addTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    const tx: Transaction = {
      ...newTx,
      id: 'TX-' + Date.now(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updated } : tx));
  };

  const deleteTransaction = (id: string) => {
    if (role === 'MODERATOR') return alert(t('insufficientPermissions'));
    if (confirm(t('confirmDelete'))) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const resetApp = async (code: string): Promise<boolean> => {
    if (role === 'MODERATOR' || code !== user?.secretCode) return false;
    setTransactions([]);
    if (user) {
        syncUserProfile({...user, sales: []});
    }
    return true;
  };

  const contextValue = useMemo(() => ({
    user, role, moderatorName, setUser, transactions, addTransaction, updateTransaction, deleteTransaction,
    language, setLanguage, theme, themeMode, setThemeMode, view, setView, t, resetApp, syncUserProfile, locationName, addSaleRecord
  }), [user, role, moderatorName, transactions, language, theme, themeMode, view]);

  return (
    <AppContext.Provider value={contextValue}>
      {!user ? <Auth /> : <Layout>{React.createElement({ 
          dashboard: Dashboard, 
          transactions: Transactions, 
          reports: Reports, 
          settings: Settings, 
          profile: Settings, 
          products: ProductStock, 
          partners: PartnerContact, 
          sale: ProductSale,
          todaySales: TodaySales
        }[view] || Dashboard)}</Layout>}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext)!;
