
import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Gift } from 'lucide-react';

interface VictorySequenceProps {
  onRestart: () => void;
}

const VictorySequence: React.FC<VictorySequenceProps> = ({ onRestart }) => {
  const [stage, setStage] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500); 
    const timer2 = setTimeout(() => setStage(2), 3500); 
    const timer3 = setTimeout(() => setStage(3), 14000); 

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Simple Santa idle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(1.5, 1.5);
      // Shadow
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 10;
      // Sleigh Body
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
      // Runners
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-25, 20);
      ctx.lineTo(25, 20);
      ctx.moveTo(-25, 20);
      ctx.bezierCurveTo(-35, 15, -35, 5, -25, 5);
      ctx.stroke();
      // Santa
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
    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center overflow-hidden text-white">
      
      {/* Background Stars */}
      <div className="absolute inset-0 opacity-50 animate-pulse">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
            }}
          />
        ))}
      </div>

      {/* Stage 1: Arrival */}
      <div className={`transition-all duration-1000 transform ${stage === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 absolute'} z-20 flex flex-col items-center`}>
         <div className="mb-8"><canvas ref={canvasRef} width={150} height={100} /></div>
      </div>

      {/* Stage 2: The Message */}
      <div className={`absolute inset-0 flex items-center justify-center px-8 transition-opacity duration-1000 ${stage === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-30`}>
        <div className="max-w-3xl text-center space-y-8">
            <p className="text-3xl font-christmas leading-relaxed text-blue-100 drop-shadow-lg">
                "Somewhere in this world,<br/>someone is thinking about you now."
            </p>
            <p className="text-3xl font-christmas leading-relaxed text-blue-100 drop-shadow-lg delay-1000 animate-fade-in">
                "They think about caring for you.<br/>Stressing because they love you profoundly."
            </p>
            <p className="text-4xl font-bold text-yellow-400 mt-8 font-christmas animate-pulse">
                Take a leap of faith, and find your love.
            </p>
        </div>
      </div>

      {/* Stage 3: Credits & Restart */}
      <div className={`absolute inset-0 bg-black/90 flex flex-col items-center justify-center transition-opacity duration-1000 ${stage >= 3 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} z-40`}>
        <div className="text-center space-y-6 max-w-md mx-auto">
          <h1 className="text-6xl font-christmas text-red-500 mb-8">Merry Christmas</h1>
          
          <div className="space-y-2 text-slate-300">
            <p>Concept & Design</p>
            <p className="text-white font-bold">The Senior Frontend Engineer</p>
          </div>
          
          <button 
            onClick={onRestart}
            className="mt-12 px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-red-500/50 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Gift size={20} /> Deliver Hope Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictorySequence;
