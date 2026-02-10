
import React, { useState } from 'react';
import { useApp } from '../App';
import { BRAND_INFO } from '../constants';
import { UserProfile, UserRole } from '../types';

const Auth: React.FC = () => {
  const { setUser, t, theme, language } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'recovery'>('login');
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [loginRole, setLoginRole] = useState<UserRole>('ADMIN');
  const [formData, setFormData] = useState({ 
    name: '', email: '', mobile: '', password: '', confirmPassword: '', secretCode: '', modCode: '', recoveryPin: '', newPassword: '', confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const allUsers: UserProfile[] = JSON.parse(localStorage.getItem('mm_all_users') || '[]');

    if (authMode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError(language === 'EN' ? 'Passwords do not match' : 'পাসওয়ার্ড মিলেনি');
        return;
      }
      if (allUsers.some(u => u.email === formData.email.toLowerCase())) {
        setError(language === 'EN' ? 'Email already registered' : 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে');
        return;
      }
      const newUser: UserProfile = {
        id: 'U-' + Date.now(),
        name: formData.name,
        email: formData.email.toLowerCase(),
        mobile: formData.mobile,
        password: formData.password,
        secretCode: formData.secretCode,
        currency: '৳',
        primaryColor: '#4169E1',
        accounts: [],
        moderators: [],
        products: [],
        partners: [],
        uiConfig: { headlineSize: 1.25, bodySize: 0.875, btnScale: 1 }
      };
      const updatedUsers = [...allUsers, newUser];
      localStorage.setItem('mm_all_users', JSON.stringify(updatedUsers));
      setUser(newUser, 'ADMIN');
    } else if (authMode === 'recovery') {
      if (recoveryStep === 1) {
        const found = allUsers.find(u => u.email === formData.email.toLowerCase() && u.secretCode === formData.recoveryPin);
        if (found) {
          setRecoveryStep(2);
          setError('');
        } else {
          setError(t('recoveryError'));
        }
      } else {
        if (formData.newPassword !== formData.confirmNewPassword) {
          setError(language === 'EN' ? 'Passwords do not match' : 'পাসওয়ার্ড মিলেনি');
          return;
        }
        const userIdx = allUsers.findIndex(u => u.email === formData.email.toLowerCase());
        if (userIdx !== -1) {
          allUsers[userIdx].password = formData.newPassword;
          localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
          setSuccess(t('recoverySuccess'));
          setTimeout(() => { 
            setAuthMode('login'); 
            setRecoveryStep(1);
            setFormData({...formData, email: '', recoveryPin: '', newPassword: '', confirmNewPassword: ''});
          }, 2000);
        }
      }
    } else {
      if (loginRole === 'ADMIN') {
        const found = allUsers.find(u => u.email === formData.email.toLowerCase() && u.password === formData.password);
        if (found) setUser(found, 'ADMIN');
        else setError(language === 'EN' ? 'Invalid Email or Password' : 'ভুল ইমেইল বা পাসওয়ার্ড');
      } else {
        const shop = allUsers.find(u => u.moderators?.some(m => m.email === formData.email.toLowerCase() && m.code === formData.modCode));
        if (shop) {
          const mod = shop.moderators.find(m => m.email === formData.email.toLowerCase());
          setUser(shop, 'MODERATOR', mod?.name || 'Moderator');
        } else setError(language === 'EN' ? 'Invalid Moderator Credentials' : 'ভুল মডারেটর তথ্য');
      }
    }
  };

  const btnBase = "w-full py-5 font-black rounded-lg shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px] border-b-4";

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-blue-50 text-gray-900'}`}>
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden border-4 border-blue-600/10 animate-in zoom-in duration-300">
        <div className="p-10 text-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white">
          <h1 className="text-3xl font-black tracking-tighter italic leading-none">{BRAND_INFO.name}</h1>
          <p className="mt-3 text-blue-200 text-[9px] font-black uppercase tracking-[0.4em]">{BRAND_INFO.developer}</p>
        </div>
        
        {authMode !== 'recovery' && (
          <div className="flex p-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
             <button onClick={() => setLoginRole('ADMIN')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginRole === 'ADMIN' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'}`}>{t('admin')}</button>
             <button onClick={() => setLoginRole('MODERATOR')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginRole === 'MODERATOR' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'}`}>{t('moderator')}</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && <div className="p-4 text-[9px] font-black text-rose-600 bg-rose-50 rounded-xl border border-rose-200 uppercase tracking-widest">{error}</div>}
          {success && <div className="p-4 text-[9px] font-black text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200 uppercase tracking-widest">{success}</div>}
          
          {authMode === 'signup' && (
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="Shop Name" required />
          )}
          
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="Email Address" required />
          
          {authMode === 'login' && (
            <input type="password" value={loginRole === 'MODERATOR' ? formData.modCode : formData.password} onChange={(e) => loginRole === 'MODERATOR' ? setFormData({...formData, modCode: e.target.value}) : setFormData({...formData, password: e.target.value})} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder={loginRole === 'MODERATOR' ? "Moderator User Code" : "Password"} required />
          )}

          {authMode === 'recovery' && recoveryStep === 1 && (
            <input type="text" value={formData.recoveryPin} onChange={(e) => setFormData({ ...formData, recoveryPin: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-black text-sm border-b-4 border-blue-600/30 text-center tracking-[0.5em]" placeholder="4-Digit PIN" maxLength={4} required />
          )}

          {authMode === 'recovery' && recoveryStep === 2 && (
            <>
              <input type="password" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-emerald-600/30" placeholder="New Password" required />
              <input type="password" value={formData.confirmNewPassword} onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-emerald-600/30" placeholder="Confirm New Password" required />
            </>
          )}

          {authMode === 'signup' && (
            <>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="Password" required />
              <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="Confirm Password" required />
              <input type="text" value={formData.secretCode} onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-black text-sm border-b-4 border-blue-600/50 text-center" placeholder="Recovery PIN (4 Digits)" maxLength={4} required />
            </>
          )}

          <button type="submit" className={`${btnBase} bg-blue-600 border-blue-800 text-white mt-4`}>
            {authMode === 'recovery' ? (recoveryStep === 1 ? t('verify') : t('resetPassword')) : (authMode === 'login' ? t('login') : t('signup'))}
          </button>
          
          <div className="flex flex-col gap-4 mt-4 text-center">
            {authMode === 'login' ? (
              <>
                <button type="button" onClick={() => setAuthMode('signup')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Create New Shop</button>
                <button type="button" onClick={() => { setAuthMode('recovery'); setRecoveryStep(1); }} className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors">{t('forgotPassword')}</button>
              </>
            ) : (
              <button type="button" onClick={() => { setAuthMode('login'); setRecoveryStep(1); }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Back to Login</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default Auth;
