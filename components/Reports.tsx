
import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Reports: React.FC = () => {
  const { transactions, t, user, language } = useApp();
  const [viewMode, setViewMode] = useState<'GRAND' | 'DAILY'>('GRAND');
  
  // Date Range States
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => tx.date >= startDate && tx.date <= endDate);
  }, [transactions, startDate, endDate]);

  const chartData = useMemo(() => {
    const income = filteredTransactions.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + tx.amount, 0);
    const expense = filteredTransactions.filter(tx => tx.type === 'EXPENSE').reduce((acc, tx) => acc + tx.amount, 0);
    const dues = filteredTransactions.filter(tx => tx.type === 'DUE').reduce((acc, tx) => acc + tx.amount, 0);

    return [
      { name: t('income'), value: income, fill: '#10B981' },
      { name: t('expense'), value: expense, fill: '#EF4444' },
      { name: t('dues'), value: dues, fill: '#F59E0B' },
    ];
  }, [filteredTransactions, t]);

  const ledgerData = useMemo(() => {
    const dailyMap: Record<string, { income: number, expense: number, dues: number, profit: number }> = {};
    
    filteredTransactions.forEach(tx => {
      if (!dailyMap[tx.date]) {
        dailyMap[tx.date] = { income: 0, expense: 0, dues: 0, profit: 0 };
      }
      if (tx.type === 'INCOME') dailyMap[tx.date].income += tx.amount;
      if (tx.type === 'EXPENSE') dailyMap[tx.date].expense += tx.amount;
      if (tx.type === 'DUE') dailyMap[tx.date].dues += tx.amount;
      dailyMap[tx.date].profit += (tx.profit || 0);
    });

    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    return ledgerData.reduce((acc, curr) => ({
      income: acc.income + curr.income,
      expense: acc.expense + curr.expense,
      dues: acc.dues + curr.dues,
      profit: acc.profit + curr.profit
    }), { income: 0, expense: 0, dues: 0, profit: 0 });
  }, [ledgerData]);

  const currencySymbol = user?.currency || '৳';

  return (
    <div className="space-y-8 animate-in zoom-in duration-500 pb-20">
      {/* Header Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[30px] border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between no-print gap-4">
         <div className="flex flex-col gap-2 w-full md:w-auto">
            <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t('reports')}</h2>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Formal Account Statements</p>
         </div>
         
         <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border dark:border-gray-700">
               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent outline-none text-[10px] font-black dark:text-white" />
               <span className="text-[9px] font-bold text-gray-300">TO</span>
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent outline-none text-[10px] font-black dark:text-white" />
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border dark:border-gray-700">
               <button onClick={() => setViewMode('GRAND')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${viewMode === 'GRAND' ? 'bg-white dark:bg-gray-700 shadow-md text-primary' : 'text-gray-400'}`}>{t('grandSummary')}</button>
               <button onClick={() => setViewMode('DAILY')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${viewMode === 'DAILY' ? 'bg-white dark:bg-gray-700 shadow-md text-primary' : 'text-gray-400'}`}>{t('dailyLedger')}</button>
            </div>
            <button onClick={() => window.print()} className="p-3 bg-primary text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
         </div>
      </div>

      {viewMode === 'GRAND' ? (
         <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {chartData.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border dark:border-gray-700 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-all">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.name}</p>
                    <p className="text-3xl font-black dark:text-white leading-none">{currencySymbol}{stat.value.toLocaleString()}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center`} style={{ backgroundColor: `${stat.fill}20`, color: stat.fill }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700">
               <h3 className="text-lg font-black mb-8 dark:text-white uppercase tracking-tight flex items-center">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                  Period Analysis Graph
               </h3>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800 }}
                        formatter={(value: any) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                      />
                      <Bar dataKey="value" radius={[15, 15, 15, 15]} barSize={60}>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
      ) : (
         <div className="animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-2xl border-t-[10px] border-primary print-statement">
               <div className="flex justify-between items-start mb-12">
                  <div>
                    <h1 className="text-4xl font-black text-primary italic mb-2 leading-none">{user?.name}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Account Transaction Ledger</p>
                    <div className="mt-8 flex gap-6">
                       <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Statement Period</p>
                          <p className="text-[11px] font-black">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Generated On</p>
                          <p className="text-[11px] font-black">{new Date().toLocaleDateString()}</p>
                       </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="p-4 bg-primary/5 rounded-3xl border-2 border-primary/10">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Statement Profit</p>
                       <p className="text-3xl font-black text-primary leading-none">{currencySymbol}{totals.profit.toLocaleString()}</p>
                    </div>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-y-4 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                        <th className="py-5 px-4 text-[10px] font-black uppercase text-gray-400">{t('date')}</th>
                        <th className="py-5 px-4 text-[10px] font-black uppercase text-emerald-500">{t('income')}</th>
                        <th className="py-5 px-4 text-[10px] font-black uppercase text-rose-500">{t('expense')}</th>
                        <th className="py-5 px-4 text-[10px] font-black uppercase text-amber-500">{t('dues')}</th>
                        <th className="py-5 px-4 text-[10px] font-black uppercase text-blue-500 text-right">{t('profit')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-50 dark:divide-gray-700">
                      {ledgerData.length === 0 ? (
                        <tr><td colSpan={5} className="py-10 text-center font-bold text-gray-300 uppercase text-[10px]">{t('noTransactions')}</td></tr>
                      ) : (
                        ledgerData.map(day => (
                          <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <td className="py-5 px-4 text-xs font-black font-mono">{day.date}</td>
                            <td className="py-5 px-4 text-xs font-black text-emerald-600">{currencySymbol}{day.income.toLocaleString()}</td>
                            <td className="py-5 px-4 text-xs font-black text-rose-600">{currencySymbol}{day.expense.toLocaleString()}</td>
                            <td className="py-5 px-4 text-xs font-black text-amber-600">{currencySymbol}{day.dues.toLocaleString()}</td>
                            <td className="py-5 px-4 text-xs font-black text-blue-600 text-right">{currencySymbol}{day.profit.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
               </div>

               <div className="mt-12 p-10 bg-gray-900 text-white rounded-[40px] border-t-8 border-primary flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="grid grid-cols-3 gap-10 w-full md:w-auto">
                     <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Total Cash In</p>
                        <p className="text-xl font-black text-emerald-400">{currencySymbol}{totals.income.toLocaleString()}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Total Cash Out</p>
                        <p className="text-xl font-black text-rose-400">{currencySymbol}{totals.expense.toLocaleString()}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Statement Dues</p>
                        <p className="text-xl font-black text-amber-400">{currencySymbol}{totals.dues.toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="text-right w-full md:w-auto border-t-2 md:border-t-0 md:border-l-2 border-gray-800 pt-6 md:pt-0 md:pl-10">
                     <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1">Net Statement Profit</p>
                     <p className="text-4xl font-black text-white leading-none">{currencySymbol}{totals.profit.toLocaleString()}</p>
                  </div>
               </div>
               
               <div className="mt-20 flex justify-between items-end border-t-2 border-dashed border-gray-200 pt-10 no-print-visible">
                  <div className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-300">
                     Khurasan - Premium POS Statement System
                  </div>
                  <div className="text-center">
                     <div className="w-40 border-b-2 border-gray-900 mb-2"></div>
                     <p className="text-[8px] font-black uppercase tracking-widest">Authorized Signature</p>
                  </div>
               </div>
            </div>
         </div>
      )}

      <div className="hidden print:block text-center pt-10 border-t text-[10px] font-black uppercase tracking-[1em] text-gray-300">
         GRAPHICO GLOBAL • KHURASAN POS
      </div>
    </div>
  );
};

export default Reports;
