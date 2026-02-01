
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
import ProductSale from './components/ProductSale';
import { supabase, hasSupabaseConfig } from './lib/supabase';

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
  view: 'dashboard' | 'transactions' | 'reports' | 'settings' | 'profile' | 'products' | 'partners' | 'sale';
  setView: (v: any) => void;
  t: (key: string) => string;
  resetApp: (code: string) => Promise<boolean>;
  syncUserProfile: (updatedUser: UserProfile) => Promise<void>;
  locationName: string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export default function App() {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [moderatorName, setModeratorName] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('mm_lang') as Language) || 'EN';
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('mm_theme_mode') as ThemeMode) || 'system';
  });

  const [theme, setTheme] = useState<Theme>('light');
  const [locationName, setLocationName] = useState('Chittagong, Bangladesh');
  const [view, setView] = useState<'dashboard' | 'transactions' | 'reports' | 'settings' | 'profile' | 'products' | 'partners' | 'sale'>('dashboard');

  const fetchCloudData = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data: profile, error: pError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setUserState({
          ...profile,
          secretCode: profile.secret_code,
          primaryColor: profile.primary_color,
          profilePic: profile.profile_pic,
          moderators: profile.moderators || [],
          products: profile.products || [],
          partners: profile.partners || [],
          accounts: profile.accounts || []
        });
      }

      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (txs) {
        setTransactions(txs.map(t => ({
          ...t,
          userId: t.user_id,
          createdAt: t.created_at
        })));
      }
    } catch (e: any) {
      console.error("Fetch Error:", e);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        if (!hasSupabaseConfig) {
          setError("Supabase URL or Key is missing in environment variables.");
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchCloudData(session.user.id);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    initApp();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await fetchCloudData(session.user.id);
        } else {
          setUserState(null);
          setTransactions([]);
        }
        setLoading(false);
      });
      return () => authListener.subscription.unsubscribe();
    }
  }, []);

  const syncUserProfile = async (updatedUser: UserProfile) => {
    if (!supabase) return;
    const dbData = {
      name: updatedUser.name,
      mobile: updatedUser.mobile,
      currency: updatedUser.currency,
      secret_code: updatedUser.secretCode,
      primary_color: updatedUser.primaryColor,
      profile_pic: updatedUser.profilePic,
      moderators: updatedUser.moderators,
      products: updatedUser.products,
      partners: updatedUser.partners,
      accounts: updatedUser.accounts
    };
    await supabase.from('users_profile').update(dbData).eq('id', updatedUser.id);
  };

  const setUser = (u: UserProfile | null, r: UserRole = 'ADMIN', modName: string = '') => {
    setUserState(u);
    setRole(r);
    setModeratorName(modName);
  };

  useEffect(() => {
    const isDark = themeMode === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : themeMode === 'dark';
    setTheme(isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', user?.primaryColor || '#4169E1');
  }, [user?.primaryColor]);

  const t = (key: string) => (TRANSLATIONS[language] as any)[key] || key;

  const addTransaction = async (newTx: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    if (!user || !supabase) return;
    const { data } = await supabase.from('transactions').insert([{
      user_id: user.id,
      amount: newTx.amount,
      description: newTx.description,
      type: newTx.type,
      category: newTx.category,
      date: newTx.date
    }]).select().single();
    if (data) setTransactions(prev => [{...data, userId: data.user_id, createdAt: data.created_at}, ...prev]);
  };

  const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
    const { error } = await supabase.from('transactions').update(updated).eq('id', id);
    if (!error) setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updated } : tx));
  };

  const deleteTransaction = async (id: string) => {
    if (role === 'MODERATOR') return alert(t('insufficientPermissions'));
    if (confirm(t('confirmDelete'))) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const resetApp = async (code: string): Promise<boolean> => {
    if (role === 'MODERATOR' || code !== user?.secretCode) return false;
    const { error } = await supabase.from('transactions').delete().eq('user_id', user.id);
    if (!error) { setTransactions([]); return true; }
    return false;
  };

  const contextValue = useMemo(() => ({
    user, role, moderatorName, setUser, transactions, addTransaction, updateTransaction, deleteTransaction,
    language, setLanguage, theme, themeMode, setThemeMode, view, setView, t, resetApp, syncUserProfile, locationName
  }), [user, role, moderatorName, transactions, language, theme, themeMode, view]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing System...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-10 text-center">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <h2 className="text-2xl font-black text-rose-900 mb-2 uppercase tracking-tighter">Connection Error</h2>
        <p className="text-rose-600 font-bold text-sm max-w-xs">{error}</p>
        <p className="mt-6 text-[10px] font-black text-rose-400 uppercase tracking-widest">Please check your Environment Variables in Vercel/Local Settings.</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {!user ? <Auth /> : <Layout>{React.createElement({ dashboard: Dashboard, transactions: Transactions, reports: Reports, settings: Settings, profile: Settings, products: ProductStock, partners: PartnerContact, sale: ProductSale }[view] || Dashboard)}</Layout>}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext)!;
