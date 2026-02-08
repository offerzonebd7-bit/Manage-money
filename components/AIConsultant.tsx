
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useApp } from '../App';

const AIConsultant: React.FC = () => {
  const { user, transactions, addTransaction, t, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, data?: any }[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    
    const userMsg = input || (language === 'EN' ? "Analyzing memo image..." : "মেমো ইমেজ বিশ্লেষণ করা হচ্ছে...");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    try {
      const model = 'gemini-3-flash-preview';
      let contents: any[] = [];
      
      if (imagePreview) {
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imagePreview.split(',')[1],
          },
        });
      }
      
      const systemPrompt = `You are the Khurasan POS AI Assistant. 
      Your goals:
      1. Analyze business text or receipt images.
      2. Extract transactions: amount, description, type (INCOME, EXPENSE, DUE), and category.
      3. Provide business growth advice based on user data.
      User Language: ${language === 'EN' ? 'English' : 'Bengali'}.
      
      If the user wants to add data, ALWAYS return a JSON block at the end of your response like this:
      { "transactions": [{"amount": 500, "description": "Memo items", "type": "EXPENSE", "category": "Purchase"}] }`;

      contents.push({ text: input || "Extract data from this memo image and suggest business improvements." });

      const response = await ai.models.generateContent({
        model,
        contents: { parts: contents },
        config: { systemInstruction: systemPrompt }
      });

      const aiResponse = response.text || "";
      
      // Parse potential JSON for automated entry
      let extractedData = null;
      try {
        const jsonMatch = aiResponse.match(/\{.*\}/s);
        if (jsonMatch) extractedData = JSON.parse(jsonMatch[0]);
      } catch (e) {}

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse.replace(/\{.*\}/s, ''), data: extractedData }]);
      setInput('');
      setImagePreview(null);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Could not connect to AI. Please check internet." }]);
    } finally {
      setLoading(false);
    }
  };

  const confirmEntry = (tx: any) => {
    addTransaction({
      amount: tx.amount,
      description: tx.description,
      type: tx.type,
      category: tx.category,
      date: new Date().toISOString().split('T')[0]
    });
    alert(language === 'EN' ? 'Transaction Added!' : 'লেনদেন যুক্ত হয়েছে!');
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-32 right-6 z-[100] w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
    >
      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping group-hover:hidden"></div>
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in">
       <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl flex flex-col h-[80vh] border-4 border-indigo-500/20 overflow-hidden relative">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shadow-lg">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div>
                   <h3 className="font-black text-sm uppercase tracking-widest">Khurasan AI Expert</h3>
                   <p className="text-[9px] font-bold opacity-70 uppercase">Powered by Graphico Global</p>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6" /></svg>
             </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
             {messages.length === 0 && (
                <div className="text-center py-10 opacity-50">
                   <p className="text-sm font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{language === 'EN' ? 'Ask me anything about your business' : 'ব্যবসা নিয়ে যেকোনো প্রশ্ন করুন'}</p>
                   <p className="text-[10px] font-bold mt-2 text-gray-400 uppercase">{language === 'EN' ? 'Upload memos for auto-entry' : 'অটো-এন্ট্রির জন্য মেমো আপলোড দিন'}</p>
                </div>
             )}
             {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-4 rounded-[25px] text-xs font-bold leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
                      {m.text}
                      {m.data?.transactions?.map((tx: any, idx: number) => (
                         <div key={idx} className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-indigo-500/20 text-gray-900 dark:text-white">
                            <p className="text-[8px] font-black uppercase text-indigo-500 mb-1">Entry Detected</p>
                            <p className="text-[11px] font-black">{tx.description}</p>
                            <p className="text-lg font-black text-emerald-500">{user?.currency || '৳'}{tx.amount}</p>
                            <button onClick={() => confirmEntry(tx)} className="w-full mt-3 py-2 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase">Confirm & Add</button>
                         </div>
                      ))}
                   </div>
                </div>
             ))}
             {loading && <div className="flex justify-start"><div className="bg-gray-100 p-4 rounded-full animate-pulse text-[10px] font-black uppercase">AI is thinking...</div></div>}
          </div>

          {/* Image Preview Hook */}
          {imagePreview && (
             <div className="px-6 pb-2">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-indigo-500">
                   <img src={imagePreview} className="w-full h-full object-cover" />
                   <button onClick={() => setImagePreview(null)} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
             </div>
          )}

          {/* Input Area */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex gap-3 items-center">
             <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white dark:bg-gray-800 text-gray-400 rounded-2xl border-2 hover:border-indigo-500 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
             </button>
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyPress={e => e.key === 'Enter' && processAIRequest()}
               placeholder={language === 'EN' ? 'Talk to business manager...' : 'হিসাব লিখুন বা পরামর্শ চান...'} 
               className="flex-1 px-5 py-3.5 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-2xl outline-none font-bold text-xs"
             />
             <button onClick={processAIRequest} disabled={loading} className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
             </button>
          </div>
       </div>
    </div>
  );
};

export default AIConsultant;
