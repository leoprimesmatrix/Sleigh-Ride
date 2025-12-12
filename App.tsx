
import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas.tsx';
import VictorySequence from './components/VictorySequence.tsx';
import BadEndingSequence from './components/BadEndingSequence.tsx';
import { GameState, PowerupType, GameMode } from './types.ts';
import { POWERUP_COLORS } from './constants.ts';
import { Play, RefreshCw, HelpCircle, ArrowLeft, Loader2, FileText, X, Bell, Gift, Lock, Infinity as InfinityIcon } from 'lucide-react';

const CURRENT_VERSION = '1.0.0';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.STORY);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Connecting to servers...");
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  
  const [isStoryComplete, setIsStoryComplete] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  const [introStage, setIntroStage] = useState(0);

  // Wrapper to capture state changes from GameCanvas
  const handleGameStateChange = (newState: GameState) => {
      setGameState(newState);
  };

  useEffect(() => {
    const savedVersion = localStorage.getItem('sleigh_ride_version');
    if (savedVersion !== CURRENT_VERSION) {
      setShowUpdateNotification(true);
    }
    
    const storyComplete = localStorage.getItem('sleigh_ride_story_complete') === 'true';
    const introSeen = localStorage.getItem('sleigh_ride_intro_seen') === 'true';
    
    setIsStoryComplete(storyComplete);
    setHasSeenIntro(introSeen);
  }, []);
  
  useEffect(() => {
    if (gameState === GameState.INTRO) {
        if (hasSeenIntro) {
            const t = setTimeout(() => setGameState(GameState.PLAYING), 2000);
            return () => clearTimeout(t);
        }

        const t1 = setTimeout(() => setIntroStage(1), 4000);
        const t2 = setTimeout(() => setIntroStage(2), 8000);
        const t3 = setTimeout(() => setIntroStage(3), 11000);
        const t4 = setTimeout(() => setIntroStage(4), 14000);
        const t5 = setTimeout(() => {
            localStorage.setItem('sleigh_ride_intro_seen', 'true');
            setHasSeenIntro(true);
            setGameState(GameState.PLAYING);
        }, 17000);

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
        };
    } else {
        setIntroStage(0);
    }
  }, [gameState, hasSeenIntro]);

  const handleStartClick = (mode: GameMode) => {
    if (mode === GameMode.ENDLESS && !isStoryComplete) return;

    setGameMode(mode);
    setIsLoading(true);
    setLoadingText(mode === GameMode.STORY ? "Synchronizing North Pole Data..." : "Calibrating Infinite Loop...");
    
    setTimeout(() => {
        setIsLoading(false);
        setGameState(GameState.INTRO); 
    }, 1500);
  };

  const handleWin = () => {
      setGameState(GameState.VICTORY);
      if (gameMode === GameMode.STORY && !isStoryComplete) {
          setIsStoryComplete(true);
          localStorage.setItem('sleigh_ride_story_complete', 'true');
      }
  };

  const restartGame = () => setGameState(GameState.MENU);

  const handleDismissUpdate = () => {
    setShowUpdateNotification(false);
    localStorage.setItem('sleigh_ride_version', CURRENT_VERSION);
  };

  const handleViewUpdateNotes = () => {
    setShowUpdateNotification(false);
    setShowPatchNotes(true);
    localStorage.setItem('sleigh_ride_version', CURRENT_VERSION);
  };

  const skipIntro = () => {
      localStorage.setItem('sleigh_ride_intro_seen', 'true');
      setHasSeenIntro(true);
      setGameState(GameState.PLAYING);
  };

  return (
    <div className="h-screen overflow-y-auto bg-slate-950 flex flex-col items-center justify-center p-4 select-none font-sans">
      
      {gameState === GameState.MENU && !isLoading && (
        <div className="text-center space-y-2 md:space-y-4 animate-fade-in w-full max-w-2xl my-auto py-2">
          <div className="w-full flex justify-center px-4">
             <div className="animate-bounce-slow w-full flex justify-center">
                 <img 
                   src="./logo.png" 
                   alt="Sleigh Ride" 
                   className="block w-full max-w-[80%] md:max-w-[500px] h-auto hover:scale-105 transition-transform duration-500 object-contain"
                 />
             </div>
          </div>
          <p className="text-lg md:text-xl text-blue-200 font-bold tracking-widest uppercase text-shadow-glow">COLLECT THE LETTERS. SAVE CHRISTMAS!</p>
          
          <div className="bg-slate-900/80 p-6 md:p-8 rounded-2xl border-2 border-slate-700 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-600 mx-4">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Select Mission</h2>
            
            <div className="flex flex-col gap-4 md:flex-row justify-center items-stretch mb-8">
                <button 
                    onClick={() => handleStartClick(GameMode.STORY)}
                    className="flex-1 py-6 px-4 bg-gradient-to-b from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white rounded-xl shadow-lg transform transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 group border border-green-400/30"
                >
                    <Play fill="currentColor" className="group-hover:scale-110 transition-transform mb-2" size={32} /> 
                    <span className="font-black text-2xl font-christmas">STORY MODE</span>
                    <span className="text-xs text-green-200 uppercase tracking-widest">Save Christmas</span>
                </button>

                <button 
                    onClick={() => handleStartClick(GameMode.ENDLESS)}
                    disabled={!isStoryComplete}
                    className={`flex-1 py-6 px-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 border transition-all ${
                        isStoryComplete 
                        ? 'bg-gradient-to-b from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white border-purple-400/30 transform hover:scale-105 cursor-pointer' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-70'
                    }`}
                >
                    {isStoryComplete ? (
                        <>
                            <InfinityIcon className="group-hover:spin transition-transform mb-2" size={32} />
                            <span className="font-black text-2xl font-christmas">ENDLESS MODE</span>
                            <span className="text-xs text-purple-200 uppercase tracking-widest">Survival</span>
                        </>
                    ) : (
                        <>
                            <Lock className="mb-2" size={32} />
                            <span className="font-black text-2xl font-christmas">LOCKED</span>
                            <span className="text-xs uppercase tracking-widest">Beat Story First</span>
                        </>
                    )}
                </button>
            </div>
            
            <div className="flex gap-3 md:gap-4 justify-center">
                <button 
                  onClick={() => setGameState(GameState.HELP)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold shadow-lg transform transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                >
                  <HelpCircle size={18} /> Help
                </button>

                <button 
                  onClick={() => setShowPatchNotes(true)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg transform transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                >
                  <FileText size={18} /> Patch Notes
                </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateNotification && gameState === GameState.MENU && !isLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 animate-fade-in">
           <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-yellow-500/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/10 blur-2xl rounded-full pointer-events-none"></div>
              
              <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 text-yellow-400 animate-pulse">
                  <Bell size={32} />
              </div>
              
              <h2 className="text-2xl font-christmas text-white mb-2">Official Release!</h2>
              <p className="text-slate-300 text-sm mb-6">
                Sleigh Ride v{CURRENT_VERSION} is here. Join Santa on his biggest adventure yet!
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleViewUpdateNotes}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
                >
                  <FileText size={18} /> Read Patch Notes
                </button>
                <button 
                  onClick={handleDismissUpdate}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-bold transition-colors"
                >
                  Maybe Later
                </button>
              </div>
           </div>
        </div>
      )}

      {showPatchNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-600 rounded-xl max-w-lg w-full p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
               <button onClick={() => setShowPatchNotes(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
               </button>
               <h2 className="text-2xl font-christmas text-yellow-400 mb-4 pr-8">PrimeDev Studios Presents: v{CURRENT_VERSION}</h2>
               
               <div className="space-y-6 text-slate-300 text-sm overflow-y-auto pr-2 custom-scrollbar flex-1">
                  <p className="italic text-slate-400">
                      After quite some time of planning, brainstorming, and kicking ideas around, PrimeDev Studios presents:
                  </p>

                  <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700 shadow-inner">
                      <h3 className="text-xl font-bold text-red-500 mb-3 flex items-center gap-2 font-christmas tracking-wide">🎅 Sleigh Ride</h3>
                      <div className="space-y-4 leading-relaxed">
                          <p>
                              Letters and wishes all from across the globe have accidentally been scattered! Roll out with Santa to the cold winter night and collect all the wishes in time for Christmas; or else... <strong className="text-red-400">Christmas WILL be CANCELLED.</strong>
                          </p>
                          <p>
                              Sleigh Ride is a thrilling, fast-paced game designed and developed as a celebration of Christmas, and people's faith from across the world--with one idea and theme in mind: With enough determination and one's will--anyone can overcome any obstacle. Whether you’re here for the latest content or just looking for something exciting to play, Sleigh Ride is built to keep you engaged and thrilled.
                          </p>
                      </div>
                  </div>

                  <div className="text-center text-2xl opacity-80 py-1">🎄 🎄 🎄</div>

                  <div>
                      <h3 className="font-bold text-white mb-3 text-lg border-b border-slate-700 pb-2">Game Info & Details</h3>
                      <div className="space-y-4">
                          <div>
                              <h4 className="font-bold text-green-400 flex items-center gap-2">🌟 The Mission</h4>
                              <p className="mt-1">Navigate through 5 atmospheric levels. Your goal is simple but difficult: Collect <strong className="text-white">30 Wishes</strong> (Letters) scattered throughout the world. If you reach the end without them, the magic won't be strong enough to start Christmas.</p>
                          </div>
                          
                          <div>
                              <h4 className="font-bold text-purple-400 flex items-center gap-2">♾️ Endless Mode</h4>
                              <p className="mt-1">Only the true saviors of Christmas can access this. Complete the Story Mode with the true ending to unlock an infinite challenge where the storm never ends.</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-bold text-blue-400 mb-1">🎮 Controls</h4>
                                <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm">
                                    <li><strong>Jump:</strong> Spacebar or Tap Left</li>
                                    <li><strong>Shoot:</strong> 'Z' Key or Tap Right</li>
                                    <li><strong>Pause:</strong> '`' (Backtick) key</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-yellow-400 mb-1">⚡ Powerups</h4>
                                <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm">
                                    <li><strong>Speed:</strong> Fly faster</li>
                                    <li><strong>Snowballs:</strong> Ammo refill</li>
                                    <li><strong>Blast:</strong> Clear screen</li>
                                </ul>
                            </div>
                          </div>
                      </div>
                  </div>
               </div>
            </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
           <div className="relative">
             <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 animate-pulse"></div>
             <Loader2 size={64} className="text-green-500 animate-spin relative z-10" />
           </div>
           <div className="text-2xl font-christmas text-white tracking-wider animate-pulse">
             {loadingText}
           </div>
        </div>
      )}

      {gameState === GameState.HELP && (
        <div className="w-full max-w-2xl bg-slate-900/90 p-8 rounded-2xl border border-slate-600 shadow-2xl backdrop-blur-md animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-christmas text-yellow-400">Powerups & Abilities</h2>
            <button onClick={() => setGameState(GameState.MENU)} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={32} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {Object.values(PowerupType).map((type) => (
               <div key={type} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                 <div 
                   className="relative w-12 h-12 rounded-lg shadow-lg overflow-hidden flex-shrink-0 border border-white/10"
                   style={{ 
                     background: `linear-gradient(to bottom, ${POWERUP_COLORS[type]}, #ffffff)`,
                     boxShadow: `0 0 15px ${POWERUP_COLORS[type]}40`
                   }}
                 >
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 bg-white/90 shadow-sm"></div>
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-white/90 shadow-sm"></div>
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-white capitalize">{type}</h3>
                   <p className="text-slate-400 text-sm">
                     {type === 'SPEED' && "Boosts speed by 25% for 7 seconds."}
                     {type === 'SNOWBALLS' && "Gain 5 snowballs to destroy obstacles."}
                     {type === 'BLAST' && "Clears all visible obstacles instantly."}
                     {type === 'HEALING' && "Recover 1 life over 5 seconds."}
                     {type === 'LIFE' && "Instantly adds 1 extra life."}
                   </p>
                 </div>
               </div>
             ))}
          </div>

          <button 
            onClick={() => setGameState(GameState.MENU)}
            className="mt-8 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
          >
            Back to Menu
          </button>
        </div>
      )}

      {(gameState === GameState.PLAYING || gameState === GameState.GAME_OVER || gameState === GameState.VICTORY || gameState === GameState.BAD_ENDING || gameState === GameState.INTRO) && (
        <div className="relative w-full max-w-[1200px] aspect-[2/1] shadow-2xl rounded-xl overflow-hidden">
          <GameCanvas 
            gameState={gameState} 
            gameMode={gameMode}
            setGameState={(newState) => {
                 setGameState(newState);
            }} 
            onWin={handleWin}
          />
          
          {gameState === GameState.INTRO && !hasSeenIntro && (
              <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-8 animate-fade-in text-center">
                  <div className="max-w-3xl space-y-6">
                      <div className={`transition-opacity duration-1000 ${introStage >= 0 ? 'opacity-100' : 'opacity-0'}`}>
                        <h2 className="text-4xl md:text-5xl font-christmas text-white mb-4 drop-shadow-lg">
                           "Welcome to Sleigh Ride! Thank goodness you've came!"
                        </h2>
                        <p className="text-xl md:text-2xl text-blue-200 font-light italic">
                           "If you're reading this, we're in huge trouble."
                        </p>
                      </div>

                      {introStage >= 1 && (
                          <div className="animate-slide-up">
                             <p className="text-lg md:text-xl text-white leading-relaxed">
                                "Christmas will begin soon, and we accidentally scattered envelopes to you all across the globe!"
                             </p>
                          </div>
                      )}

                      {introStage >= 2 && (
                          <div className="animate-slide-up">
                             <p className="text-lg md:text-xl text-yellow-300 font-bold mt-4">
                                "Collect 30 Wishes (envelopes) and save Christmas."
                             </p>
                          </div>
                      )}

                      {introStage >= 3 && (
                          <div className="animate-pulse mt-8">
                             <h1 className="text-4xl md:text-6xl font-black text-red-500 font-christmas drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] transform scale-110 transition-transform">
                                "Or else Christmas will be CANCELLED!"
                             </h1>
                          </div>
                      )}

                      {introStage >= 4 && (
                          <div className="animate-fade-in mt-8 text-slate-300 italic text-sm">
                             "You're our last hope, Santa. Please... save us..."
                          </div>
                      )}
                      
                      <button 
                        onClick={skipIntro}
                        className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm uppercase tracking-widest border border-white/20 hover:border-white/50 px-4 py-2 rounded-full transition-all"
                      >
                         Skip Intro
                      </button>
                  </div>
              </div>
          )}

          {gameState === GameState.GAME_OVER && (
            <div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center animate-fade-in">
              <h2 className="text-7xl font-christmas text-red-600 mb-2 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Mission Failed</h2>
              <p className="text-xl text-slate-300 mb-8">The sleigh has crashed...</p>
              <div className="flex gap-4">
                  <button 
                    onClick={restartGame}
                    className="px-8 py-4 bg-slate-700 text-white rounded-full font-bold text-lg hover:bg-slate-600 transition-all shadow-xl flex items-center gap-2"
                  >
                    <ArrowLeft size={20} /> Menu
                  </button>
                  <button 
                    onClick={() => handleStartClick(gameMode)}
                    className="px-8 py-4 bg-white text-slate-900 rounded-full font-black text-lg hover:bg-slate-200 transition-all hover:scale-105 shadow-xl flex items-center gap-2"
                  >
                    <RefreshCw size={20} /> Try Again
                  </button>
              </div>
            </div>
          )}
          
          {gameState === GameState.BAD_ENDING && (
             <BadEndingSequence onRestart={restartGame} wishesCollected={0} />
          )}

          {gameState === GameState.VICTORY && (
            <VictorySequence onRestart={restartGame} />
          )}
        </div>
      )}
      
      {gameState !== GameState.VICTORY && gameState !== GameState.MENU && gameState !== GameState.HELP && gameState !== GameState.INTRO && gameState !== GameState.BAD_ENDING && (
        <div className="mt-4 text-slate-500 text-xs text-center animate-pulse">
          Keyboard: SPACE (Jump) | Z (Shoot)
        </div>
      )}
    </div>
  );
};

export default App;
