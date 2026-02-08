
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../App';
import { TransactionType, Transaction } from '../types';
import AIConsultant from './AIConsultant';

const Dashboard: React.FC = () => {
  const { transactions, t, addTransaction, updateTransaction, deleteTransaction, user, language, locationName } = useApp();
  const [formData, setFormData] = useState({ amount: '', description: '', type: 'INCOME' as TransactionType, category: '' });
  const [time, setTime] = useState(new Date());
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = () => {
    const hours = time.getHours();
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return { hhmm: `${displayHours}:${minutes}`, ss: seconds, ampm };
  };

  const { hhmm, ss, ampm } = formatClock();
  const todayStr = new Date().toISOString().split('T')[0];

  const summary = useMemo(() => {
    const totals = (txs: any[]) => ({
      income: txs.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0),
      expense: txs.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0),
      dues: txs.filter(t => t.type === 'DUE').reduce((acc, curr) => acc + curr.amount, 0),
      profit: txs.reduce((acc, curr) => acc + (curr.profit || 0), 0),
    });
    const all = totals(transactions);
    const today = totals(transactions.filter(tx => tx.date === todayStr));
    return { all, today };
  }, [transactions, todayStr]);

  const todayRecords = useMemo(() => {
    return transactions.filter(tx => tx.date === todayStr);
  }, [transactions, todayStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    addTransaction({
      amount: parseFloat(formData.amount),
      description: formData.description,
      type: formData.type,
      category: formData.category || (language === 'EN' ? 'General' : 'সাধারণ'),
      date: todayStr,
    });
    setFormData({ ...formData, amount: '', description: '', category: '' });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    updateTransaction(editingTx.id, {
      amount: editingTx.amount,
      description: editingTx.description,
      type: editingTx.type,
      category: editingTx.category,
    });
    setEditingTx(null);
  };

  const currencySymbol = user?.currency || '৳';
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <AIConsultant />

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in zoom-in duration-300">
           <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl overflow-hidden border-4 border-primary/10">
              <div className="p-8 bg-primary text-white flex justify-between items-center">
                 <h2 className="text-xl font-black uppercase tracking-tighter">{t('update')}</h2>
                 <button onClick={() => setEditingTx(null)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <form onSubmit={handleUpdate} className="p-8 space-y-4">
                 <div className="flex gap-2 mb-4">
                    {['INCOME', 'EXPENSE', 'DUE'].map(type => (
                       <button 
                          key={type}
                          type="button" 
                          onClick={() => setEditingTx({...editingTx, type: type as TransactionType})}
                          className={`flex-1 py-3 rounded-xl font-black text-[8px] uppercase tracking-widest border-2 transition-all ${editingTx.type === type ? 'bg-primary border-primary text-white shadow-lg' : 'bg-transparent border-gray-100 dark:border-gray-700 text-gray-400'}`}
                       >
                          {t(type.toLowerCase())}
                       </button>
                    ))}
                 </div>
                 <div className="space-y-4">
                    <div className="relative">
                       <input type="text" value={editingTx.description} onChange={(e) => setEditingTx({...editingTx, description: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs" required />
                       <label className="absolute left-5 -top-2 bg-white dark:bg-gray-800 px-2 text-[8px] font-black text-primary uppercase tracking-widest">{t('description')}</label>
                    </div>
                    <div className="relative">
                       <input type="number" value={editingTx.amount} onChange={(e) => setEditingTx({...editingTx, amount: parseFloat(e.target.value)})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs" required />
                       <label className="absolute left-5 -top-2 bg-white dark:bg-gray-800 px-2 text-[8px] font-black text-primary uppercase tracking-widest">{t('amount')}</label>
                    </div>
                    <div className="relative">
                       <input type="text" value={editingTx.category} onChange={(e) => setEditingTx({...editingTx, category: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs" />
                       <label className="absolute left-5 -top-2 bg-white dark:bg-gray-800 px-2 text-[8px] font-black text-primary uppercase tracking-widest">{t('category')}</label>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-all uppercase tracking-widest text-[10px] mt-4">
                    {t('save')}
                 </button>
              </form>
           </div>
        </div>
      )}

      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl border-2 border-primary/20 overflow-hidden bg-primary/5 dark:bg-gray-900 flex items-center justify-center shadow-inner">
                {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <div className="text-primary font-black text-2xl">{userInitial}</div>}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight dark:text-white leading-none">{user?.name || 'Shop Name'}</h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {locationName}
              </p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-baseline justify-center md:justify-end gap-1">
               <span className="text-4xl font-black font-mono tracking-tighter dark:text-white leading-none">{hhmm}</span>
               <div className="flex flex-col items-start leading-none mb-1">
                  <span className="text-sm font-black font-mono text-gray-400 dark:text-gray-500">{ss}</span>
                  <span className="text-[10px] font-black text-primary">{ampm}</span>
               </div>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-1 text-gray-400">
              {time.toLocaleDateString(language === 'EN' ? 'en-US' : 'bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2">
             <button type="button" onClick={() => setFormData({...formData, type: 'INCOME'})} className={`flex-1 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-2 transition-all ${formData.type === 'INCOME' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-transparent border-emerald-500/10 text-emerald-500 hover:bg-emerald-50'}`}>
                {t('income')}
             </button>
             <button type="button" onClick={() => setFormData({...formData, type: 'EXPENSE'})} className={`flex-1 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-2 transition-all ${formData.type === 'EXPENSE' ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-transparent border-rose-500/10 text-rose-500 hover:bg-rose-50'}`}>
                {t('expense')}
             </button>
             <button type="button" onClick={() => setFormData({...formData, type: 'DUE'})} className={`flex-1 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-2 transition-all ${formData.type === 'DUE' ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-transparent border-amber-500/10 text-amber-500 hover:bg-amber-50'}`}>
                {t('dues')}
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs focus:border-primary transition-all peer placeholder-transparent" id="dash-desc" required />
              <label htmlFor="dash-desc" className="absolute left-5 top-3.5 text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-2 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">{t('description')}</label>
            </div>
            <div className="relative">
              <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs focus:border-primary transition-all peer placeholder-transparent" id="dash-amt" required />
              <label htmlFor="dash-amt" className="absolute left-5 top-3.5 text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-2 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">{t('amount')} ({currencySymbol})</label>
            </div>
            <div className="relative">
              <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs focus:border-primary transition-all peer placeholder-transparent" id="dash-cat" />
              <label htmlFor="dash-cat" className="absolute left-5 top-3.5 text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-2 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">{t('category')}</label>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] shadow-lg hover:opacity-90 transition-all active:scale-95">
            {t('addTransaction')}
          </button>
        </form>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard title={t('totalBalance')} value={summary.all.income - summary.all.expense} color="bg-primary" symbol={currencySymbol} />
        <div className="grid grid-cols-3 gap-3">
           <BalanceCard title={t('income')} value={summary.all.income} color="bg-emerald-500" symbol={currencySymbol} />
           <BalanceCard title={t('expense')} value={summary.all.expense} color="bg-rose-500" symbol={currencySymbol} />
           <BalanceCard title={t('dues')} value={summary.all.dues} color="bg-amber-500" symbol={currencySymbol} />
        </div>
      </div>

      <section className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-2xl border dark:border-gray-800">
        <h3 className="text-[10px] font-black dark:text-white uppercase tracking-[0.3em] opacity-50 mb-4">{t('todaysSummary')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Today's Income</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">{currencySymbol}{summary.today.income.toLocaleString()}</p>
           </div>
           <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Today's Expense</p>
              <p className="text-lg font-black text-rose-700 dark:text-rose-400 mt-1">{currencySymbol}{summary.today.expense.toLocaleString()}</p>
           </div>
           <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Today's Dues</p>
              <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1">{currencySymbol}{summary.today.dues.toLocaleString()}</p>
           </div>
           <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Today's Profit</p>
              <p className="text-lg font-black text-blue-700 dark:text-blue-400 mt-1">{currencySymbol}{summary.today.profit.toLocaleString()}</p>
           </div>
        </div>
      </section>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <div className="flex items-center justify-between gap-4 mb-6">
           <h3 className="text-[10px] font-black dark:text-white uppercase tracking-[0.3em] opacity-50">Today's History</h3>
           <div className="flex items-center gap-2">
              <button onClick={() => setIsInvoiceOpen(true)} className="p-2 bg-primary text-white rounded-lg shadow hover:opacity-90 transition-all" title={t('printInvoice')}>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              </button>
           </div>
        </div>
        <div className="space-y-3">
           {todayRecords.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-[9px]">{t('noTransactions')}</div>
           ) : (
              todayRecords.map(tx => (
                 <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/20 rounded-xl border dark:border-gray-700 group transition-all">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : tx.type === 'EXPENSE' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                          {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '•'}
                       </div>
                       <div>
                          <p className="font-black text-xs dark:text-white leading-tight">{tx.description}</p>
                          <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-1">{tx.category}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <p className={`text-sm font-black ${tx.type === 'INCOME' ? 'text-emerald-500' : tx.type === 'EXPENSE' ? 'text-rose-600' : 'text-amber-500'}`}>
                          {currencySymbol}{tx.amount.toLocaleString()}
                       </p>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingTx(tx)} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => deleteTransaction(tx.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </div>
                 </div>
              ))
           )}
        </div>
      </div>
    </div>
  );
};

const BalanceCard: React.FC<{ title: string, value: number, color: string, symbol: string }> = ({ title, value, color, symbol }) => {
   return (
      <div className={`${color} p-5 rounded-xl text-white shadow-sm hover:scale-105 transition-all group overflow-hidden relative`}>
         <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-white/10 rounded-full blur-lg"></div>
         <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{title}</p>
         <p className="text-lg font-black mt-2 leading-none">{symbol}{value.toLocaleString()}</p>
      </div>
   );
};

export default Dashboard;
