
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { TRANSLATIONS, BRAND_INFO } from './constants';
import { Transaction, UserProfile, Language, Theme, TransactionType } from './types';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Settings from './components/Settings';

interface AppContextType {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => void;
  updateTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  view: 'dashboard' | 'transactions' | 'reports' | 'settings' | 'profile';
  setView: (v: any) => void;
  t: (key: string) => string;
  resetApp: () => void;
  locationName: string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mm_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
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

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('mm_theme') as Theme) || 'light';
  });

  const [locationName, setLocationName] = useState('Chittagong, Bangladesh');
  const [view, setView] = useState<'dashboard' | 'transactions' | 'reports' | 'settings' | 'profile'>('dashboard');

  useEffect(() => {
    if (user) {
      localStorage.setItem('mm_active_user', JSON.stringify(user));
      const savedTx = localStorage.getItem(`mm_tx_${user.id}`);
      try {
        setTransactions(savedTx ? JSON.parse(savedTx) : []);
      } catch {
        setTransactions([]);
      }
      const color = user.primaryColor || '#4169E1';
      document.documentElement.style.setProperty('--primary-color', color);
    } else {
      localStorage.removeItem('mm_active_user');
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

  useEffect(() => {
    localStorage.setItem('mm_theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

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
    if (confirm(language === 'EN' ? 'Are you sure?' : 'আপনি কি নিশ্চিত?')) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const resetApp = () => {
    if (confirm(language === 'EN' ? 'Reset all data for this account?' : 'এই অ্যাকাউন্টের সব তথ্য মুছে ফেলবেন?')) {
      setTransactions([]);
      localStorage.removeItem(`mm_tx_${user?.id}`);
    }
  };

  const contextValue = useMemo(() => ({
    user, setUser,
    transactions, addTransaction, updateTransaction, deleteTransaction,
    language, setLanguage,
    theme, setTheme,
    view, setView,
    t,
    resetApp,
    locationName
  }), [user, transactions, language, theme, view, locationName]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className={theme === 'dark' ? 'dark bg-gray-950 text-white min-h-screen' : 'bg-gray-50 text-gray-900 min-h-screen'}>
        {!user ? <Auth /> : (
          <Layout>
            {view === 'dashboard' && <Dashboard />}
            {view === 'transactions' && <Transactions />}
            {view === 'reports' && <Reports />}
            {view === 'settings' && <Settings />}
            {view === 'profile' && <Settings />}
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
