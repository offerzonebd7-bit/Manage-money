
import React, { useState, useEffect, useRef } from 'react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState('');
  const [pos, setPos] = useState({ x: window.innerWidth - 350, y: window.innerHeight - 550 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });

  useEffect(() => {
    try {
      if (input && /[+\-*/%]/.test(input)) {
        const cleanInput = input.replace(/[^-()\d/*+.]/g, '');
        const res = eval(cleanInput);
        setPreview(res.toString());
      } else {
        setPreview('');
      }
    } catch {
      setPreview('');
    }
  }, [input]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragRef.current.startX)),
        y: Math.max(0, Math.min(window.innerHeight - 500, e.clientY - dragRef.current.startY))
      });
    };
    const handleMouseUp = () => setDragging(false);

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  if (!isOpen) return null;

  const handleDragStart = (e: React.MouseEvent) => {
    setDragging(true);
    dragRef.current = {
      startX: e.clientX - pos.x,
      startY: e.clientY - pos.y
    };
  };

  const handleClick = (val: string) => setInput(prev => prev + val);
  const handleClear = () => { setInput(''); setPreview(''); };
  const handleBackspace = () => setInput(prev => prev.slice(0, -1));
  const handleEqual = () => {
    try {
      const cleanInput = input.replace(/[^-()\d/*+.]/g, '');
      const res = eval(cleanInput);
      setInput(res.toString());
      setPreview('');
    } catch {
      setInput('Error');
    }
  };

  const btnClass = "p-4 text-sm font-black rounded-xl transition-all active:scale-90 shadow-sm flex items-center justify-center";
  const numBtn = `${btnClass} bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600`;
  const opBtn = `${btnClass} bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100`;
  const actBtn = `${btnClass} bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200`;

  return (
    <div 
      className="fixed z-[100] w-80 bg-white dark:bg-gray-800 rounded-[30px] shadow-2xl border-2 border-primary/20 overflow-hidden select-none"
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
    >
      <div 
        onMouseDown={handleDragStart}
        className="bg-primary p-4 text-white flex justify-between items-center cursor-move"
      >
        <span className="font-black text-[9px] uppercase tracking-[0.3em] flex items-center">
          Calculator (Drag Me)
        </span>
        <button onMouseDown={e => e.stopPropagation()} onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-5 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-right min-h-[60px] flex flex-col justify-end">
          <div className="text-gray-400 text-xs font-mono truncate tracking-widest">{input || '0'}</div>
          <div className="text-3xl font-black dark:text-white truncate mt-1">
            {preview ? <span className="opacity-30">≈ {preview}</span> : (input || '0')}
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-4 gap-2 bg-white dark:bg-gray-800">
        <button onClick={handleClear} className={actBtn}>AC</button>
        <button onClick={handleBackspace} className={actBtn}>
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
        </button>
        <button onClick={() => handleClick('%')} className={opBtn}>%</button>
        <button onClick={() => handleClick('/')} className={opBtn}>÷</button>
        <button onClick={() => handleClick('7')} className={numBtn}>7</button>
        <button onClick={() => handleClick('8')} className={numBtn}>8</button>
        <button onClick={() => handleClick('9')} className={numBtn}>9</button>
        <button onClick={() => handleClick('*')} className={opBtn}>×</button>
        <button onClick={() => handleClick('4')} className={numBtn}>4</button>
        <button onClick={() => handleClick('5')} className={numBtn}>5</button>
        <button onClick={() => handleClick('6')} className={numBtn}>6</button>
        <button onClick={() => handleClick('-')} className={opBtn}>-</button>
        <button onClick={() => handleClick('1')} className={numBtn}>1</button>
        <button onClick={() => handleClick('2')} className={numBtn}>2</button>
        <button onClick={() => handleClick('3')} className={numBtn}>3</button>
        <button onClick={() => handleClick('+')} className={opBtn}>+</button>
        <button onClick={() => handleClick('0')} className={numBtn}>0</button>
        <button onClick={() => handleClick('00')} className={numBtn}>00</button>
        <button onClick={() => handleClick('.')} className={numBtn}>.</button>
        <button onClick={handleEqual} className="bg-primary text-white p-4 rounded-xl font-black shadow-lg hover:opacity-90 transition-all active:scale-95">=</button>
      </div>
    </div>
  );
};

export default Calculator;
