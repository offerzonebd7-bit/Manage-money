
import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { SaleRecord } from '../types';

const TodaySales: React.FC = () => {
  const { user, t, syncUserProfile, language } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todaySales = useMemo(() => {
    return (user?.sales || []).filter(s => s.date === todayStr);
  }, [user?.sales, todayStr]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, { qty: number, profit: number, total: number }> = {};
    todaySales.forEach(s => {
      if (!summary[s.category]) {
        summary[s.category] = { qty: 0, profit: 0, total: 0 };
      }
      summary[s.category].qty += s.qty;
      summary[s.category].profit += s.profit;
      summary[s.category].total += (s.qty * s.sellPrice);
    });
    return summary;
  }, [todaySales]);

  const handleDelete = async (id: string) => {
    if (!user || !confirm(language === 'EN' ? 'Delete this record? Inventory won\'t auto-reverse.' : 'ডিলিট করতে চান? ইনভেন্টরি অটো পাল্টাবে না।')) return;
    const updatedSales = (user.sales || []).filter(s => s.id !== id);
    await syncUserProfile({ ...user, sales: updatedSales });
  };

  const currencySymbol = user?.currency || '৳';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between no-print">
         <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t('todaySalesHistory')}</h2>
         <button onClick={() => window.print()} className="px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-lg uppercase text-[10px] tracking-widest">
            {t('print')}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 overflow-hidden">
           <h3 className="text-sm font-black mb-6 dark:text-white uppercase tracking-[0.2em]">{t('soldItems')}</h3>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b-2 dark:border-gray-700">
                       <th className="py-4 text-[9px] font-black uppercase text-gray-400">Invoice/Item</th>
                       <th className="py-4 text-[9px] font-black uppercase text-gray-400">Qty</th>
                       <th className="py-4 text-[9px] font-black uppercase text-gray-400">Price</th>
                       <th className="py-4 text-[9px] font-black uppercase text-gray-400 text-right">Profit</th>
                       <th className="py-4 no-print"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y dark:divide-gray-700">
                    {todaySales.length === 0 ? (
                       <tr><td colSpan={5} className="py-10 text-center font-bold text-gray-300 uppercase text-[10px]">{t('noTransactions')}</td></tr>
                    ) : (
                       todaySales.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors group">
                             <td className="py-4">
                                <p className="text-xs font-black dark:text-white leading-none">{s.productName}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase mt-1">{s.invoiceId} • {s.category}</p>
                             </td>
                             <td className="py-4 text-xs font-black dark:text-gray-300">{s.qty}</td>
                             <td className="py-4 text-xs font-black dark:text-gray-300">{currencySymbol}{s.sellPrice.toLocaleString()}</td>
                             <td className="py-4 text-right text-xs font-black text-emerald-500">{currencySymbol}{s.profit.toLocaleString()}</td>
                             <td className="py-4 text-right no-print">
                                <button onClick={() => handleDelete(s.id)} className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700">
              <h3 className="text-sm font-black mb-6 dark:text-white uppercase tracking-[0.2em]">{t('catWiseProfit')}</h3>
              <div className="space-y-4">
                 {/* Fix: Explicitly typing [cat, val] to resolve 'property does not exist on type unknown' errors in TS */}
                 {Object.entries(categorySummary).map(([cat, val]: [string, any]) => (
                    <div key={cat} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                       <div>
                          <p className="text-[10px] font-black uppercase text-primary">{cat}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">{val.qty} Units Sold</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-emerald-500">+{currencySymbol}{val.profit.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-gray-400">Sales: {currencySymbol}{val.total.toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
                 {Object.keys(categorySummary).length === 0 && (
                    <p className="text-center py-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Wait for sales</p>
                 )}
              </div>
           </div>
        </div>
      </div>

      <div className="hidden print:block bg-white p-10 mt-10 rounded-[30px] border-t-8 border-primary">
         <h1 className="text-2xl font-black text-primary italic mb-2">{user?.name}</h1>
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-10">DAILY SALES HISTORY REPORT</p>
         <table className="w-full text-left">
            <thead>
               <tr className="border-b-2">
                  <th className="py-2 text-[9px] font-black">PRODUCT</th>
                  <th className="py-2 text-[9px] font-black">CATEGORY</th>
                  <th className="py-2 text-[9px] font-black">QTY</th>
                  <th className="py-2 text-right text-[9px] font-black">PROFIT</th>
               </tr>
            </thead>
            <tbody className="divide-y">
               {todaySales.map(s => (
                  <tr key={s.id} className="text-xs font-bold">
                     <td className="py-2">{s.productName}</td>
                     <td className="py-2 uppercase text-[9px]">{s.category}</td>
                     <td className="py-2">{s.qty}</td>
                     <td className="py-2 text-right text-emerald-600">+{currencySymbol}{s.profit}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div className="mt-10 pt-4 border-t-4 border-black flex justify-between">
            <span className="text-xs font-black uppercase">Grand Today Profit:</span>
            <span className="text-lg font-black text-emerald-600">{currencySymbol}{todaySales.reduce((a,b) => a + b.profit, 0).toLocaleString()}</span>
         </div>
         <p className="mt-20 text-center text-[7px] font-black uppercase tracking-widest text-gray-300">GRAPHICO GLOBAL • PROFESSIONAL POS SYSTEMS</p>
      </div>
    </div>
  );
};

export default TodaySales;
