
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useApp } from '../App';

const AIConsultant: React.FC = () => {
  const { user, t, language, addTransaction } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, data?: any }[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processAIRequest = async () => {
    if (!input && !imagePreview) return;
    
    setLoading(true);
    const userMsg = input || (language === 'EN' ? "Analyzing business document..." : "ডকুমেন্ট বিশ্লেষণ করা হচ্ছে...");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    try {
      // Strictly using system-provided API Key as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-flash-preview';
      let parts: any[] = [];
      
      if (imagePreview) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imagePreview.split(',')[1],
          },
        });
      }
      
      const systemInstruction = `You are a world-class Business Consultant and POS Expert for Khurasan.
      Your tasks:
      1. Analyze text or receipt images to identify transactions.
      2. Provide strategic advice on business development, cost reduction, and growth.
      3. For any transaction found, identify: Description, Amount, Type (INCOME, EXPENSE, or DUE), and Category.
      4. Language: Always respond in ${language === 'EN' ? 'English' : 'Bengali'}.
      
      If you detect transactions to be recorded, you MUST include a JSON block at the very end:
      { "transactions": [{"amount": 100, "description": "Item Name", "type": "INCOME", "category": "Sales"}] }`;

      parts.push({ text: input || "Please extract data from this memo and give me business growth advice." });

      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: { systemInstruction }
      });

      const aiResponse = response.text || "";
      
      // Attempt to extract JSON for automated entries
      let extractedData = null;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) extractedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("JSON parse error:", e);
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse.replace(/\{[\s\S]*\}/, '').trim(), data: extractedData }]);
      setInput('');
      setImagePreview(null);
    } catch (err) {
      console.error("AI Error:", err);
      const errorMsg = language === 'EN' 
        ? "Connection error. Please ensure you have an active internet connection." 
        : "সংযোগ বিচ্ছিন্ন হয়েছে। দয়া করে আপনার ইন্টারনেট চেক করুন।";
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const confirmEntry = (tx: any) => {
    addTransaction({
      amount: Number(tx.amount),
      description: tx.description,
      type: tx.type,
      category: tx.category || 'AI Entry',
      date: new Date().toISOString().split('T')[0]
    });
    alert(language === 'EN' ? 'Added to Ledger!' : 'হিসাবে যুক্ত করা হয়েছে!');
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-32 right-6 z-[100] w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-2 border-white/20"
    >
      <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-10"></div>
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
       <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-[35px] shadow-2xl flex flex-col h-[75vh] border-2 dark:border-gray-700 overflow-hidden">
          <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div>
                   <h3 className="font-black text-xs uppercase tracking-widest leading-none">AI Business Advisor</h3>
                   <p className="text-[8px] font-bold opacity-60 uppercase mt-1">Direct Connection Enabled</p>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6" /></svg>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
             {messages.length === 0 && (
                <div className="text-center py-20 opacity-30 flex flex-col items-center">
                   <svg className="w-12 h-12 mb-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                   <p className="text-[10px] font-black uppercase tracking-widest">{language === 'EN' ? 'How can I grow your business today?' : 'আজকে আপনার ব্যবসার উন্নতিতে কীভাবে সাহায্য করতে পারি?'}</p>
                   <p className="text-[8px] font-bold mt-2 text-gray-400 uppercase">{language === 'EN' ? 'Upload memos for auto-stock entry' : 'অটো স্টক এন্ট্রির জন্য মেমো আপলোড দিন'}</p>
                </div>
             )}
             {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] font-bold leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 dark:text-gray-100 rounded-bl-none border dark:border-gray-600'}`}>
                      {m.text}
                      {m.data?.transactions?.map((tx: any, idx: number) => (
                         <div key={idx} className="mt-4 p-4 bg-indigo-50 dark:bg-gray-800 rounded-2xl border-2 border-indigo-500/20">
                            <p className="text-[9px] font-black uppercase text-indigo-600 mb-1">Entry Detected</p>
                            <p className="text-[11px] font-black dark:text-white">{tx.description}</p>
                            <p className="text-lg font-black text-emerald-500">{user?.currency}{tx.amount.toLocaleString()}</p>
                            <button onClick={() => confirmEntry(tx)} className="w-full mt-3 py-2 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95 transition-all">Confirm Entry</button>
                         </div>
                      ))}
                   </div>
                </div>
             ))}
             {loading && <div className="text-[9px] font-black text-indigo-400 uppercase animate-pulse ml-2">AI is analyzing...</div>}
          </div>

          {imagePreview && (
             <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-lg shrink-0">
                   <img src={imagePreview} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                   <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Selected Document</p>
                   <button onClick={() => setImagePreview(null)} className="text-[9px] font-black text-rose-500 uppercase mt-1 hover:underline">Remove Image</button>
                </div>
             </div>
          )}

          <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2 items-center">
             <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-indigo-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
             </button>
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyPress={e => e.key === 'Enter' && processAIRequest()}
               placeholder={language === 'EN' ? 'Write record or ask advice...' : 'হিসাব লিখুন বা পরামর্শ চান...'} 
               className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-2 dark:border-gray-700 rounded-2xl outline-none font-bold text-xs focus:border-indigo-500 transition-all shadow-inner"
             />
             <button onClick={processAIRequest} disabled={loading} className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
             </button>
          </div>
       </div>
    </div>
  );
};

export default AIConsultant;
