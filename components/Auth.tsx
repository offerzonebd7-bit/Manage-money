
import React, { useState } from 'react';
import { useApp } from '../App';
import { BRAND_INFO } from '../constants';
import { UserProfile, UserRole } from '../types';
import { supabase } from '../lib/supabase';

const Auth: React.FC = () => {
  const { setUser, t, language, theme } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [loginRole, setLoginRole] = useState<UserRole>('ADMIN');
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '', secretCode: '', modCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const upsertProfile = async (userId: string, email: string, additionalData: any = {}) => {
    const profileData = {
      id: userId,
      email: email,
      name: additionalData.name || 'Shop Owner',
      mobile: additionalData.mobile || '',
      secret_code: additionalData.secretCode || '1234',
      currency: '৳',
      primary_color: '#4169E1',
      accounts: [],
      moderators: [],
      products: [],
      partners: []
    };
    const { data } = await supabase.from('users_profile').upsert(profileData).select().single();
    if (data) {
        return {
            ...data,
            secretCode: data.secret_code,
            primaryColor: data.primary_color,
            profilePic: data.profile_pic
        };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (authMode === 'signup') {
        if (formData.password !== formData.confirmPassword) throw new Error('Passwords mismatch');
        const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
        if (error) throw error;
        if (data.user) {
          const profile = await upsertProfile(data.user.id, formData.email, { name: formData.name, mobile: formData.mobile, secretCode: formData.secretCode });
          setUser(profile, 'ADMIN');
        }
      } else if (authMode === 'login') {
        if (loginRole === 'ADMIN') {
          const { data, error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
          if (error) throw error;
          if (data.user) {
            const profile = await upsertProfile(data.user.id, formData.email);
            setUser(profile, 'ADMIN');
          }
        } else {
          const { data } = await supabase.from('users_profile').select('*').contains('moderators', [{ email: formData.email.toLowerCase(), code: formData.modCode }]).single();
          if (data) {
            const mod = data.moderators.find((m: any) => m.email.toLowerCase() === formData.email.toLowerCase());
            setUser({...data, secretCode: data.secret_code, primaryColor: data.primary_color}, 'MODERATOR', mod.name);
          } else throw new Error('Invalid Credentials');
        }
      }
    } catch (err: any) { setError(err.message); }
  };

  const btnBase = "w-full py-5 font-black rounded-lg shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px] border-b-4";

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-blue-50 text-gray-900'}`}>
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
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && <div className="p-4 text-[10px] font-black text-red-600 bg-red-50 rounded-lg border border-red-200 uppercase tracking-widest">{error}</div>}
          {authMode === 'signup' && <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 rounded-lg border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4" placeholder="Full Name" required />}
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 rounded-lg border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4" placeholder="Gmail Address" required />
          <input type={showPassword ? "text" : "password"} value={loginRole === 'MODERATOR' ? formData.modCode : formData.password} onChange={(e) => loginRole === 'MODERATOR' ? setFormData({...formData, modCode: e.target.value}) : setFormData({...formData, password: e.target.value})} className="w-full px-5 py-4 rounded-lg border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4" placeholder={loginRole === 'MODERATOR' ? "Moderator Code" : "Password"} required />
          {authMode === 'signup' && (
              <>
                <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full px-5 py-4 rounded-lg border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4" placeholder="Confirm Password" required />
                <input type="text" value={formData.secretCode} onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })} className="w-full px-5 py-4 rounded-lg border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4" placeholder="Secret Code (PIN)" required />
              </>
          )}
          <button type="submit" className={`${btnBase} bg-blue-600 border-blue-800 text-white mt-4`}>{authMode === 'login' ? t('login') : t('signup')}</button>
          <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest">{authMode === 'login' ? 'Create Account' : 'Back to Login'}</button>
        </form>
      </div>
    </div>
  );
};
export default Auth;
