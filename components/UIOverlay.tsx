
import React, { useEffect, useState } from 'react';
import { Heart, Snowflake, Clock, Zap, Sparkles, Plus, Mail, Skull } from 'lucide-react';
import { Player, PowerupType, DialogueLine, LetterVariant } from '../types.ts';
import { POWERUP_COLORS, REQUIRED_WISHES } from '../constants.ts';

interface UIOverlayProps {
  lives: number;
  snowballs: number;
  progress: number;
  timeLeft: number;
  activePowerups: Player['speedTimer'] | Player['healingTimer'];
  currentLevelName: string;
  score: number;
  collectedPowerups: { id: number; type: PowerupType }[];
  activeDialogue: DialogueLine | null;
  activeWish: { message: string, variant: LetterVariant } | null;
  wishesCollected: number;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  lives,
  snowballs,
  progress,
  timeLeft,
  currentLevelName,
  activePowerups,
  score,
  collectedPowerups,
  activeDialogue,
  activeWish,
  wishesCollected
}) => {
  
  const [popups, setPopups] = useState<{id: number, type: PowerupType}[]>([]);

  useEffect(() => {
    if (collectedPowerups.length > 0) {
      setPopups(prev => [...prev, ...collectedPowerups]);
    }
  }, [collectedPowerups]);

  const handleAnimationEnd = (id: number) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  const getPowerupConfig = (type: PowerupType) => {
      switch (type) {
          case PowerupType.SPEED: return { icon: Zap, label: "SPEED UP!", color: POWERUP_COLORS[type] };
          case PowerupType.SNOWBALLS: return { icon: Snowflake, label: "AMMO!", color: POWERUP_COLORS[type] };
          case PowerupType.BLAST: return { icon: Sparkles, label: "BLAST!", color: POWERUP_COLORS[type] };
          case PowerupType.HEALING: return { icon: Plus, label: "HEAL!", color: POWERUP_COLORS[type] };
          case PowerupType.LIFE: return { icon: Heart, label: "EXTRA LIFE!", color: POWERUP_COLORS[type] };
          default: return { icon: Zap, label: "POWERUP!", color: "#fff" };
      }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isLowTime = timeLeft < 30;
  
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-2 md:p-6 pointer-events-none z-20">
      
      {/* Powerup Popups */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {popups.map(p => {
            const { icon: Icon, label, color } = getPowerupConfig(p.type);
            return (
                <div 
                    key={p.id} 
                    className="absolute animate-powerup-pop flex flex-col items-center justify-center"
                    onAnimationEnd={() => handleAnimationEnd(p.id)}
                >
                    <div className="p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-md shadow-[0_0_30px_currentColor] border-2 border-white/50 mb-2" style={{ color: color }}>
                        <Icon className="w-8 h-8 md:w-12 md:h-12" strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-xl md:text-2xl uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-stroke" style={{ color: color }}>{label}</span>
                </div>
            );
        })}
      </div>

      {/* Wishes Notification */}
      {activeWish && activeWish.variant !== 'VILLAIN' && (
          <div className="absolute top-20 right-2 md:top-28 md:right-4 flex flex-col items-end animate-slide-in-right z-30">
             <div className={`
                 pl-3 pr-4 py-1.5 md:pl-4 md:pr-6 md:py-2 rounded-l-full shadow-xl border-l-4 backdrop-blur-sm max-w-[200px] md:max-w-xs text-right flex items-center gap-3 transform hover:scale-105 transition-transform
                 ${activeWish.variant === 'SAD' 
                    ? 'bg-slate-800/95 text-slate-300 border-slate-500' 
                    : 'bg-amber-100/95 text-amber-900 border-amber-400'
                 }
             `}>
                 <div className={`p-1.5 md:p-2 rounded-full ${activeWish.variant === 'SAD' ? 'bg-slate-700/50' : 'bg-amber-200/50'}`}>
                    {activeWish.variant === 'SAD' 
                      ? <Mail className="w-4 h-4 md:w-[18px] md:h-[18px] text-slate-400" />
                      : <Mail className="w-4 h-4 md:w-[18px] md:h-[18px] text-amber-700" />
                    }
                 </div>
                 <div className="flex flex-col">
                     <span className={`text-[8px] md:text-[10px] uppercase tracking-widest font-bold ${activeWish.variant === 'SAD' ? 'text-slate-500' : 'text-amber-600/70'}`}>
                        {activeWish.variant === 'SAD' ? 'Lost Letter' : 'Wish Collected'}
                     </span>
                     <p className="font-christmas text-sm md:text-lg leading-tight italic">"{activeWish.message}"</p>
                 </div>
             </div>
          </div>
      )}

      {/* Villain Card Display */}
      {activeWish && activeWish.variant === 'VILLAIN' && (
          <div className="absolute inset-0 flex items-center justify-center z-50 animate-fade-in-up pointer-events-auto p-4">
             <div className="relative bg-slate-950 border-4 border-red-900 p-4 md:p-8 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.5)] max-w-sm md:max-w-2xl text-center transform scale-100 hover:scale-105 transition-transform duration-500">
                <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-red-900 rounded-full p-3 md:p-4 border-2 border-red-600 animate-pulse">
                    <Skull className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-3xl font-christmas text-red-500 mb-3 md:mb-6 uppercase tracking-widest drop-shadow-md">A Promise of Vengeance</h3>
                <p className="text-sm md:text-2xl font-serif text-slate-300 leading-relaxed italic border-t border-b border-red-900/50 py-4 md:py-6">
                    "{activeWish.message}"
                </p>
                <div className="mt-2 md:mt-4 text-[10px] md:text-xs text-red-700 uppercase tracking-[0.3em] font-bold">
                    The Origin of Evil
                </div>
             </div>
          </div>
      )}

      {/* Dialogue Box */}
      {activeDialogue && (
          <div className="absolute bottom-16 md:bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pb-4 pt-8 md:pb-8 md:pt-12 flex justify-center animate-slide-up z-20">
             <div className="flex flex-col items-center text-center max-w-3xl px-4">
                <h4 className={`font-bold uppercase text-xs md:text-sm tracking-[0.2em] mb-1 drop-shadow-md ${activeDialogue.speaker === 'Santa' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {activeDialogue.speaker}
                </h4>
                <p className="text-lg md:text-2xl text-white font-christmas tracking-wide leading-snug drop-shadow-lg text-shadow-black">
                    "{activeDialogue.text}"
                </p>
             </div>
          </div>
      )}

      <div className="flex items-start justify-between w-full z-10">
        
        {/* Left Stats: Lives, Ammo, Wishes */}
        <div className="flex flex-col gap-2 md:gap-3 animate-slide-in-left origin-top-left scale-90 md:scale-100">
          <div className="flex items-center gap-1 p-1.5 md:p-2 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg w-fit">
            {[1, 2, 3].map((i) => (
                <div key={i} className="relative w-6 h-6 md:w-8 md:h-8">
                  {i <= lives ? (
                    <div className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse-slow">
                       <Heart fill="currentColor" className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                  ) : (
                     <div className="text-slate-600 opacity-50 scale-90 grayscale"><Heart fill="currentColor" className="w-6 h-6 md:w-8 md:h-8" /></div>
                  )}
                </div>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3 bg-cyan-900/40 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] w-fit">
            <Snowflake className="w-4 h-4 md:w-5 md:h-5 text-cyan-300 animate-spin-slow" />
            <span className="font-black text-lg md:text-xl text-cyan-100 tabular-nums">{snowballs}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-3 bg-amber-900/40 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] w-fit">
             <div className="relative">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-amber-300" />
                {wishesCollected >= REQUIRED_WISHES && (
                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                )}
             </div>
             <span className={`font-black text-lg md:text-xl tabular-nums ${wishesCollected >= REQUIRED_WISHES ? 'text-green-300' : 'text-amber-100'}`}>
                 {wishesCollected}/{REQUIRED_WISHES}
             </span>
          </div>
        </div>

        {/* Center: Timer & Level Name */}
        <div className="flex flex-col items-center animate-fade-in-down origin-top scale-90 md:scale-100">
          <div className={`
            flex items-center gap-2 md:gap-3 text-xl md:text-3xl font-black px-4 py-1.5 md:px-6 md:py-2 rounded-xl shadow-2xl transition-all duration-500 border-2
            ${isLowTime ? 'bg-red-600/90 border-red-400 animate-pulse text-white' : 'bg-slate-900/60 border-slate-700 text-yellow-300 backdrop-blur-md'}
          `}>
            <Clock className={`w-5 h-5 md:w-7 md:h-7 ${isLowTime ? 'animate-spin' : ''}`} />
            <span className="tabular-nums tracking-widest font-mono">{formatTime(timeLeft)}</span>
          </div>
          
          <div className="mt-1 md:mt-2 text-center">
            <h2 className="text-white font-christmas text-xl md:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wide text-stroke">
                {currentLevelName}
            </h2>
          </div>
        </div>

        {/* Right: Score */}
        <div className="animate-slide-in-right origin-top-right scale-90 md:scale-100">
             <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-2xl border border-slate-700 shadow-lg text-right">
                <div className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Score</div>
                <div className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600 tabular-nums">
                    {Math.floor(score).toLocaleString()}
                </div>
             </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto mb-2 md:mb-12 animate-slide-up z-10 opacity-80 hover:opacity-100 transition-opacity">
         <div className="flex justify-between text-xs font-bold mb-1 px-1 text-slate-300 uppercase tracking-wider drop-shadow-md">
            <span>North Pole</span>
            <span>The World</span>
         </div>
         <div className="h-2 md:h-3 bg-slate-800/80 rounded-full border border-slate-600/50 overflow-visible relative backdrop-blur-sm shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-green-500 to-red-600 bg-[length:50px_50px] animate-[shimmer_2s_linear_infinite] rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-200 ease-linear"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 ease-linear z-10"
              style={{ left: `${Math.min(99, Math.max(0, progress))}%` }}
            >
               <div className="text-xl md:text-2xl filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] -translate-x-1/2 -translate-y-1">🎅</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default UIOverlay;
