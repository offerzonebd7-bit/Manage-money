
import React, { useState } from 'react';
import { useApp } from '../App';
import { BRAND_INFO } from '../constants';
import { UserProfile, UserRole } from '../types';

const Auth: React.FC = () => {
  const { setUser, t, theme } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'recovery'>('login');
  const [loginRole, setLoginRole] = useState<UserRole>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', email: '', mobile: '', password: '', confirmPassword: '', secretCode: '', modCode: '', recoveryPin: '', newPassword: '' 
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
        setError('Passwords do not match');
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
        partners: []
      };

      localStorage.setItem('mm_all_users', JSON.stringify([...allUsers, newUser]));
      setUser(newUser, 'ADMIN');
    } else if (authMode === 'recovery') {
      const userIdx = allUsers.findIndex(u => u.email === formData.email.toLowerCase() && u.secretCode === formData.recoveryPin);
      if (userIdx !== -1) {
        allUsers[userIdx].password = formData.newPassword;
        localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
        setSuccess('Password Updated Successfully!');
        setTimeout(() => setAuthMode('login'), 2000);
      } else {
        setError('Invalid Email or Secret PIN');
      }
    } else {
      if (loginRole === 'ADMIN') {
        const found = allUsers.find(u => u.email === formData.email.toLowerCase() && u.password === formData.password);
        if (found) {
          setUser(found, 'ADMIN');
        } else {
          setError('Invalid Email or Password');
        }
      } else {
        const shop = allUsers.find(u => u.moderators?.some(m => m.email === formData.email.toLowerCase() && m.code === formData.modCode));
        if (shop) {
          const mod = shop.moderators.find(m => m.email === formData.email.toLowerCase());
          setUser(shop, 'MODERATOR', mod?.name || 'Moderator');
        } else {
          setError('Invalid Moderator Credentials');
        }
      }
    }
  };

  const btnBase = "w-full py-5 font-black rounded-lg shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px] border-b-4";

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-blue-50 text-gray-900'}`}>
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-[30px] sm:rounded-[40px] shadow-2xl overflow-hidden border-4 border-blue-600/10 animate-in fade-in zoom-in duration-300">
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
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="Shop/Brand Name" required />
          )}
          
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="Email Address" required />
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={loginRole === 'MODERATOR' && authMode === 'login' ? formData.modCode : (authMode === 'recovery' ? formData.newPassword : formData.password)} 
              onChange={(e) => {
                if (loginRole === 'MODERATOR' && authMode === 'login') setFormData({...formData, modCode: e.target.value});
                else if (authMode === 'recovery') setFormData({...formData, newPassword: e.target.value});
                else setFormData({...formData, password: e.target.value});
              }} 
              className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" 
              placeholder={loginRole === 'MODERATOR' && authMode === 'login' ? "Moderator User Code" : "Password"} 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1.39 1.39m7.95 7.95L1.39 1.39m14.507 2.329A10.023 10.023 0 0021.543 12c-1.274 4.057-5.064 7-9.543 7-1.007 0-1.979-.147-2.893-.42M21 21l-9-9" /></svg>
              )}
            </button>
          </div>

          {authMode === 'recovery' && (
            <input type="text" value={formData.recoveryPin} onChange={(e) => setFormData({ ...formData, recoveryPin: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-black text-sm border-b-4 border-black/5" placeholder="Secret Recovery PIN" required />
          )}

          {authMode === 'signup' && (
              <>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={formData.confirmPassword} 
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                    className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" 
                    placeholder="Confirm Password" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1.39 1.39m7.95 7.95L1.39 1.39m14.507 2.329A10.023 10.023 0 0021.543 12c-1.274 4.057-5.064 7-9.543 7-1.007 0-1.979-.147-2.893-.42M21 21l-9-9" /></svg>
                    )}
                  </button>
                </div>
                <div className="relative group">
                  <input type="text" value={formData.secretCode} onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-black text-sm border-b-4 border-blue-600/50" placeholder="Secret PIN (e.g. 1234)" required />
                  <div className="hidden group-hover:block absolute -top-10 left-0 bg-blue-900 text-white p-2 rounded text-[8px] font-bold z-10 w-full">{t('secretTooltip')}</div>
                </div>
              </>
          )}

          <button type="submit" className={`${btnBase} bg-blue-600 border-blue-800 text-white mt-4`}>
            {authMode === 'login' ? t('login') : authMode === 'signup' ? t('signup') : 'Recover Password'}
          </button>
          
          <div className="flex flex-col gap-4 mt-4 text-center">
            {authMode === 'login' ? (
              <>
                <button type="button" onClick={() => setAuthMode('signup')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Create New Shop</button>
                <button type="button" onClick={() => setAuthMode('recovery')} className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors">{t('forgotPassword')}</button>
              </>
            ) : (
              <button type="button" onClick={() => setAuthMode('login')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Back to Login</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default Auth;
