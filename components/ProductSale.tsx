
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../App';
import { Product, SaleRecord } from '../types';

interface SaleItem {
  id: string;
  productName: string;
  productId?: string;
  qty: number;
  price: number;
  color: string;
  size: string;
  buyPrice?: number;
  category?: string; // Track category for detailed reporting
}

const ProductSale: React.FC = () => {
  const { user, setUser, t, language, addTransaction, syncUserProfile, role, moderatorName, addSaleRecord } = useApp();
  const [customerInfo, setCustomerInfo] = useState({ name: '', mobile: '' });
  const [items, setItems] = useState<SaleItem[]>([{ id: Math.random().toString(), productName: '', qty: 0, price: 0, color: '', size: '' }]);
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState('');
  const [suggestions, setSuggestions] = useState<{index: number, list: string[]}>({index: -1, list: []});

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), productName: '', qty: 0, price: 0, color: '', size: '' }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<SaleItem>) => {
    setItems(prevItems => prevItems.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleNameSearch = (val: string, index: number) => {
    updateItem(items[index].id, { productName: val });
    if (val.length > 0) {
      const uniqueNames = Array.from(new Set((user?.products || [])
        .filter(p => p.name.toLowerCase().includes(val.toLowerCase()) || p.code.toLowerCase().includes(val.toLowerCase()))
        .map(p => p.name)));
      setSuggestions({ index, list: uniqueNames.slice(0, 5) });
    } else {
      setSuggestions({ index: -1, list: [] });
    }
  };

  const selectProductName = (name: string, index: number) => {
    updateItem(items[index].id, { productName: name, color: '', size: '', productId: undefined, qty: 0, price: 0 });
    setSuggestions({ index: -1, list: [] });
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.price || 0)), 0);
  }, [items]);

  const totalProfit = useMemo(() => {
    return items.reduce((sum, item) => {
      const unitProfit = item.price - (item.buyPrice || 0);
      return sum + (unitProfit * item.qty);
    }, 0);
  }, [items]);

  const currentPaid = parseFloat(paidAmount) || 0;
  const currentDue = Math.max(0, totalAmount - currentPaid);

  const handleFinishSale = async () => {
    if (items.some(i => !i.productId || Number(i.qty) <= 0)) {
       alert(language === 'EN' ? 'Please select product, variant and valid quantity' : 'দয়া করে পণ্য এবং সঠিক পরিমাণ সিলেক্ট করুন');
       return;
    }

    const invId = 'INV-' + Date.now().toString().slice(-6);
    setLastInvoiceId(invId);
    
    const today = new Date().toISOString().split('T')[0];
    const customerLabel = customerInfo.name || (language === 'EN' ? 'Walk-in' : 'নগদ কাস্টমার');
    const commonDesc = `${invId} - ${customerLabel}`;
    
    // --- Detailed Sale Records for "Today Sales Summary" ---
    const saleRecords: SaleRecord[] = items.map(item => ({
      id: 'S-' + Math.random().toString(36).substr(2, 9),
      invoiceId: invId,
      date: today,
      productName: item.productName,
      category: item.category || 'General',
      qty: item.qty,
      sellPrice: item.price,
      buyPrice: item.buyPrice || 0,
      profit: (item.price - (item.buyPrice || 0)) * item.qty
    }));
    await addSaleRecord(saleRecords);

    // --- Financial Transactions for Dashboard/Reports ---
    if (currentPaid > 0) {
      await addTransaction({ 
        amount: currentPaid, 
        description: commonDesc, 
        type: 'INCOME', 
        category: 'Product Sales', 
        date: today,
        profit: totalProfit
      });
    }
    
    if (currentDue > 0) {
      await addTransaction({ 
        amount: currentDue, 
        description: `${commonDesc} (${language === 'EN' ? 'Due' : 'বাকি'})`, 
        type: 'DUE', 
        category: 'Sales Dues', 
        date: today,
        profit: currentPaid > 0 ? 0 : totalProfit
      });
    }

    // --- STOCK REDUCTION ---
    if (user) {
      const updatedProducts = (user.products || []).map(p => {
        const sold = items.find(item => item.productId === p.id);
        if (sold) return { ...p, stockQuantity: Math.max(0, p.stockQuantity - sold.qty) };
        return p;
      });
      const updatedUser = { ...user, products: updatedProducts };
      await syncUserProfile(updatedUser);
      setUser(updatedUser, role, moderatorName);
    }
    
    setShowInvoice(true);
  };

  const currencySymbol = user?.currency || '৳';

  if (showInvoice) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-[40px] shadow-2xl border-t-[10px] border-primary pb-20">
        <h2 className="text-3xl font-black text-primary italic mb-6">{user?.name}</h2>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Invoice: {lastInvoiceId}</p>
        <div className="mt-4 flex flex-col gap-1">
           <p className="text-sm font-black dark:text-gray-900">Customer: {customerInfo.name || 'Walk-in'}</p>
           <p className="text-xs font-bold text-gray-500">Mobile: {customerInfo.mobile || 'N/A'}</p>
        </div>
        <table className="w-full text-left mb-10 mt-8">
           <thead className="border-b-2"><tr><th className="py-2 text-[10px] font-black uppercase">Product Details</th><th className="py-2 text-right text-[10px] font-black uppercase">Amt</th></tr></thead>
           <tbody className="divide-y">
              {items.map(i => (
                 <tr key={i.id} className="text-sm font-bold">
                    <td className="py-4">
                       <p className="text-md font-black text-gray-900">{i.productName}</p>
                       <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{i.color} | {i.size} | {i.qty} PCS x {i.price}</p>
                    </td>
                    <td className="py-4 text-right font-black">{currencySymbol}{(i.qty * i.price).toLocaleString()}</td>
                 </tr>
              ))}
           </tbody>
        </table>
        <div className="border-t-4 border-primary pt-6">
           <div className="flex justify-between font-black text-xl text-gray-400"><span>Grand Total</span><span>{currencySymbol}{totalAmount.toLocaleString()}</span></div>
           <div className="flex justify-between font-black text-2xl text-emerald-500 mt-2"><span>Paid Amount</span><span>{currencySymbol}{currentPaid.toLocaleString()}</span></div>
           {currentDue > 0 && <div className="flex justify-between font-black text-rose-500 mt-2"><span>Balance Due</span><span>{currencySymbol}{currentDue.toLocaleString()}</span></div>}
        </div>
        <div className="mt-10 flex gap-4 no-print">
           <button onClick={() => window.print()} className="flex-1 py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-[11px] border-b-4 border-black/20">Print Invoice</button>
           <button onClick={() => {setShowInvoice(false); setItems([{ id: Math.random().toString(), productName: '', qty: 0, price: 0, color: '', size: '' }]); setPaidAmount(''); setCustomerInfo({name:'', mobile:''});}} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl uppercase tracking-widest text-[11px] border-b-4 border-gray-300">New Sale</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <section className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700">
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 flex items-center">
          <span className="w-2.5 h-8 bg-primary mr-4 rounded-full"></span>POS Billing
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
           <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-2 dark:border-gray-700 rounded-2xl font-bold text-xs" placeholder="Customer Name" />
           <input type="text" value={customerInfo.mobile} onChange={e => setCustomerInfo({...customerInfo, mobile: e.target.value})} className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-2 dark:border-gray-700 rounded-2xl font-bold text-xs" placeholder="Mobile Number" />
        </div>

        <div className="space-y-4">
           {items.map((item, idx) => {
              const variants = (user?.products || []).filter(p => p.name === item.productName);
              const availableSizes = Array.from(new Set(variants.map(v => v.size)));
              const availableColors = Array.from(new Set(variants.filter(v => !item.size || v.size === item.size).map(v => v.color)));

              return (
                 <div key={item.id} className="relative bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[30px] border-2 border-transparent hover:border-primary/20 transition-all flex flex-col gap-4">
                    <div className="flex gap-4">
                       <div className="flex-1 relative">
                          <input type="text" value={item.productName} onChange={e => handleNameSearch(e.target.value, idx)} className="w-full px-5 py-4 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-2xl font-black text-xs" placeholder="Type Product Name..." />
                          {suggestions.index === idx && suggestions.list.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 z-[110] overflow-hidden">
                               {suggestions.list.map(n => <button key={n} onClick={() => selectProductName(n, idx)} className="w-full p-4 text-left hover:bg-primary/10 text-xs font-black uppercase border-b last:border-0">{n}</button>)}
                            </div>
                          )}
                       </div>
                       <button onClick={() => handleRemoveItem(item.id)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6" /></svg></button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       <select value={item.size} onChange={e => updateItem(item.id, {size: e.target.value, productId: undefined, color: '', price: 0})} className="px-4 py-3 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-xl font-bold text-xs" disabled={!item.productName}>
                          <option value="">Size</option>
                          {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                       <select value={item.color} onChange={e => {
                          const v = variants.find(p => p.size === item.size && p.color === e.target.value);
                          updateItem(item.id, {color: e.target.value, productId: v?.id, price: v?.sellPrice || 0, buyPrice: v?.buyPrice || 0, category: v?.category});
                       }} className="px-4 py-3 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-xl font-bold text-xs" disabled={!item.size}>
                          <option value="">Color</option>
                          {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black uppercase text-gray-400 ml-2">Qty</label>
                          <input type="number" value={item.qty === 0 ? '' : item.qty} onChange={e => updateItem(item.id, {qty: parseInt(e.target.value) || 0})} className="px-4 py-3 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-xl font-black text-xs text-center focus:border-primary outline-none" placeholder="0" />
                       </div>
                       <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black uppercase text-gray-400 ml-2">Total for Item</label>
                          <div className="px-4 py-3 bg-primary/10 text-primary font-black text-center rounded-xl flex items-center justify-center text-xs">
                             {currencySymbol}{(item.qty * item.price).toLocaleString()}
                          </div>
                          {/* Unit price input for bargaining */}
                          <input type="number" value={item.price} onChange={e => updateItem(item.id, {price: parseFloat(e.target.value) || 0})} className="mt-1 px-4 py-1 text-[8px] bg-gray-100 dark:bg-gray-800 rounded border border-dashed dark:border-gray-700 text-center" placeholder="Price" />
                       </div>
                    </div>
                 </div>
              );
           })}
           <button onClick={handleAddItem} className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-black rounded-2xl uppercase text-[10px] tracking-widest border-2 border-dashed border-gray-300 dark:border-gray-600">+ Add Another Item</button>
        </div>

        <div className="mt-10 pt-10 border-t-2 grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Cash Received (Payment)</label>
              <div className="relative">
                 <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} className="w-full px-8 py-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-[30px] font-black text-3xl text-emerald-600 outline-none" placeholder="0.00" />
                 <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-200">{currencySymbol}</span>
              </div>
           </div>
           <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[30px] border-2 dark:border-gray-700">
              <div className="flex justify-between items-center opacity-50 mb-2 font-black uppercase text-[10px] dark:text-white">Total Bill: {currencySymbol}{totalAmount.toLocaleString()}</div>
              <div className={`flex justify-between items-center font-black ${currentDue > 0 ? 'text-rose-600' : 'text-emerald-500'}`}>
                 <span className="uppercase text-[10px]">{currentDue > 0 ? 'Remaining Due' : 'Fully Paid'}</span>
                 <span className="text-4xl tracking-tighter">{currencySymbol}{currentDue.toLocaleString()}</span>
              </div>
           </div>
        </div>

        <button onClick={handleFinishSale} className="w-full mt-10 py-6 bg-primary text-white font-black rounded-[30px] uppercase tracking-[0.5em] text-[12px] border-b-[8px] border-black/20 shadow-2xl active:scale-95 transition-all">
           Finish Sale
        </button>
      </section>
    </div>
  );
};

export default ProductSale;
