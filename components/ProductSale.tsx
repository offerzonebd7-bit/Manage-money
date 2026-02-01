
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { TransactionType } from '../types';

interface SaleItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

const ProductSale: React.FC = () => {
  const { user, t, language, addTransaction } = useApp();
  const [customerInfo, setCustomerInfo] = useState({ name: '', mobile: '' });
  const [items, setItems] = useState<SaleItem[]>([{ id: Math.random().toString(), name: '', qty: 1, price: 0 }]);
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState('');

  const generateInvoiceId = () => {
    return 'INV-' + Math.floor(Math.random() * 900000 + 100000);
  };

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), name: '', qty: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<SaleItem>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  }, [items]);

  const currentPaid = parseFloat(paidAmount) || 0;
  const currentDue = Math.max(0, totalAmount - currentPaid);

  const handleFinishSale = () => {
    if (items.some(i => !i.name || i.price <= 0)) {
       alert(language === 'EN' ? 'Please fill all item details properly' : 'সবগুলো পণ্যের নাম ও সঠিক মূল্য দিন');
       return;
    }

    const invId = generateInvoiceId();
    setLastInvoiceId(invId);

    const commonDesc = `${invId} - ${customerInfo.name || 'Walk-in'} (${items.length} items)`;
    
    // Logic for Transaction Entry
    if (currentPaid > 0) {
      addTransaction({
        amount: currentPaid,
        description: commonDesc + (currentDue > 0 ? " (Partial Payment)" : " (Full Paid)"),
        type: 'INCOME',
        category: language === 'EN' ? 'Sales' : 'বিক্রয়',
        date: new Date().toISOString().split('T')[0],
      });
    }

    if (currentDue > 0) {
      addTransaction({
        amount: currentDue,
        description: commonDesc + (currentPaid > 0 ? " (Remaining Due)" : " (Full Due)"),
        type: 'DUE',
        category: language === 'EN' ? 'Sales Dues' : 'বিক্রয় বাকি',
        date: new Date().toISOString().split('T')[0],
      });
    }

    setShowInvoice(true);
  };

  const resetForm = () => {
    setCustomerInfo({ name: '', mobile: '' });
    setItems([{ id: Math.random().toString(), name: '', qty: 1, price: 0 }]);
    setPaidAmount('');
    setShowInvoice(false);
  };

  const currencySymbol = user?.currency || '৳';

  if (showInvoice) {
    return (
      <div className="animate-in zoom-in duration-500 pb-20 max-w-2xl mx-auto px-4 sm:px-0">
        <div className="bg-white p-6 sm:p-10 rounded-[30px] sm:rounded-[40px] shadow-2xl border-t-[8px] border-primary print:shadow-none print:rounded-none">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tighter italic">{user?.name || 'Shop Name'}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Contact: {user?.mobile}</p>
            </div>
            <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Invoice ID</p>
              <p className="text-xl font-black text-primary leading-none">{lastInvoiceId}</p>
              <p className="text-[8px] font-bold text-gray-400 mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-8 bg-gray-50 p-6 rounded-3xl border-2 border-black/5">
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Customer Details</p>
                <p className="text-sm font-black text-gray-900">{customerInfo.name || 'Cash Customer'}</p>
                <p className="text-[10px] font-bold text-gray-500">{customerInfo.mobile || 'N/A'}</p>
             </div>
             <div className="sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Status</p>
                <p className={`text-sm font-black uppercase ${currentDue === 0 ? 'text-emerald-500' : currentPaid > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {currentDue === 0 ? 'Full Paid' : currentPaid > 0 ? 'Partial Paid' : 'Full Due'}
                </p>
             </div>
          </div>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left">
              <thead className="border-b-2 border-black/5">
                 <tr>
                   <th className="py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Items</th>
                   <th className="py-4 text-center text-[9px] font-black uppercase text-gray-400 tracking-widest">Qty</th>
                   <th className="py-4 text-right text-[9px] font-black uppercase text-gray-400 tracking-widest">Total</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                 {items.map(item => (
                   <tr key={item.id} className="text-xs font-bold text-gray-700">
                      <td className="py-4 max-w-[150px] truncate">{item.name}</td>
                      <td className="py-4 text-center">{item.qty} × {item.price}</td>
                      <td className="py-4 text-right">{currencySymbol}{(item.qty * item.price).toLocaleString()}</td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 border-t-4 border-primary pt-6 mb-8">
             <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-gray-400">Sub Total</span>
                <span className="text-lg font-black text-gray-900">{currencySymbol}{totalAmount.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-emerald-600">
                <span className="text-xs font-black uppercase">Paid Amount</span>
                <span className="text-lg font-black">{currencySymbol}{currentPaid.toLocaleString()}</span>
             </div>
             <div className={`flex justify-between items-center pt-2 border-t border-dashed ${currentDue > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                <span className="text-sm font-black uppercase tracking-widest">Balance Due</span>
                <span className="text-2xl font-black">{currencySymbol}{currentDue.toLocaleString()}</span>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 no-print">
             <button onClick={() => window.print()} className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px] border-b-4 border-black/20 active:scale-95 transition-all">Print Invoice</button>
             <button onClick={resetForm} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl uppercase tracking-widest text-[10px] border-b-4 border-gray-300 active:scale-95 transition-all">New Sale</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-2 sm:px-0">
      <section className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-3xl shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-black mb-8 dark:text-white uppercase tracking-tighter flex items-center">
           <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
           {t('productSale')}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
           <div className="relative">
              <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs border-b-4 border-black/10 focus:border-primary transition-all" placeholder={t('customerName')} />
           </div>
           <div className="relative">
              <input type="text" value={customerInfo.mobile} onChange={e => setCustomerInfo({...customerInfo, mobile: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs border-b-4 border-black/10 focus:border-primary transition-all" placeholder={t('partnerMobile')} />
           </div>
        </div>

        <div className="space-y-4 mb-6">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Product List</span>
              <span className="text-[10px] font-bold text-primary">Add multiple rows below</span>
           </div>
           <div className="space-y-3">
              {items.map((item, index) => (
                 <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-2 animate-in slide-in-from-left-4 duration-300 bg-gray-50/50 dark:bg-gray-700/30 p-2 sm:p-0 rounded-2xl sm:bg-transparent">
                    <input type="text" value={item.name} onChange={e => updateItem(item.id, {name: e.target.value})} className="w-full sm:flex-[3] px-5 py-3 sm:py-4 bg-white dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs border-b-4 border-black/5" placeholder={t('productName')} required />
                    <div className="flex flex-1 gap-2 w-full sm:w-auto">
                       <input type="number" value={item.qty} onChange={e => updateItem(item.id, {qty: parseInt(e.target.value) || 1})} className="flex-1 px-3 sm:px-5 py-3 sm:py-4 bg-white dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs border-b-4 border-black/5" placeholder="Qty" required />
                       <input type="number" value={item.price} onChange={e => updateItem(item.id, {price: parseFloat(e.target.value) || 0})} className="flex-[1.5] px-3 sm:px-5 py-3 sm:py-4 bg-white dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs border-b-4 border-black/5" placeholder="Price" required />
                       <button onClick={() => handleRemoveItem(item.id)} className="px-4 sm:px-5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                    </div>
                 </div>
              ))}
           </div>
           <button onClick={handleAddItem} className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-black rounded-xl uppercase tracking-widest text-[9px] border-b-4 border-gray-300 dark:border-black/30 hover:bg-gray-200 transition-all">+ {t('addItem')}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end border-t pt-8 dark:border-gray-700">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Payment Received</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={paidAmount} 
                  onChange={e => setPaidAmount(e.target.value)} 
                  className="w-full px-5 py-5 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-800 rounded-2xl outline-none font-black text-xl text-emerald-600 placeholder:text-emerald-200" 
                  placeholder="0.00" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-emerald-300">{currencySymbol}</span>
              </div>
           </div>
           <div className="text-right p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-black/5">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-[10px] font-black uppercase text-gray-400">Grand Total</span>
                 <span className="text-xl font-black dark:text-white">{currencySymbol}{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-rose-500">
                 <span className="text-[10px] font-black uppercase tracking-widest">Due Balance</span>
                 <span className="text-3xl font-black tracking-tighter">{currencySymbol}{currentDue.toLocaleString()}</span>
              </div>
           </div>
        </div>

        <button onClick={handleFinishSale} className="w-full mt-10 py-5 bg-primary text-white font-black rounded-[25px] shadow-2xl uppercase tracking-[0.4em] text-[11px] border-b-[6px] border-black/20 hover:opacity-90 active:scale-95 transition-all">
           {t('finishSale')}
        </button>
      </section>
    </div>
  );
};

export default ProductSale;
