
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { TransactionType, Product } from '../types';

interface SaleItem {
  id: string;
  productId?: string;
  name: string;
  qty: number;
  price: number;
  color?: string;
  size?: string;
  stockLeft?: number;
}

const ProductSale: React.FC = () => {
  const { user, setUser, t, language, addTransaction, syncUserProfile, role, moderatorName } = useApp();
  const [customerInfo, setCustomerInfo] = useState({ name: '', mobile: '' });
  const [items, setItems] = useState<SaleItem[]>([{ id: Math.random().toString(), name: '', qty: 1, price: 0 }]);
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState('');
  const [suggestions, setSuggestions] = useState<{index: number, list: Product[]}>({index: -1, list: []});

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

  const handleProductSearch = (val: string, index: number) => {
    updateItem(items[index].id, { name: val });
    if (val.length > 0) {
      const filtered = (user?.products || []).filter(p => 
        p.name.toLowerCase().includes(val.toLowerCase()) || 
        p.code.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions({ index, list: filtered.slice(0, 5) });
    } else {
      setSuggestions({ index: -1, list: [] });
    }
  };

  const selectProduct = (p: Product, index: number) => {
    updateItem(items[index].id, {
      productId: p.id,
      name: p.name,
      price: p.sellPrice,
      color: p.color,
      size: p.size,
      stockLeft: p.stockQuantity
    });
    setSuggestions({ index: -1, list: [] });
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  }, [items]);

  const currentPaid = parseFloat(paidAmount) || 0;
  const currentDue = Math.max(0, totalAmount - currentPaid);

  const handleFinishSale = async () => {
    if (items.some(i => !i.name || i.price <= 0)) {
       alert(language === 'EN' ? 'Please fill all item details properly' : 'সবগুলো পণ্যের নাম ও সঠিক মূল্য দিন');
       return;
    }

    const outOfStock = items.find(item => item.productId && item.stockLeft !== undefined && item.qty > item.stockLeft);
    if (outOfStock) {
       alert(`${language === 'EN' ? 'Insufficient stock for' : 'স্টক নেই:'} ${outOfStock.name}. ${language === 'EN' ? 'Available' : 'আছে'}: ${outOfStock.stockLeft}`);
       return;
    }

    const invId = generateInvoiceId();
    setLastInvoiceId(invId);

    const commonDesc = `${invId} - ${customerInfo.name || 'Walk-in'} (${items.length} items)`;
    
    // INTEGRATION WITH DASHBOARD (addTransaction ensures it appears in global totals)
    if (currentPaid > 0) {
      addTransaction({
        amount: currentPaid,
        description: commonDesc,
        type: 'INCOME',
        category: language === 'EN' ? 'Clothing Sales' : 'পোশাক বিক্রয়',
        date: new Date().toISOString().split('T')[0],
      });
    }

    if (currentDue > 0) {
      addTransaction({
        amount: currentDue,
        description: `${commonDesc} (Due)`,
        type: 'DUE',
        category: language === 'EN' ? 'Sales Dues' : 'বিক্রয় বাকি',
        date: new Date().toISOString().split('T')[0],
      });
    }

    // AUTO REDUCTION LOGIC
    if (user) {
      const updatedProducts = (user.products || []).map(p => {
        const soldItem = items.find(item => item.productId === p.id);
        if (soldItem) {
          return { ...p, stockQuantity: Math.max(0, p.stockQuantity - soldItem.qty) };
        }
        return p;
      });
      const updatedUser = { ...user, products: updatedProducts };
      setUser(updatedUser, role, moderatorName);
      await syncUserProfile(updatedUser);
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
        <div className="bg-white p-6 sm:p-12 rounded-[40px] shadow-2xl border-t-[10px] border-primary print:shadow-none print:rounded-none">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-6">
            <div>
              <h2 className="text-3xl font-black text-primary tracking-tighter italic">{user?.name || 'Store Name'}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Mobile: {user?.mobile}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date: {new Date().toLocaleString()}</p>
            </div>
            <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Invoice Number</p>
              <p className="text-2xl font-black text-primary leading-none mt-1">{lastInvoiceId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10 mb-10 bg-gray-50 p-8 rounded-[30px] border-2 border-black/5">
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Customer Info</p>
                <p className="text-lg font-black text-gray-900 leading-none">{customerInfo.name || 'Walk-in Customer'}</p>
                <p className="text-[11px] font-bold text-gray-500 mt-2">{customerInfo.mobile || 'No Phone provided'}</p>
             </div>
             <div className="sm:text-right border-t sm:border-t-0 pt-6 sm:pt-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Billing Status</p>
                <p className={`text-md font-black uppercase tracking-widest ${currentDue === 0 ? 'text-emerald-500' : currentPaid > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {currentDue === 0 ? 'PAID' : currentPaid > 0 ? 'PARTIAL' : 'DUE'}
                </p>
             </div>
          </div>

          <div className="overflow-x-auto mb-10">
            <table className="w-full text-left">
              <thead className="border-b-[3px] border-black/5">
                 <tr>
                   <th className="py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Description</th>
                   <th className="py-5 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">Qty</th>
                   <th className="py-5 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/5">
                 {items.map(item => (
                   <tr key={item.id} className="text-[13px] font-bold text-gray-700">
                      <td className="py-5">
                         <p className="font-black">{item.name}</p>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            {item.color && `Color: ${item.color}`} {item.size && `| Size: ${item.size}`}
                         </p>
                      </td>
                      <td className="py-5 text-center">{item.qty} Pcs</td>
                      <td className="py-5 text-right">{currencySymbol}{(item.qty * item.price).toLocaleString()}</td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 border-t-[5px] border-primary pt-8 mb-10">
             <div className="flex justify-between items-center opacity-60">
                <span className="text-[11px] font-black uppercase">Sub Total</span>
                <span className="text-xl font-black">{currencySymbol}{totalAmount.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-emerald-600">
                <span className="text-[11px] font-black uppercase">Received Cash</span>
                <span className="text-xl font-black">{currencySymbol}{currentPaid.toLocaleString()}</span>
             </div>
             <div className={`flex justify-between items-center pt-4 border-t-2 border-dashed ${currentDue > 0 ? 'text-rose-600' : 'text-gray-300'}`}>
                <span className="text-sm font-black uppercase tracking-[0.3em]">Total Due</span>
                <span className="text-3xl font-black tracking-tighter">{currencySymbol}{currentDue.toLocaleString()}</span>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 no-print">
             <button onClick={() => window.print()} className="flex-1 py-5 bg-primary text-white font-black rounded-[25px] shadow-2xl uppercase tracking-[0.3em] text-[11px] border-b-[6px] border-black/20 active:scale-95 transition-all">Print Invoice</button>
             <button onClick={resetForm} className="flex-1 py-5 bg-gray-100 text-gray-500 font-black rounded-[25px] uppercase tracking-[0.3em] text-[11px] border-b-[6px] border-gray-300 active:scale-95 transition-all">New Transaction</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-2 sm:px-0 max-w-5xl mx-auto">
      <section className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-[40px] shadow-sm border dark:border-gray-700">
        <div className="flex items-center justify-between mb-10">
           <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter flex items-center">
              <span className="w-2.5 h-8 bg-primary mr-4 rounded-full"></span>
              Point of Sale (POS)
           </h3>
           <div className="text-right">
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Status</p>
              <p className="text-[11px] font-black text-emerald-500 mt-1 uppercase tracking-widest">System Online</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
           <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-4 tracking-widest">Customer Name</label>
              <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-gray-900 border-2 dark:border-gray-700 rounded-2xl outline-none font-bold text-xs border-b-4 border-black/5 focus:border-primary transition-all" placeholder="Enter name..." />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-4 tracking-widest">Mobile Number</label>
              <input type="text" value={customerInfo.mobile} onChange={e => setCustomerInfo({...customerInfo, mobile: e.target.value})} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-gray-900 border-2 dark:border-gray-700 rounded-2xl outline-none font-bold text-xs border-b-4 border-black/5 focus:border-primary transition-all" placeholder="017XXXXXXXX" />
           </div>
        </div>

        <div className="space-y-4 mb-10">
           <div className="flex items-center justify-between px-4 mb-4">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Items List</span>
              <span className="text-[10px] font-bold text-primary italic">Stock is automatically adjusted</span>
           </div>
           
           <div className="space-y-4">
              {items.map((item, index) => (
                 <div key={item.id} className="relative group animate-in slide-in-from-left-4 duration-300">
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-2 rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all">
                       <div className="w-full sm:flex-[3] relative">
                          <input 
                             type="text" 
                             value={item.name} 
                             onChange={e => handleProductSearch(e.target.value, index)} 
                             className="w-full px-5 py-4 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-2xl outline-none font-black text-xs border-b-4 border-black/5 focus:border-primary" 
                             placeholder="Type product name or code..." 
                             required 
                          />
                          {suggestions.index === index && suggestions.list.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 dark:border-gray-700 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                               {suggestions.list.map(p => (
                                 <button 
                                    key={p.id} 
                                    onClick={() => selectProduct(p, index)}
                                    className="w-full p-4 flex justify-between items-center hover:bg-primary/10 border-b last:border-0 dark:border-gray-700 text-left transition-colors"
                                 >
                                    <div>
                                       <p className="text-xs font-black dark:text-white">{p.name}</p>
                                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{p.color} | {p.size} | {p.code}</p>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[10px] font-black text-primary">{currencySymbol}{p.sellPrice}</p>
                                       <p className={`text-[8px] font-black uppercase ${p.stockQuantity > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Stock: {p.stockQuantity}</p>
                                    </div>
                                 </button>
                               ))}
                            </div>
                          )}
                       </div>
                       
                       <div className="flex flex-1 gap-2 w-full sm:w-auto">
                          <div className="flex-[0.8] relative">
                             <input type="number" value={item.qty} onChange={e => updateItem(item.id, {qty: parseInt(e.target.value) || 1})} className="w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-2xl outline-none font-black text-xs border-b-4 border-black/5 text-center" placeholder="Qty" required />
                             {item.stockLeft !== undefined && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">Left: {item.stockLeft}</span>}
                          </div>
                          <input type="number" value={item.price} onChange={e => updateItem(item.id, {price: parseFloat(e.target.value) || 0})} className="flex-[1.5] px-4 py-4 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-2xl outline-none font-black text-xs border-b-4 border-black/5" placeholder="Price" required />
                          <button onClick={() => handleRemoveItem(item.id)} className="px-5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                       </div>
                    </div>
                    {item.productId && (
                       <div className="flex gap-4 px-6 py-2">
                          <span className="text-[9px] font-black uppercase text-primary/60 tracking-widest">Color: {item.color}</span>
                          <span className="text-[9px] font-black uppercase text-amber-500/60 tracking-widest">Size: {item.size}</span>
                       </div>
                    )}
                 </div>
              ))}
           </div>
           <button onClick={handleAddItem} className="w-full py-4 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-black rounded-2xl uppercase tracking-[0.3em] text-[10px] border-b-4 border-gray-300 dark:border-gray-800 hover:bg-gray-200 transition-all">+ {t('addItem')}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end border-t-2 pt-10 dark:border-gray-700">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] ml-4">Cash Received</label>
              <div className="relative group">
                <input 
                  type="number" 
                  value={paidAmount} 
                  onChange={e => setPaidAmount(e.target.value)} 
                  className="w-full px-8 py-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900 rounded-[30px] outline-none font-black text-3xl text-emerald-600 placeholder:text-emerald-200 transition-all focus:shadow-xl" 
                  placeholder="0.00" 
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-3xl text-emerald-200">{currencySymbol}</span>
              </div>
           </div>
           <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[40px] border-2 border-black/5 shadow-inner">
              <div className="flex justify-between items-center mb-2 opacity-50">
                 <span className="text-[11px] font-black uppercase tracking-widest">Grand Total</span>
                 <span className="text-xl font-black dark:text-white">{currencySymbol}{totalAmount.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between items-center ${currentDue > 0 ? 'text-rose-600' : 'text-emerald-500 animate-pulse'}`}>
                 <span className="text-[11px] font-black uppercase tracking-[0.2em]">{currentDue > 0 ? 'Net Due' : 'Fully Paid'}</span>
                 <span className="text-4xl font-black tracking-tighter leading-none">{currencySymbol}{currentDue.toLocaleString()}</span>
              </div>
           </div>
        </div>

        <button onClick={handleFinishSale} className="w-full mt-10 py-6 bg-primary text-white font-black rounded-[30px] shadow-2xl uppercase tracking-[0.5em] text-[12px] border-b-[8px] border-black/20 hover:opacity-95 active:scale-95 transition-all">
           {t('finishSale')}
        </button>
      </section>
    </div>
  );
};

export default ProductSale;
