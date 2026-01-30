
import React, { useState } from 'react';
import { useApp } from '../App';
import { BRAND_INFO } from '../constants';
import { UserProfile, UserRole } from '../types';

const Auth: React.FC = () => {
  const { setUser, t, language, setLanguage, theme } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loginRole, setLoginRole] = useState<UserRole>('ADMIN');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    mobile: '',
    password: '', 
    confirmPassword: '', 
    secretCode: '',
    modCode: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  };

  const getStoredUsers = (): UserProfile[] => {
    try {
      const users = localStorage.getItem('mm_all_users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(formData.email)) {
      setError(language === 'EN' ? 'Please enter a valid email' : 'সঠিক জিমেইল বা ইমেইল ঠিকানা দিন');
      return;
    }

    const allUsers = getStoredUsers();

    if (authMode === 'signup') {
      if (formData.password.length < 6) {
        setError(language === 'EN' ? 'Password must be at least 6 characters' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(language === 'EN' ? 'Passwords do not match' : 'পাসওয়ার্ড মিলছে না');
        return;
      }
      if (allUsers.some(u => u.email === formData.email)) {
        setError(language === 'EN' ? 'Email already registered' : 'এই ইমেইলটি আগে ব্যবহার করা হয়েছে');
        return;
      }
      
      const newUser: UserProfile = {
        id: 'U-' + Date.now(),
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        secretCode: formData.secretCode,
        currency: '৳',
        accounts: [],
        moderators: [],
        products: [],
        partners: []
      };
      
      allUsers.push(newUser);
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
      setUser(newUser, 'ADMIN');
    } else if (authMode === 'login') {
      if (loginRole === 'ADMIN') {
        const existingUser = allUsers.find(u => u.email === formData.email && u.password === formData.password);
        if (existingUser) {
          setUser(existingUser, 'ADMIN');
        } else {
          setError(language === 'EN' ? 'Invalid Credentials' : 'ভুল ইমেইল অথবা পাসওয়ার্ড');
        }
      } else {
        let foundAdmin: UserProfile | null = null;
        let foundModName: string = '';

        for (const admin of allUsers) {
          const mod = admin.moderators?.find(m => m.email === formData.email && m.code === formData.modCode);
          if (mod) {
            foundAdmin = admin;
            foundModName = mod.name;
            break;
          }
        }

        if (foundAdmin) {
          setUser(foundAdmin, 'MODERATOR', foundModName);
        } else {
          setError(language === 'EN' ? 'Invalid Moderator Access' : 'ভুল মডারেটর ইমেইল অথবা কোড');
        }
      }
    } else if (authMode === 'forgot') {
      const userIdx = allUsers.findIndex(u => u.email === formData.email && u.secretCode === formData.secretCode);
      if (userIdx !== -1) {
        setSuccess(t('recoverySuccess') + ": " + allUsers[userIdx].password);
      } else {
        setError(t('recoveryError'));
      }
    }
  };

  const EyeIcon = ({ show, toggle }: { show: boolean, toggle: () => void }) => (
    <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors">
      {show ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
      )}
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-blue-50 text-gray-900'}`}>
      <div className="absolute top-6 right-6">
        <button onClick={() => setLanguage(language === 'EN' ? 'BN' : 'EN')} className="px-5 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-xl hover:scale-110 transition-all text-blue-600 font-black border dark:border-gray-700 text-xs">
          {language === 'EN' ? 'BN' : 'EN'}
        </button>
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-[30px] shadow-2xl overflow-hidden border-4 border-blue-600/10 animate-in fade-in zoom-in duration-300">
        <div className="p-10 text-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white">
          <h1 className="text-3xl font-black tracking-tighter italic leading-none">{BRAND_INFO.name}</h1>
          <p className="mt-3 text-blue-200 text-[9px] font-black uppercase tracking-[0.4em]">{BRAND_INFO.developer}</p>
        </div>

        {authMode === 'login' && (
          <div className="flex p-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
             <button onClick={() => setLoginRole('ADMIN')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginRole === 'ADMIN' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'}`}>{t('admin')}</button>
             <button onClick={() => setLoginRole('MODERATOR')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginRole === 'MODERATOR' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'}`}>{t('moderator')}</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <div className="p-4 text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 uppercase tracking-widest">{error}</div>}
          {success && <div className="p-4 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 uppercase tracking-widest">{success}</div>}

          <div className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 rounded-lg border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 outline-none font-bold focus:border-blue-500 transition-all text-sm" placeholder="Enter full name" required />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{loginRole === 'MODERATOR' ? t('moderatorEmail') : 'Email Address'}</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 rounded-lg border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 outline-none font-bold focus:border-blue-500 transition-all text-sm" placeholder="email@gmail.com" required />
            </div>

            {authMode === 'login' && loginRole === 'MODERATOR' ? (
              <div className="space-y-1 relative">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('moderatorCode')}</label>
                  <input type={showSecretCode ? "text" : "password"} value={formData.modCode} onChange={(e) => setFormData({ ...formData, modCode: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 outline-none font-bold focus:border-blue-500 transition-all text-sm pr-12" placeholder="Admin Provided Code" required />
                  <EyeIcon show={showSecretCode} toggle={() => setShowSecretCode(!showSecretCode)} />
              </div>
            ) : authMode !== 'forgot' && (
              <div className="space-y-1 relative">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('password')}</label>
                <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 rounded-lg border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 outline-none font-bold focus:border-blue-500 transition-all text-sm pr-12" placeholder="••••••••" required />
                <EyeIcon show={showPassword} toggle={() => setShowPassword(!showPassword)} />
              </div>
            )}

            {(authMode === 'signup' || authMode === 'forgot') && (
              <>
                {authMode === 'signup' && (
                  <div className="space-y-1 relative">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('confirmPassword')}</label>
                    <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-5 py-4 rounded-lg border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 outline-none font-bold focus:border-blue-500 transition-all text-sm pr-12" placeholder="••••••••" required />
                    <EyeIcon show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                  </div>
                )}
                <div className="space-y-1 relative">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('secretCode')}</label>
                  <input type={showSecretCode ? "text" : "password"} value={formData.secretCode} onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 outline-none font-bold focus:border-blue-500 transition-all text-sm pr-12" placeholder="4-Digit PIN" required />
                  <EyeIcon show={showSecretCode} toggle={() => setShowSecretCode(!showSecretCode)} />
                </div>
              </>
            )}
          </div>

          <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-lg shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px] mt-4 border-b-4 border-blue-800">
            {authMode === 'login' ? t('login') : authMode === 'signup' ? t('signup') : t('resetPassword')}
          </button>

          <div className="text-center pt-4 space-y-4">
             {authMode === 'login' && loginRole === 'ADMIN' && (
               <button type="button" onClick={() => setAuthMode('forgot')} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline block w-full">
                 {t('forgotPassword')}
               </button>
             )}
             
             {loginRole === 'ADMIN' && (
               <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }} className="text-[10px] font-black text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">
                 {authMode === 'login' ? (language === 'EN' ? "Need Account? Register" : "নতুন? একাউন্ট খুলুন") : (language === 'EN' ? t('backToLogin') : t('backToLogin'))}
               </button>
             )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
