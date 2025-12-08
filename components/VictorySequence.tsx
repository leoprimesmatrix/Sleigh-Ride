
import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Gift, Music } from 'lucide-react';

interface VictorySequenceProps {
  onRestart: () => void;
}

const VictorySequence: React.FC<VictorySequenceProps> = ({ onRestart }) => {
  const [stage, setStage] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const credits = [
    { role: "Creative Director", name: "Santa Claus" },
    { role: "Lead Pilot", name: "Rudolph Red" },
    { role: "Navigation Systems", name: "North Star GPS" },
    { role: "Senior Elf Engineer", name: "Buddy" },
    { role: "Sleigh Mechanics", name: "Fix-It Felix" },
    { role: "Magic Particles", name: "Pixie Dust Corp" },
    { role: "Cloud Infrastructure", name: "Cumulonimbus & Co." },
    { role: "Lighting", name: "The Northern Lights" },
    { role: "Soundtrack", name: "Jingle Bell Rockers" },
    { role: "Frontend Architecture", name: "React & TypeScript" },
    { role: "Visual Effects", name: "Canvas API" },
    { role: "Audio Engineering", name: "Web Audio API" },
    { role: "Toy Distribution", name: "Global Logistics Team" },
    { role: "Reindeer Wrangler", name: "Hagrid (Holiday Relief)" },
    { role: "Chimney Specialist", name: "Sooty & Sweep" },
    { role: "Cookie Taste Tester", name: "Santa (Again)" },
    { role: "Naughty List Auditor", name: "Krampus Consulting" },
    { role: "Executive Producer", name: "The Spirit of Christmas" },
    { role: "Played By", name: "YOU" }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500); 
    const timer2 = setTimeout(() => setStage(2), 3500); 
    const timer3 = setTimeout(() => setStage(3), 14000); 
    const timer4 = setTimeout(() => setShowButton(true), 35000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2 + Math.sin(time / 500) * 5);
      ctx.scale(1.5, 1.5);
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 10;
      const grad = ctx.createLinearGradient(0, -20, 0, 20);
      grad.addColorStop(0, "#dc2626");
      grad.addColorStop(1, "#991b1b");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-30, 10);
      ctx.bezierCurveTo(-20, 25, 20, 25, 30, 10);
      ctx.lineTo(30, -5);
      ctx.lineTo(-30, -5);
      ctx.fill();
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-25, 20);
      ctx.lineTo(25, 20);
      ctx.moveTo(-25, 20);
      ctx.bezierCurveTo(-35, 15, -35, 5, -25, 5);
      ctx.stroke();
      ctx.fillStyle = "#fca5a5"; 
      ctx.beginPath(); ctx.arc(0, -15, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(0, -12, 8, 0, Math.PI); ctx.fill();
      ctx.fillStyle = "red"; 
      ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(8, -18); ctx.lineTo(0, -30); ctx.fill();
      ctx.fillStyle = "white"; 
      ctx.beginPath(); ctx.arc(0, -30, 3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      animationId = requestAnimationFrame(render);
    };
    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 z-50 flex flex-col items-center justify-center overflow-hidden text-white">
      
      <style>
        {`
          @keyframes credit-scroll {
            0% { transform: translateY(100%); opacity: 0; }
            5% { opacity: 1; }
            100% { transform: translateY(-150%); opacity: 1; }
          }
          .animate-credit-scroll {
            animation: credit-scroll 60s linear forwards; /* Slower, longer scroll */
            animation-delay: 4s; /* Pause before starting */
            opacity: 0; /* Hidden initially until animation starts */
            animation-fill-mode: forwards;
          }
          
          @keyframes firework {
            0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
            50% { width: 0.5rem; opacity: 1; }
            100% { width: var(--finalSize); opacity: 0; }
          }
          .firework,
          .firework::before,
          .firework::after {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0.5rem;
            aspect-ratio: 1;
            background: radial-gradient(circle, var(--color) 20%, #0000 0) 50% 0% / 50% 50%, 
                        radial-gradient(circle, var(--color) 20%, #0000 0) 0% 50% / 50% 50%, 
                        radial-gradient(circle, var(--color) 20%, #0000 0) 50% 100% / 50% 50%, 
                        radial-gradient(circle, var(--color) 20%, #0000 0) 100% 50% / 50% 50%;
            background-repeat: no-repeat;
            transform: translate(-50%, -50%);
            animation: firework 2s infinite;
          }
          .firework::before { transform: translate(-50%, -50%) rotate(45deg); }
          .firework::after { transform: translate(-50%, -50%) rotate(-45deg); }
        `}
      </style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div key={`star-${i}`} className="absolute bg-white rounded-full opacity-50 animate-pulse"
              style={{
                top: `${Math.random() * 70}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}

          {stage >= 3 && [...Array(5)].map((_, i) => (
             <div key={`fw-${i}`} className="firework"
                style={{
                    top: `${Math.random() * 50}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    '--color': ['#ef4444', '#eab308', '#3b82f6', '#22c55e'][Math.floor(Math.random() * 4)],
                    '--initialSize': '0.5rem',
                    '--finalSize': '10rem',
                    '--x': '-50%',
                    '--initialY': '-50%'
                }}
             ></div>
          ))}

          <div className="absolute bottom-0 left-0 right-0 h-64 opacity-90 z-10 transition-transform duration-[20s] ease-linear" style={{ transform: stage >= 3 ? 'scale(1.05)' : 'scale(1)' }}>
               
               <div className="absolute bottom-0 w-full h-48 flex items-end justify-around px-4 opacity-60 text-slate-800">
                   {[...Array(20)].map((_, i) => (
                       <div key={`b1-${i}`} className="w-full mx-0.5 bg-current rounded-t-md" style={{ height: `${30 + Math.random() * 40}%` }}></div>
                   ))}
               </div>

               <div className="absolute bottom-0 w-full h-40 flex items-end justify-around px-2 text-slate-900 opacity-80">
                   {[...Array(15)].map((_, i) => (
                       <div key={`b2-${i}`} className="w-full mx-1 bg-current rounded-t-lg relative" style={{ height: `${40 + Math.random() * 50}%` }}>
                           {Math.random() > 0.5 && <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-600/50 rounded-full" />}
                       </div>
                   ))}
               </div>

               <div className="absolute bottom-0 w-full h-32 flex items-end justify-around text-black">
                   {[...Array(30)].map((_, i) => (
                       <div key={`b3-${i}`} className="w-full mx-0.5 bg-current rounded-t-sm relative group" style={{ height: `${20 + Math.random() * 80}%` }}>
                           {Math.random() > 0.3 && (
                               <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(250,204,21,0.8)]" 
                                    style={{ animationDelay: `${Math.random() * 5}s` }} />
                           )}
                           {Math.random() > 0.6 && (
                               <div className="absolute top-6 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-200 rounded-full" />
                           )}
                       </div>
                   ))}
               </div>
          </div>
      </div>

      <div className={`transition-all duration-1000 transform ${stage === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 absolute'} z-20 flex flex-col items-center`}>
         <div className="mb-8"><canvas ref={canvasRef} width={150} height={100} /></div>
      </div>

      <div className={`absolute inset-0 flex items-center justify-center px-8 transition-opacity duration-1000 ${stage === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-30`}>
        <div className="max-w-3xl text-center space-y-8">
            <p className="text-3xl md:text-5xl font-christmas leading-relaxed text-blue-100 drop-shadow-lg">
                "Somewhere in this world,<br/>someone is thinking about you now."
            </p>
            <p className="text-3xl md:text-5xl font-christmas leading-relaxed text-blue-100 drop-shadow-lg delay-1000 animate-fade-in">
                "Take a leap of faith,<br/>and find your love."
            </p>
        </div>
      </div>

      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${stage >= 3 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} z-40 overflow-hidden`}>
        
        <div className={`absolute top-10 md:top-20 transition-all duration-1000 z-50 text-center ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
             <h1 className="text-5xl md:text-7xl font-christmas text-red-500 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] animate-pulse-slow">Merry Christmas</h1>
        </div>

        <div className="h-[60vh] w-full max-w-lg relative overflow-hidden mt-20 mask-linear-fade z-40">
            <div className="absolute top-0 left-0 w-full flex flex-col items-center space-y-8 md:space-y-12 animate-credit-scroll" style={{ transform: 'translateY(100%)' }}>
                {credits.map((credit, idx) => (
                    <div key={idx} className="text-center group">
                        <p className="text-slate-400 text-xs md:text-sm uppercase tracking-[0.2em] mb-1 group-hover:text-yellow-400 transition-colors">{credit.role}</p>
                        <p className="text-white font-bold text-xl md:text-2xl font-christmas">{credit.name}</p>
                    </div>
                ))}
                <div className="pt-8 pb-16 flex flex-col items-center gap-4">
                    <Sparkles className="text-yellow-400 animate-spin-slow" size={48} />
                    <p className="text-slate-500 text-sm italic">Thank you for playing.</p>
                </div>
            </div>
        </div>

        <div className={`absolute bottom-12 md:bottom-16 transition-all duration-1000 transform z-50 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button 
            onClick={onRestart}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all transform hover:scale-105 flex items-center gap-3"
          >
            <Gift size={24} /> Deliver Hope Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictorySequence;