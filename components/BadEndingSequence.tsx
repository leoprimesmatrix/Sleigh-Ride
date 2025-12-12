
import React, { useEffect, useState } from 'react';
import { RotateCcw, XCircle, MailOpen } from 'lucide-react';
import { REQUIRED_WISHES } from '../constants.ts';

interface BadEndingSequenceProps {
  onRestart: () => void;
  wishesCollected: number;
}

const BadEndingSequence: React.FC<BadEndingSequenceProps> = ({ onRestart, wishesCollected }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center transition-opacity duration-2000 ${opacity ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-slate-700 rounded-full opacity-30 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 3}s`
            }}
          />
        ))}
        {/* Gray snow */}
         {[...Array(30)].map((_, i) => (
            <div key={`snow-${i}`} className="absolute bg-slate-500 rounded-full opacity-40 animate-[bounce_10s_infinite_linear]" 
                 style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: '-10px',
                    animationDelay: `${Math.random() * 5}s`,
                    width: '4px', height: '4px'
                 }} 
            />
         ))}
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl px-8">
        <div className="flex flex-col items-center gap-4 mb-8">
            <XCircle size={80} className="text-slate-600 mb-4" />
            <h1 className="text-5xl md:text-7xl font-christmas text-slate-400 tracking-widest uppercase drop-shadow-xl">
                Christmas Cancelled
            </h1>
            <div className="h-px w-32 bg-slate-700 my-4"></div>
            <p className="text-xl text-slate-500 italic font-serif">
                "The sleigh arrived... but it was empty of hope."
            </p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4 text-2xl font-mono text-slate-300">
                <MailOpen size={24} className="text-slate-500" />
                <span>Collected Wishes:</span>
                <span className={`font-bold ${wishesCollected >= REQUIRED_WISHES ? 'text-green-500' : 'text-red-500'}`}>
                    {wishesCollected} / {REQUIRED_WISHES}
                </span>
            </div>
            <p className="text-sm text-slate-500 mt-2 uppercase tracking-widest">Target not met</p>
        </div>

        <button 
            onClick={onRestart}
            className="group relative px-8 py-4 bg-transparent border border-slate-600 text-slate-400 rounded-full font-bold text-lg hover:border-slate-400 hover:text-white transition-all overflow-hidden"
        >
            <div className="absolute inset-0 w-full h-full bg-slate-700 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 origin-left"></div>
            <div className="relative flex items-center gap-3">
                <RotateCcw size={20} /> Try Again
            </div>
        </button>
      </div>
    </div>
  );
};

export default BadEndingSequence;
