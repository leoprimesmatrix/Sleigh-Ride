
import React, { useEffect, useRef, useState } from 'react';
import { 
  GameState, 
  Player, 
  Obstacle, 
  Powerup, 
  Letter,
  Projectile, 
  Particle, 
  ParticleType,
  PowerupType,
  Entity,
  BackgroundLayer,
  DialogueLine,
  GameMode,
  Landmark,
  LetterVariant
} from '../types.ts';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRAVITY, 
  JUMP_STRENGTH, 
  LEVELS, 
  LEVEL_THRESHOLDS, 
  POWERUP_COLORS,
  TOTAL_GAME_TIME_SECONDS,
  VICTORY_DISTANCE,
  BASE_SPEED,
  WISHES,
  SAD_WISHES,
  VILLAIN_MESSAGES,
  NARRATIVE_LETTERS,
  STORY_MOMENTS,
  LANDMARKS,
  REQUIRED_WISHES
} from '../constants.ts';
import UIOverlay from './UIOverlay.tsx';
import { soundManager } from '../audio.ts';
import { Eye, EyeOff, Shield, Skull, Trophy, Camera, FastForward, Mail } from 'lucide-react';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onWin: () => void;
  gameMode: GameMode;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, onWin, gameMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [debugMenuOpen, setDebugMenuOpen] = useState(false);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [promoMode, setPromoMode] = useState(false);

  const playerRef = useRef<Player>({
    id: 0, x: 150, y: 300, width: 50, height: 30, markedForDeletion: false,
    vy: 0, lives: 3, snowballs: 0, isInvincible: false, invincibleTimer: 0,
    healingTimer: 0, speedTimer: 0, angle: 0
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const lettersRef = useRef<Letter[]>([]);
  const landmarksRef = useRef<Landmark[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const starsRef = useRef<{x:number, y:number, size:number, phase:number}[]>([]);
  const bgCloudsRef = useRef<{x:number, y:number, speed:number, scale:number, opacity: number}[]>([]);
  const bgTreesRef = useRef<boolean[][]>([[], [], []]); 
  const citySkylineRef = useRef<{x:number, width:number, height:number, windows: {x:number, y:number}[]}[]>([]);
  const distantCitySkylineRef = useRef<{x:number, width:number, height:number, windows: {x:number, y:number}[]}[]>([]);
  const flashTimerRef = useRef(0); 
  const pausedTimeRef = useRef(0); 

  const saturationRef = useRef(0.0);
  const flickerTimerRef = useRef(0);
  const isLightsOutRef = useRef(false);
  const isEndingSequenceRef = useRef(false);
  const joyRideModeRef = useRef(false);
  const joyRideTimerRef = useRef(0);
  const masterGiftDroppedRef = useRef(false);
  const cutsceneExplosionTriggeredRef = useRef(false);
  const villainLetterSpawnedRef = useRef(false);

  const collectedPowerupsRef = useRef<{ id: number; type: PowerupType }[]>([]);
  const wishesCollectedCountRef = useRef(0);
  const activeDialogueRef = useRef<DialogueLine | null>(null);
  const activeWishRef = useRef<{ message: string, variant: LetterVariant } | null>(null);
  const endingMusicTriggeredRef = useRef(false);
  const triggeredLandmarksRef = useRef<Set<string>>(new Set());
  const triggeredLettersRef = useRef<Set<string>>(new Set());
  
  const distanceRef = useRef(0);
  const scoreRef = useRef(0);
  const timeRef = useRef(TOTAL_GAME_TIME_SECONDS);
  const lastFrameTimeRef = useRef(0);
  const shakeRef = useRef(0);
  const triggeredStoryMomentsRef = useRef<Set<string>>(new Set());
  const lastLevelIndexRef = useRef(-1);
  
  const bgLayersRef = useRef<BackgroundLayer[]>([
    { points: [], color: '', speedModifier: 0.2, offset: 0 }, 
    { points: [], color: '', speedModifier: 0.5, offset: 0 }, 
    { points: [], color: '', speedModifier: 0.8, offset: 0 }, 
  ]);

  useEffect(() => {
    citySkylineRef.current = [];
    distantCitySkylineRef.current = [];

    const generateTerrain = (amplitude: number, roughness: number) => {
        const points = [];
        let y = 0;
        for (let i = 0; i <= CANVAS_WIDTH + 200; i += 50) {
            y += (Math.random() - 0.5) * roughness;
            y = Math.max(Math.min(y, amplitude), -amplitude);
            points.push(y);
        }
        return points;
    };

    bgLayersRef.current[0].points = generateTerrain(150, 80); 
    bgLayersRef.current[1].points = generateTerrain(50, 30);  
    bgLayersRef.current[2].points = generateTerrain(20, 10);  

    bgTreesRef.current[1] = bgLayersRef.current[1].points.map(() => Math.random() < 0.3);
    bgTreesRef.current[2] = bgLayersRef.current[2].points.map(() => Math.random() < 0.5);

    starsRef.current = [];
    for (let i = 0; i < 80; i++) {
        starsRef.current.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * (CANVAS_HEIGHT / 2),
            size: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2
        });
    }

    bgCloudsRef.current = [];
    for (let i = 0; i < 6; i++) {
        bgCloudsRef.current.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * (CANVAS_HEIGHT / 2.5),
            speed: Math.random() * 15 + 5,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.3 + 0.1
        });
    }
    
    let cx = 0;
    while(cx < CANVAS_WIDTH + 200) {
        const w = Math.random() * 40 + 40;
        const h = Math.random() * 150 + 100;
        const windows = [];
        for(let wx=10; wx<w-10; wx+=15) {
            for(let wy=20; wy<h-20; wy+=25) {
                if(Math.random() > 0.3) windows.push({x: wx, y: wy});
            }
        }
        citySkylineRef.current.push({
            x: cx,
            width: w,
            height: h,
            windows
        });
        cx += w + 5;
    }

    let dcx = 0;
    while(dcx < CANVAS_WIDTH + 200) {
        const w = Math.random() * 60 + 60;
        const h = Math.random() * 80 + 40;
        const windows = [];
        for(let wx=5; wx<w-5; wx+=8) {
            for(let wy=10; wy<h-10; wy+=12) {
                if(Math.random() > 0.7) windows.push({x: wx, y: wy});
            }
        }
        distantCitySkylineRef.current.push({
            x: dcx,
            width: w,
            height: h,
            windows
        });
        dcx += w - 2;
    }

  }, []);
  
  const [hudState, setHudState] = useState({
    lives: 3,
    snowballs: 0,
    progress: 0,
    timeLeft: TOTAL_GAME_TIME_SECONDS,
    levelIndex: 0,
    score: 0,
    activeSpeed: 0,
    activeHealing: 0,
    collectedPowerups: [] as { id: number; type: PowerupType }[],
    activeDialogue: null as DialogueLine | null,
    activeWish: null as { message: string, variant: LetterVariant } | null,
    wishesCollected: 0
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') {
          setDebugMenuOpen(prev => !prev);
          return;
      }

      if (gameState === GameState.MENU) {
        soundManager.init();
      }

      if (gameState !== GameState.PLAYING) return;
      
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !isEndingSequenceRef.current) {
        playerRef.current.vy = JUMP_STRENGTH;
        soundManager.playJump();
        createParticles(playerRef.current.x, playerRef.current.y + 20, ParticleType.SMOKE, 3, '#fff');
      }

      if ((e.code === 'KeyZ' || e.code === 'Enter') && !isEndingSequenceRef.current) {
        shootSnowball();
      }
    };
    
    const handleTouch = () => {
       if (gameState === GameState.MENU) soundManager.init();
       if (gameState !== GameState.PLAYING) return;
       if (!isEndingSequenceRef.current) {
          playerRef.current.vy = JUMP_STRENGTH;
          soundManager.playJump();
       }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [gameState]);

  useEffect(() => {
    soundManager.init(); 
    soundManager.reset(); 
    return () => {
        soundManager.stopEndingMusic();
        soundManager.stopBgm();
    };
  }, []);

  const shootSnowball = () => {
    if (playerRef.current.snowballs > 0) {
      playerRef.current.snowballs--;
      soundManager.playShoot();
      projectilesRef.current.push({
        id: Date.now(),
        x: playerRef.current.x + playerRef.current.width,
        y: playerRef.current.y + playerRef.current.height / 2,
        width: 12,
        height: 12,
        vx: 15,
        markedForDeletion: false,
        trail: []
      });
    }
  };

  const triggerPromoExplosion = () => {
      setCinematicMode(true);
      setPromoMode(true);
      pausedTimeRef.current = 0; 
      createExplosion(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      soundManager.playCrash();
      setTimeout(() => {
          pausedTimeRef.current = performance.now();
      }, 500);
  };

  useEffect(() => {
    if (gameState !== GameState.PLAYING && gameState !== GameState.INTRO) {
      soundManager.setSleighVolume(0);
      return;
    }

    let animationFrameId: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });

    if (!canvas || !ctx) return;

    const resetGame = () => {
      playerRef.current = {
        id: 0, x: 150, y: 300, width: 60, height: 30, markedForDeletion: false,
        vy: 0, lives: 3, snowballs: 0, isInvincible: false, invincibleTimer: 0,
        healingTimer: 0, speedTimer: 0, angle: 0
      };
      obstaclesRef.current = [];
      powerupsRef.current = [];
      lettersRef.current = [];
      landmarksRef.current = [];
      projectilesRef.current = [];
      particlesRef.current = [];
      collectedPowerupsRef.current = [];
      wishesCollectedCountRef.current = 0;
      activeDialogueRef.current = null;
      activeWishRef.current = null;
      triggeredStoryMomentsRef.current.clear();
      triggeredLandmarksRef.current.clear();
      triggeredLettersRef.current.clear();
      endingMusicTriggeredRef.current = false;
      flashTimerRef.current = 0;
      pausedTimeRef.current = 0;
      
      distanceRef.current = 0;
      scoreRef.current = 0;
      timeRef.current = TOTAL_GAME_TIME_SECONDS;
      shakeRef.current = 0;
      saturationRef.current = 1.0;
      flickerTimerRef.current = 0;
      isLightsOutRef.current = false;
      isEndingSequenceRef.current = false;
      joyRideModeRef.current = false;
      joyRideTimerRef.current = 0;
      masterGiftDroppedRef.current = false;
      cutsceneExplosionTriggeredRef.current = false;
      villainLetterSpawnedRef.current = false;
      
      lastLevelIndexRef.current = -1;
      soundManager.stopBgm();
    };

    if (gameState === GameState.INTRO || (gameState === GameState.PLAYING && playerRef.current.lives <= 0)) {
        resetGame();
    }

    lastFrameTimeRef.current = performance.now();

    const render = (timestamp: number) => {
      if (pausedTimeRef.current > 0) {
          draw(ctx, pausedTimeRef.current);
          animationFrameId = requestAnimationFrame(render);
          return;
      }

      const dt = Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = timestamp;

      update(dt, timestamp);
      draw(ctx, timestamp);

      if (gameState === GameState.INTRO) {
         animationFrameId = requestAnimationFrame(render);
         return;
      }

      if (playerRef.current.lives > 0) {
          if (gameMode === GameMode.STORY && joyRideTimerRef.current < 0 && joyRideModeRef.current) {
          } else if (gameMode === GameMode.STORY && timeRef.current <= 0 && !isEndingSequenceRef.current) {
               setGameState(GameState.GAME_OVER);
          } else {
              animationFrameId = requestAnimationFrame(render);
          }
      } else {
          setGameState(GameState.GAME_OVER);
      }
    };

    const update = (dt: number, timestamp: number) => {
      const player = playerRef.current;
      const timeScale = dt * 60;

      if (gameState === GameState.INTRO) {
          timeRef.current = TOTAL_GAME_TIME_SECONDS; 
          const hoverSpeed = BASE_SPEED * 0.5;
          soundManager.setSleighVolume(hoverSpeed);
          player.y = 300 + Math.sin(timestamp / 800) * 20;
          player.angle = Math.sin(timestamp / 800) * 0.1;
          bgCloudsRef.current.forEach(cloud => {
            cloud.x -= (cloud.speed + hoverSpeed * 0.1) * timeScale * 0.1;
            if (cloud.x < -150) { cloud.x = CANVAS_WIDTH + 150; cloud.y = Math.random() * (CANVAS_HEIGHT / 2.5); }
          });
          return;
      }

      if (gameMode === GameMode.STORY && !joyRideModeRef.current) {
         timeRef.current -= dt;
      } else {
         if (!joyRideModeRef.current) timeRef.current = 999;
      }
      
      if (flashTimerRef.current > 0) flashTimerRef.current -= dt;
      
      const speedMultiplier = player.speedTimer > 0 ? 1.5 : 1.0;
      let progressRatio = distanceRef.current / VICTORY_DISTANCE;
      
      if (gameMode === GameMode.STORY) progressRatio = Math.min(1.02, progressRatio);

      const currentSpeedFrame = (BASE_SPEED + (Math.min(progressRatio, 3.0) * 6)); 
      let currentSpeed = isEndingSequenceRef.current ? currentSpeedFrame * 0.5 : currentSpeedFrame * speedMultiplier; 
      
      if (gameMode === GameMode.STORY && progressRatio >= 0.90 && !endingMusicTriggeredRef.current) {
          if (wishesCollectedCountRef.current >= REQUIRED_WISHES) {
             endingMusicTriggeredRef.current = true;
             soundManager.playEndingMusic(0, 5); // 5s fade in
          }
      }

      if (gameMode === GameMode.STORY && progressRatio >= 0.99 && !isEndingSequenceRef.current) {
          if (wishesCollectedCountRef.current >= REQUIRED_WISHES) {
              isEndingSequenceRef.current = true;
              player.isInvincible = true;
          } else {
             setGameState(GameState.BAD_ENDING);
             return;
          }
      }

      if (isEndingSequenceRef.current) {
          soundManager.setSleighVolume(0);

          if (joyRideModeRef.current) {
              currentSpeed = BASE_SPEED * 3;
              joyRideTimerRef.current -= dt;
              
              player.y = 250 + Math.sin(timestamp / 400) * 80;
              player.angle = Math.sin(timestamp / 400) * 0.2;
              
              if (joyRideTimerRef.current <= 0) {
                   setGameState(GameState.VICTORY);
                   onWin();
              }

          } else {
              player.vy = 0;
              player.y += (200 - player.y) * 0.05 * timeScale;
              
              if (!masterGiftDroppedRef.current && landmarksRef.current.some(l => l.type === 'FINAL_HOUSE' && l.x < CANVAS_WIDTH/2)) {
                  masterGiftDroppedRef.current = true;
                  createParticles(player.x, player.y, ParticleType.GLOW, 50, 'gold');
                  flashTimerRef.current = 2.0;
                  
                  setTimeout(() => {
                       joyRideModeRef.current = true;
                       joyRideTimerRef.current = 12.0;
                  }, 500);
              }
          }
      } else {
           soundManager.setSleighVolume(currentSpeed);
      }

      if (gameMode === GameMode.STORY && timeRef.current < 30 && Math.floor(timeRef.current) !== Math.floor(timeRef.current + dt) && !isEndingSequenceRef.current) {
         soundManager.playTimeWarning();
      }

      if (!joyRideModeRef.current || joyRideTimerRef.current > 2.0) {
         distanceRef.current += currentSpeed * timeScale;
         scoreRef.current += currentSpeed * 0.1 * timeScale;
      }

      let levelIndex = 0;
      let effectiveProgress = progressRatio * 100;
      if (gameMode === GameMode.ENDLESS && progressRatio > 1) {
          effectiveProgress = (progressRatio % 1) * 100;
      } else if (gameMode === GameMode.STORY) {
          effectiveProgress = Math.min(100, effectiveProgress);
      }

      for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (effectiveProgress >= LEVEL_THRESHOLDS[i]) {
          levelIndex = i;
          break;
        }
      }
      
      if (levelIndex !== lastLevelIndexRef.current) {
          soundManager.playLevelBgm(levelIndex);
          lastLevelIndexRef.current = levelIndex;
      }
      
      const level = LEVELS[levelIndex];

      if (levelIndex === 1) {
          saturationRef.current = Math.max(0, saturationRef.current - 0.001 * timeScale);
      } else if (levelIndex === 4 || joyRideModeRef.current) {
          saturationRef.current = 1.0;
      } else {
          saturationRef.current = Math.min(1, saturationRef.current + 0.005 * timeScale);
      }

      if (levelIndex === 3) {
          flickerTimerRef.current -= dt;
          if (flickerTimerRef.current <= 0) {
              isLightsOutRef.current = !isLightsOutRef.current;
              flickerTimerRef.current = isLightsOutRef.current ? Math.random() * 0.2 + 0.1 : Math.random() * 2 + 0.5;
          }
      } else {
          isLightsOutRef.current = false;
      }

      if (gameMode === GameMode.STORY) {
          STORY_MOMENTS.forEach(moment => {
            if (progressRatio >= moment.progress && !triggeredStoryMomentsRef.current.has(moment.dialogue.id)) {
              triggeredStoryMomentsRef.current.add(moment.dialogue.id);
              activeDialogueRef.current = moment.dialogue;
              setTimeout(() => {
                if (activeDialogueRef.current?.id === moment.dialogue.id) activeDialogueRef.current = null;
              }, 5000);
            }
          });

          LANDMARKS.forEach(lm => {
              if (progressRatio >= lm.progress && !triggeredLandmarksRef.current.has(lm.type)) {
                  triggeredLandmarksRef.current.add(lm.type);
                  const yPos = (lm.type === 'CLOCK_TOWER' || lm.type === 'FINAL_HOUSE') ? CANVAS_HEIGHT - 400 : CANVAS_HEIGHT - 300;
                  landmarksRef.current.push({
                      id: Date.now(),
                      x: CANVAS_WIDTH + 200,
                      y: yPos,
                      width: 200,
                      height: 400,
                      markedForDeletion: false,
                      type: lm.type,
                      name: lm.name
                  });
                  
                  if (lm.type === 'CLOCK_TOWER') {
                      lettersRef.current.push({
                          id: Date.now() + 1,
                          x: CANVAS_WIDTH + 300,
                          y: 300,
                          width: 40,
                          height: 30,
                          floatOffset: 0,
                          markedForDeletion: false,
                          message: `Unfreeze time!`,
                          variant: 'GOLDEN'
                      });
                  }
              }
          });

          NARRATIVE_LETTERS.forEach(nl => {
              const key = `letter_${nl.progress}`;
              if (progressRatio >= nl.progress && !triggeredLettersRef.current.has(key)) {
                  triggeredLettersRef.current.add(key);
                  lettersRef.current.push({
                      id: Date.now(),
                      x: CANVAS_WIDTH + 100,
                      y: Math.random() * (CANVAS_HEIGHT - 200) + 50,
                      width: 40, height: 30, floatOffset: 0, markedForDeletion: false,
                      message: nl.message, variant: 'GOLDEN'
                  });
              }
          });
      }

      if (!isEndingSequenceRef.current) {
          player.vy += GRAVITY * timeScale;
          player.y += player.vy * timeScale;
          const targetAngle = Math.min(Math.max(player.vy * 0.05, -0.5), 0.5);
          player.angle += (targetAngle - player.angle) * 0.1 * timeScale;
      }
      
      if (player.y + player.height > CANVAS_HEIGHT - 50) { player.y = CANVAS_HEIGHT - 50 - player.height; player.vy = 0; }
      if (player.y < 0) { player.y = 0; player.vy = 0; }
      if (player.invincibleTimer > 0) player.invincibleTimer -= dt;
      if (player.speedTimer > 0) player.speedTimer -= dt;
      if (player.healingTimer > 0) {
        player.healingTimer -= dt;
        if (Math.random() < 0.2) createParticles(player.x + Math.random()*player.width, player.y + Math.random()*player.height, ParticleType.GLOW, 1, '#22c55e');
        if (player.healingTimer <= 0 && player.lives < 3) { player.lives++; soundManager.playHeal(); }
      }
      player.isInvincible = player.invincibleTimer > 0;

      bgCloudsRef.current.forEach(cloud => {
          cloud.x -= (cloud.speed + (currentSpeed * 0.1)) * timeScale * 0.1;
          if (cloud.x < -150) { cloud.x = CANVAS_WIDTH + 150; cloud.y = Math.random() * (CANVAS_HEIGHT / 2.5); }
      });
      bgLayersRef.current.forEach((layer, index) => {
          layer.offset -= currentSpeed * layer.speedModifier * timeScale;
          if (layer.offset <= -50) {
              layer.offset += 50;
              layer.points.shift();
              layer.points.push((Math.random() - 0.5) * (layer.speedModifier * 50));
              if (bgTreesRef.current[index]) {
                  bgTreesRef.current[index].shift();
                  const chance = index === 1 ? 0.3 : (index === 2 ? 0.5 : 0);
                  bgTreesRef.current[index].push(Math.random() < chance);
              }
          }
      });

      if (!isEndingSequenceRef.current && Math.random() < 0.015 * level.spawnRateMultiplier * timeScale) {
        const types: Obstacle['type'][] = ['TREE', 'BIRD', 'SNOWMAN', 'BUILDING', 'CLOUD'];
        
        let availableTypes: Obstacle['type'][] = types;
        if (levelIndex === 2) availableTypes = ['BIRD', 'CLOUD'];
        else if (levelIndex === 4) availableTypes = [];
        
        if (availableTypes.length > 0) {
            const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            obstaclesRef.current.push({
              id: Date.now() + Math.random(),
              x: CANVAS_WIDTH + 100,
              y: type === 'BIRD' || type === 'CLOUD' ? Math.random() * (CANVAS_HEIGHT - 300) : CANVAS_HEIGHT - (type === 'BUILDING' ? 150 : 100), 
              width: type === 'BUILDING' ? 80 : 60,
              height: type === 'BUILDING' ? 160 : 70,
              type: type,
              markedForDeletion: false,
              rotation: 0
            });
        }
      }
      
      if (!isEndingSequenceRef.current && Math.random() < 0.004 * timeScale) {
        if (gameMode !== GameMode.STORY || levelIndex !== 4) {
            const pTypes = Object.values(PowerupType);
            const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
            powerupsRef.current.push({
              id: Date.now() + Math.random(),
              x: CANVAS_WIDTH + 100,
              y: Math.random() * (CANVAS_HEIGHT - 200) + 50,
              width: 40, height: 40, type: pType, floatOffset: Math.random() * Math.PI * 2, markedForDeletion: false
            });
        }
      }
      
      const letterSpawnChance = (gameMode === GameMode.STORY && levelIndex === 4) ? 0.02 : 0.005;
      
      if (!isEndingSequenceRef.current && Math.random() < letterSpawnChance * timeScale) {
          let msg = "";
          let variant: LetterVariant = 'NORMAL';

          if (gameMode === GameMode.STORY && levelIndex === 4) {
              if (wishesCollectedCountRef.current < REQUIRED_WISHES) {
                   // Bad ending route spawning
                   if (progressRatio > 0.96 && !villainLetterSpawnedRef.current) {
                        msg = VILLAIN_MESSAGES[Math.floor(Math.random() * VILLAIN_MESSAGES.length)];
                        variant = 'VILLAIN';
                        villainLetterSpawnedRef.current = true;
                   } else {
                        msg = SAD_WISHES[Math.floor(Math.random() * SAD_WISHES.length)];
                        variant = 'SAD';
                   }
              } else {
                  // Good ending route
                  msg = WISHES[Math.floor(Math.random() * WISHES.length)];
                  variant = 'GOLDEN';
              }
          } else {
              msg = WISHES[Math.floor(Math.random() * WISHES.length)];
              variant = 'NORMAL';
          }

          // Don't spawn sad/normal letters if we just spawned the villain one to avoid clutter
          if (variant !== 'VILLAIN' && villainLetterSpawnedRef.current && progressRatio > 0.96) {
             // skip
          } else {
              lettersRef.current.push({
                  id: Date.now() + Math.random(),
                  x: CANVAS_WIDTH + 100,
                  y: Math.random() * (CANVAS_HEIGHT - 250) + 50,
                  width: 30, height: 20, floatOffset: Math.random() * Math.PI, markedForDeletion: false,
                  message: msg,
                  variant: variant
              });
          }
      }

      obstaclesRef.current.forEach(obs => {
        obs.x -= currentSpeed * level.obstacleSpeedMultiplier * timeScale;
        if (obs.x + obs.width < -100) obs.markedForDeletion = true;
        if (!cinematicMode && !player.isInvincible && checkCollision(player, obs)) {
          if (gameMode === GameMode.STORY && levelIndex === 4) {
          } else {
              player.lives--;
              soundManager.playCrash();
              player.invincibleTimer = 2.0;
              shakeRef.current = 20;
              createParticles(player.x, player.y, ParticleType.DEBRIS, 15, '#ef4444');
              saturationRef.current = Math.max(0, saturationRef.current - 0.2);
          }
        }
      });
      
      landmarksRef.current.forEach(lm => {
          lm.x -= currentSpeed * timeScale;
          if (lm.x + lm.width < -200) lm.markedForDeletion = true;
      });
      
      if (joyRideModeRef.current) {
          distantCitySkylineRef.current.forEach(city => {
             city.x -= currentSpeed * 0.15 * timeScale;
             if (city.x + city.width < -100) {
                 city.x = CANVAS_WIDTH + 100;
                 city.height = Math.random() * 80 + 40;
                 city.width = Math.random() * 60 + 60;
                 const windows = [];
                 for(let wx=5; wx<city.width-5; wx+=8) {
                    for(let wy=10; wy<city.height-10; wy+=12) {
                        if(Math.random() > 0.7) windows.push({x: wx, y: wy});
                    }
                 }
                 city.windows = windows;
             }
          });

          citySkylineRef.current.forEach(city => {
             city.x -= currentSpeed * 0.3 * timeScale;
             if (city.x + city.width < -100) {
                 city.x = CANVAS_WIDTH + 100;
                 city.height = Math.random() * 150 + 100;
                 city.width = Math.random() * 40 + 40;
                 const windows = [];
                 for(let wx=10; wx<city.width-10; wx+=15) {
                    for(let wy=20; wy<city.height-20; wy+=25) {
                        if(Math.random() > 0.3) windows.push({x: wx, y: wy});
                    }
                 }
                 city.windows = windows;
             }
          });
      }

      powerupsRef.current.forEach(pup => {
        pup.x -= currentSpeed * timeScale;
        pup.floatOffset += 0.05 * timeScale;
        pup.y += Math.sin(pup.floatOffset) * 0.5 * timeScale;
        if (pup.x + pup.width < -50) pup.markedForDeletion = true;
        if (!cinematicMode && checkCollision(player, pup)) {
          pup.markedForDeletion = true;
          applyPowerup(pup.type);
          soundManager.playPowerup(pup.type);
          createParticles(pup.x, pup.y, ParticleType.SPARKLE, 20, POWERUP_COLORS[pup.type]);
          collectedPowerupsRef.current.push({ id: Date.now() + Math.random(), type: pup.type });
          saturationRef.current = Math.min(1.0, saturationRef.current + 0.1);
        }
      });

      lettersRef.current.forEach(letter => {
          letter.x -= currentSpeed * 0.8 * timeScale;
          letter.floatOffset += 0.03 * timeScale;
          letter.y += Math.sin(letter.floatOffset) * 1 * timeScale;
          if (letter.x + letter.width < -50) letter.markedForDeletion = true;
          if (!cinematicMode && checkCollision(player, letter)) {
              letter.markedForDeletion = true;
              
              const isSadOrVillain = letter.variant === 'SAD' || letter.variant === 'VILLAIN';
              const isGolden = letter.variant === 'GOLDEN';
              
              if (isSadOrVillain) {
                 // No sound or a different sound could be better, but re-using collect for now maybe? 
                 // Actually, let's silence it or play crash for bad vibes? 
                 // Let's just play collect for feedback but no score/particle joy.
                 soundManager.playCollectWish();
                 if (letter.variant === 'VILLAIN') {
                     shakeRef.current = 15;
                     createParticles(letter.x, letter.y, ParticleType.SHOCKWAVE, 1, '#ef4444');
                 } else {
                     createParticles(letter.x, letter.y, ParticleType.DEBRIS, 5, '#94a3b8');
                 }
                 
              } else {
                 soundManager.playCollectWish();
                 const color = isGolden ? '#fbbf24' : '#fcd34d';
                 createParticles(letter.x, letter.y, ParticleType.SPARKLE, 15, color); 
                 saturationRef.current = Math.min(1.0, saturationRef.current + 0.2);
                 if (isGolden) {
                      shakeRef.current = 10;
                      particlesRef.current.push({
                          id: Math.random(), type: ParticleType.SHOCKWAVE, x: letter.x, y: letter.y, radius: 10, vx: 0, vy: 0, alpha: 1, color: 'white', life: 1, maxLife: 1, growth: 800
                      });
                 }
                 wishesCollectedCountRef.current += 1;
              }

              activeWishRef.current = { message: letter.message, variant: letter.variant };
              
              const displayTime = letter.variant === 'VILLAIN' ? 8000 : 4000;
              setTimeout(() => { if (activeWishRef.current?.message === letter.message) activeWishRef.current = null; }, displayTime);
          }
      });

      projectilesRef.current.forEach(proj => {
        proj.x += proj.vx * timeScale;
        proj.trail.push({x: proj.x, y: proj.y});
        if (proj.trail.length > 10) proj.trail.shift();
        if (proj.x > CANVAS_WIDTH) proj.markedForDeletion = true;
        obstaclesRef.current.forEach(obs => {
          if (!obs.markedForDeletion && checkCollision(proj, obs)) {
            obs.markedForDeletion = true;
            proj.markedForDeletion = true;
            soundManager.playCrash();
            createParticles(obs.x + obs.width/2, obs.y + obs.height/2, ParticleType.DEBRIS, 10, '#fff');
            scoreRef.current += 50;
          }
        });
      });

      if (Math.random() < 0.4 * level.weatherIntensity * timeScale) {
        createParticles(CANVAS_WIDTH + 10, Math.random() * CANVAS_HEIGHT, ParticleType.SNOW, 1, 'white');
      }

      particlesRef.current.forEach(p => {
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;
        p.life -= dt;
        p.alpha = p.life / p.maxLife;
        p.radius += p.growth * dt; 
        if (p.type === ParticleType.SNOW) {
            p.x -= currentSpeed * 0.5 * timeScale;
            p.y += Math.sin(timestamp / 500 + p.id) * 0.5;
        } else if (p.type === ParticleType.FIRE || p.type === ParticleType.SMOKE || p.type === ParticleType.LIFE) {
            p.vx *= 0.95; p.vy *= 0.95; p.y -= 0.5 * timeScale;
        }
      });
      particlesRef.current = particlesRef.current.filter(p => p.life > 0 && !isNaN(p.x) && !isNaN(p.y));

      obstaclesRef.current = obstaclesRef.current.filter(e => !e.markedForDeletion);
      powerupsRef.current = powerupsRef.current.filter(e => !e.markedForDeletion);
      lettersRef.current = lettersRef.current.filter(e => !e.markedForDeletion);
      landmarksRef.current = landmarksRef.current.filter(e => !e.markedForDeletion);
      projectilesRef.current = projectilesRef.current.filter(e => !e.markedForDeletion);

      if (shakeRef.current > 0) shakeRef.current *= Math.pow(0.9, timeScale);

      if (Math.floor(timestamp / 100) > Math.floor((timestamp - dt * 1000) / 100)) {
        const newPowerups = collectedPowerupsRef.current;
        collectedPowerupsRef.current = []; 
        setHudState({
          lives: player.lives,
          snowballs: player.snowballs,
          progress: progressRatio * 100,
          timeLeft: timeRef.current,
          levelIndex,
          score: scoreRef.current,
          activeSpeed: player.speedTimer,
          activeHealing: player.healingTimer,
          collectedPowerups: newPowerups,
          activeDialogue: activeDialogueRef.current,
          activeWish: activeWishRef.current,
          wishesCollected: wishesCollectedCountRef.current
        });
      }
    };

    const draw = (ctx: CanvasRenderingContext2D, timestamp: number) => {
      const levelIndex = hudState.levelIndex;
      const level = LEVELS[levelIndex];
      const progressRatio = distanceRef.current / VICTORY_DISTANCE;

      if (promoMode) {
         ctx.fillStyle = "black";
         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, level.backgroundGradient[0]);
        gradient.addColorStop(1, level.backgroundGradient[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        drawStars(ctx, timestamp);
        
        if (joyRideModeRef.current) {
            distantCitySkylineRef.current.forEach(b => {
               const by = CANVAS_HEIGHT - b.height + 20;
               ctx.fillStyle = "#0f172a";
               ctx.fillRect(b.x, by, b.width, b.height);
               
               ctx.fillStyle = "#fde68a";
               ctx.globalAlpha = 0.3;
               b.windows.forEach(w => {
                   if (Math.sin(timestamp / 400 + w.x) > 0.6) {
                       ctx.fillRect(b.x + w.x, by + w.y, 3, 4);
                   }
               });
               ctx.globalAlpha = 1.0;
            });

            citySkylineRef.current.forEach(b => {
               const by = CANVAS_HEIGHT - b.height + 50;
               ctx.fillStyle = "#f59e0b"; 
               ctx.globalAlpha = 0.3;
               ctx.fillRect(b.x, by, b.width, b.height);
               
               ctx.globalAlpha = 0.6;
               ctx.fillStyle = "#fef3c7";
               b.windows?.forEach(w => {
                   if (Math.sin(timestamp / 200 + w.x) > 0) {
                       ctx.fillRect(b.x + w.x, by + w.y, 5, 8);
                   }
               });
               ctx.globalAlpha = 1.0;
            });
        }

        ctx.save();
        ctx.shadowBlur = 50;
        ctx.shadowColor = "rgba(255, 255, 200, 0.5)";
        let celestialY = 100;
        if (gameMode === GameMode.STORY && progressRatio > 0.90) {
            const sunY = 400 - ((progressRatio - 0.90) * 3000);
            ctx.fillStyle = "#fde047";
            ctx.beginPath(); ctx.arc(CANVAS_WIDTH - 150, sunY, 80, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = "#fffee0";
            ctx.beginPath(); ctx.arc(CANVAS_WIDTH - 150, 100, 50, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

        drawBgClouds(ctx);
        drawParallaxLayer(ctx, bgLayersRef.current[0], CANVAS_HEIGHT - 150, "#334155", timestamp);
        drawParallaxLayer(ctx, bgLayersRef.current[1], CANVAS_HEIGHT - 80, "#475569", timestamp, bgTreesRef.current[1]); 
      }

      ctx.save();
      const dx = (Math.random() - 0.5) * shakeRef.current;
      const dy = (Math.random() - 0.5) * shakeRef.current;
      ctx.translate(dx, dy);

      if (!promoMode) {
        drawParallaxLayer(ctx, bgLayersRef.current[2], CANVAS_HEIGHT - 20, "#cbd5e1", timestamp, bgTreesRef.current[2]); 
      }

      if (!cinematicMode) {
          landmarksRef.current.forEach(lm => drawLandmark(ctx, lm));
          powerupsRef.current.forEach(pup => drawPowerup(ctx, pup));
          lettersRef.current.forEach(letter => drawLetter(ctx, letter));
          
          ctx.fillStyle = "#e0f2fe"; ctx.shadowBlur = 10; ctx.shadowColor = "#bae6fd";
          projectilesRef.current.forEach(p => {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); p.trail.forEach(t => ctx.lineTo(t.x, t.y));
            ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = p.width/2; ctx.stroke();
            ctx.beginPath(); ctx.arc(p.x, p.y, p.width/2, 0, Math.PI * 2); ctx.fill();
          });
          ctx.shadowBlur = 0;
          
          obstaclesRef.current.forEach(obs => drawObstacle(ctx, obs, timestamp, progressRatio));
          drawPlayer(ctx, playerRef.current);
      }

      particlesRef.current.forEach(p => {
        if (cinematicMode && p.type !== ParticleType.SNOW && p.type !== ParticleType.SHOCKWAVE && p.type !== ParticleType.FIRE && p.type !== ParticleType.LIFE) return;
        if (promoMode && p.type === ParticleType.SNOW) return;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.type === ParticleType.SHOCKWAVE) {
            ctx.lineWidth = Math.max(1, 10 * p.alpha);
            ctx.strokeStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
        } else if (p.type === ParticleType.FIRE) {
            ctx.fillStyle = p.color; ctx.globalCompositeOperation = 'lighter'; ctx.shadowBlur = 20; ctx.shadowColor = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        } else if (p.type === ParticleType.LIFE) {
            ctx.fillStyle = p.color;
            const size = p.radius;
            ctx.translate(p.x, p.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-size/2, -size/2, -size, size/3, 0, size);
            ctx.bezierCurveTo(size, size/3, size/2, -size/2, 0, 0);
            ctx.fill();
        } else {
            ctx.fillStyle = p.color;
            if (p.type === ParticleType.GLOW || p.type === ParticleType.SPARKLE) {
                ctx.globalCompositeOperation = 'lighter'; ctx.shadowBlur = 10; ctx.shadowColor = p.color;
            }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      });

      if (!promoMode) {
          const vignette = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_HEIGHT/2, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH);
          vignette.addColorStop(0, "rgba(0,0,0,0)");
          vignette.addColorStop(1, "rgba(0,0,0,0.6)");
          ctx.fillStyle = vignette; ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);

          if (saturationRef.current < 1.0) {
             ctx.fillStyle = `rgba(30, 41, 59, ${0.9 - (saturationRef.current * 0.9)})`;
             ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
          }

          if (isLightsOutRef.current) {
              ctx.fillStyle = "black";
              ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
              
              ctx.save();
              ctx.translate(playerRef.current.x + playerRef.current.width, playerRef.current.y + 15);
              ctx.shadowBlur = 30; ctx.shadowColor = "red"; ctx.fillStyle = "red";
              ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();
              ctx.restore();

              lettersRef.current.forEach(l => {
                  if (l.variant === 'GOLDEN') drawLetter(ctx, l);
              });
          }

          if (flashTimerRef.current > 0) {
             ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, flashTimerRef.current)})`;
             ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          }
      }

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, cinematicMode, promoMode, gameMode]);

  const createFirework = (x: number, y: number) => {
      const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      for(let i=0; i<20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 30 + 10;
          particlesRef.current.push({
            id: Math.random(), type: ParticleType.SPARKLE,
            x, y, radius: Math.random() * 3 + 2, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            alpha: 1, color, life: Math.random() * 0.8 + 0.5, maxLife: 1.5, growth: -5
          });
      }
      particlesRef.current.push({
          id: Math.random(), type: ParticleType.GLOW, x, y, radius: 20, vx: 0, vy: 0, alpha: 1, color: 'white', life: 0.5, maxLife: 0.5, growth: 100
      });
  };

  const createExplosion = (x: number, y: number) => {
      particlesRef.current.push({
          id: Math.random(), type: ParticleType.SHOCKWAVE, x, y, radius: 10, vx: 0, vy: 0, alpha: 1, color: 'white', life: 0.5, maxLife: 0.5, growth: 300
      });
      for(let i=0; i<12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 50 + 20;
          particlesRef.current.push({
            id: Math.random(), type: Math.random() > 0.3 ? ParticleType.FIRE : ParticleType.SMOKE,
            x, y, radius: Math.random() * 20 + 10, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            alpha: 1, color: Math.random() > 0.5 ? '#fca5a5' : '#f87171', life: Math.random() * 0.5 + 0.3, maxLife: 0.8, growth: 30
          });
      }
      createParticles(x, y, ParticleType.SPARKLE, 10, '#fcd34d');
  };

  const drawStars = (ctx: CanvasRenderingContext2D, timestamp: number) => {
    ctx.fillStyle = "white";
    starsRef.current.forEach(star => {
       const flicker = Math.sin(timestamp * 0.003 + star.phase);
       ctx.globalAlpha = 0.4 + 0.6 * Math.abs(flicker);
       ctx.beginPath();
       ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
       ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  };

  const drawBgClouds = (ctx: CanvasRenderingContext2D) => {
    bgCloudsRef.current.forEach(c => {
        ctx.fillStyle = `rgba(255,255,255,${c.opacity})`;
        ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.scale, c.scale);
        ctx.beginPath(); ctx.arc(0,0, 30, 0, Math.PI*2); ctx.arc(25, -10, 35, 0, Math.PI*2); ctx.arc(50, 0, 30, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    });
  };

  const createParticles = (x: number, y: number, type: ParticleType, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      const speed = Math.random() * 5 + 2;
      const angle = Math.random() * Math.PI * 2;
      particlesRef.current.push({
        id: Math.random(), type, x, y,
        radius: type === ParticleType.SNOW ? Math.random() * 3 + 1 : Math.random() * 4 + 2,
        vx: type === ParticleType.SNOW ? -Math.random() * 3 - 2 : Math.cos(angle) * speed,
        vy: type === ParticleType.SNOW ? Math.random() * 2 + 1 : Math.sin(angle) * speed,
        alpha: 1, color, life: Math.random() * 1 + 0.5, maxLife: 1.5, growth: 0
      });
    }
  };

  const applyPowerup = (type: PowerupType) => {
    const player = playerRef.current;
    switch (type) {
      case PowerupType.SPEED: player.speedTimer = 7.0; break;
      case PowerupType.SNOWBALLS: player.snowballs += 5; break;
      case PowerupType.BLAST:
        flashTimerRef.current = 0.15; shakeRef.current = 30; 
        createExplosion(player.x + player.width/2, player.y + player.height/2);
        obstaclesRef.current.forEach(o => { createExplosion(o.x + o.width/2, o.y + o.height/2); scoreRef.current += 50; });
        obstaclesRef.current = [];
        soundManager.playCrash();
        break;
      case PowerupType.HEALING: player.healingTimer = 5.0; break;
      case PowerupType.LIFE: if (player.lives < 3) player.lives++; soundManager.playHeal(); break;
    }
  };

  const checkCollision = (rect1: Entity, rect2: Entity) => {
    return (
      rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y
    );
  };

  const drawParallaxLayer = (ctx: CanvasRenderingContext2D, layer: BackgroundLayer, baseY: number, color: string, timestamp: number, trees?: boolean[]) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(0, CANVAS_HEIGHT);
      for (let i = 0; i < layer.points.length - 1; i++) {
          const x = (i * 50) + layer.offset; const y = baseY + layer.points[i];
          const nextX = ((i + 1) * 50) + layer.offset; const nextY = baseY + layer.points[i+1];
          const cx = (x + nextX) / 2; const cy = (y + nextY) / 2;
          if (i === 0) ctx.moveTo(x, y); else ctx.quadraticCurveTo(x, y, cx, cy);
      }
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT); ctx.lineTo(0, CANVAS_HEIGHT); ctx.fill();
      if (trees) {
         for (let i = 0; i < layer.points.length; i++) {
             if (trees[i]) {
                  const x = (i * 50) + layer.offset; const y = baseY + layer.points[i];
                  if (x > -50 && x < CANVAS_WIDTH + 50) {
                      if (baseY > CANVAS_HEIGHT - 100) drawBackgroundTree(ctx, x, y, timestamp, i);
                      else drawBackgroundBush(ctx, x, y);
                  }
             }
         }
      }
  };

  const drawBackgroundTree = (ctx: CanvasRenderingContext2D, x: number, y: number, timestamp: number, id: number) => {
      const sway = Math.sin(timestamp / 1000 + id) * 0.1; 
      ctx.save(); ctx.translate(x, y); ctx.rotate(sway); ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8, 0); ctx.lineTo(0, -25); ctx.lineTo(8, 0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-6, -10); ctx.lineTo(0, -30); ctx.lineTo(6, -10); ctx.fill();
      ctx.restore();
  };

  const drawBackgroundBush = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.fillStyle = "rgba(30, 41, 59, 0.5)";
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI, true); ctx.arc(x+10, y+2, 6, 0, Math.PI, true); ctx.arc(x-10, y+2, 6, 0, Math.PI, true); ctx.fill();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
    if (player.isInvincible && Math.floor(Date.now() / 50) % 2 === 0) return;
    ctx.save(); ctx.translate(player.x + player.width/2, player.y + player.height/2); ctx.rotate(player.angle);
    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 10;
    const grad = ctx.createLinearGradient(0, -20, 0, 20); grad.addColorStop(0, "#dc2626"); grad.addColorStop(1, "#991b1b"); ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(-30, 10); ctx.bezierCurveTo(-20, 25, 20, 25, 30, 10); ctx.lineTo(30, -5); ctx.lineTo(-30, -5); ctx.fill();
    ctx.strokeStyle = "#facc15"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-25, 20); ctx.lineTo(25, 20); ctx.moveTo(-25, 20); ctx.bezierCurveTo(-35, 15, -35, 5, -25, 5); ctx.stroke();
    ctx.fillStyle = "#fca5a5"; ctx.beginPath(); ctx.arc(0, -15, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(0, -12, 8, 0, Math.PI); ctx.fill();
    ctx.fillStyle = "red"; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(8, -18); ctx.lineTo(0, -30); ctx.fill();
    ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(0, -30, 3, 0, Math.PI*2); ctx.fill();
    if (player.speedTimer > 0) { ctx.shadowColor = "#f87171"; ctx.shadowBlur = 20; ctx.strokeStyle = "#fca5a5"; ctx.strokeRect(-35, -25, 70, 50); }
    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle, timestamp: number, progress: number) => {
    ctx.save(); ctx.translate(obs.x, obs.y);
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10;
    if (obs.type === 'TREE') {
      const sway = Math.sin(timestamp / 400 + obs.id) * 0.05; ctx.rotate(sway);
      ctx.fillStyle = "#4d2e1c"; ctx.fillRect(obs.width/2 - 6, obs.height - 15, 12, 15);
      const grad = ctx.createLinearGradient(0, 0, 0, obs.height); grad.addColorStop(0, "#22c55e"); grad.addColorStop(1, "#14532d"); ctx.fillStyle = grad;
      const layers = 3; const layerHeight = (obs.height - 15) / layers;
      for(let i=0; i<layers; i++) {
          ctx.beginPath(); const width = obs.width - (i * 10); const y = (layers - 1 - i) * layerHeight;
          ctx.moveTo(obs.width/2, y - layerHeight); ctx.lineTo(obs.width/2 + width/2, y + layerHeight); ctx.lineTo(obs.width/2 - width/2, y + layerHeight);
          ctx.fill(); ctx.stroke();
      }
    } else if (obs.type === 'BUILDING') {
      const grad = ctx.createLinearGradient(0, 0, 0, obs.height); grad.addColorStop(0, "#475569"); grad.addColorStop(1, "#0f172a"); ctx.fillStyle = grad;
      ctx.fillRect(0,0, obs.width, obs.height); ctx.strokeRect(0,0, obs.width, obs.height); ctx.shadowBlur = 5;
      for(let i=10; i<obs.width-10; i+=20) {
        for(let j=10; j<obs.height-10; j+=25) {
          const flicker = Math.sin(timestamp / 200 + i * j) > 0;
          if (flicker || progress > 0.5) { ctx.fillStyle = progress > 0.7 ? "#fff7ed" : "#fbbf24"; ctx.shadowColor = ctx.fillStyle; } 
          else { ctx.fillStyle = "#1e293b"; ctx.shadowColor = "transparent"; }
          ctx.fillRect(i, j, 12, 18);
        }
      }
    } else if (obs.type === 'CLOUD') {
        ctx.fillStyle = "rgba(255,255,255, 0.8)"; const scale = 1 + Math.sin(timestamp / 1000) * 0.05; ctx.scale(scale, scale);
        ctx.beginPath(); ctx.arc(20, 20, 20, 0, Math.PI*2); ctx.arc(50, 20, 25, 0, Math.PI*2); ctx.arc(80, 20, 15, 0, Math.PI*2); ctx.fill();
    } else if (obs.type === 'SNOWMAN') {
        ctx.rotate(Math.sin(timestamp / 300) * 0.1);
        ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(30, 50, 20, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(30, 25, 15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(30, 5, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "orange"; ctx.beginPath(); ctx.moveTo(30, 5); ctx.lineTo(45, 8); ctx.lineTo(30, 10); ctx.fill();
        ctx.fillStyle = "black"; ctx.beginPath(); ctx.arc(26, 2, 2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(34, 2, 2, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(20, 15); ctx.quadraticCurveTo(30, 20, 40, 15); ctx.stroke();
    } else if (obs.type === 'BIRD') {
        const flap = Math.sin(timestamp / 100) * 10; ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.ellipse(obs.width/2, obs.height/2, 15, 8, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(obs.width/2 - 5, obs.height/2 - 5);
        ctx.quadraticCurveTo(obs.width/2 - 15, obs.height/2 - 20 + flap, obs.width/2 - 25, obs.height/2 - 5 + flap);
        ctx.moveTo(obs.width/2 + 5, obs.height/2 - 5); ctx.quadraticCurveTo(obs.width/2 + 15, obs.height/2 - 20 + flap, obs.width/2 + 25, obs.height/2 - 5 + flap); ctx.stroke();
        ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.moveTo(obs.width/2 - 15, obs.height/2); ctx.lineTo(obs.width/2 - 22, obs.height/2 + 3); ctx.lineTo(obs.width/2 - 15, obs.height/2 + 6); ctx.fill();
    }
    ctx.restore();
  };

  const drawLandmark = (ctx: CanvasRenderingContext2D, lm: Landmark) => {
      ctx.save(); ctx.translate(lm.x, lm.y);
      if (lm.type === 'CLOCK_TOWER') {
          ctx.fillStyle = "#0f172a";
          ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(lm.width/2, -80); ctx.lineTo(lm.width + 10, 0); ctx.fill();

          ctx.fillStyle = "#1e293b";
          ctx.fillRect(0, 0, lm.width, lm.height);
          ctx.fillStyle = "#fef3c7";
          ctx.beginPath(); ctx.arc(lm.width/2, 60, 40, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(lm.width/2, 60); ctx.lineTo(lm.width/2, 30); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(lm.width/2, 60); ctx.lineTo(lm.width/2 + 20, 60); ctx.stroke();
      } else if (lm.type === 'LIGHTHOUSE') {
           ctx.fillStyle = "#ef4444";
           ctx.beginPath(); ctx.moveTo(20, lm.height); ctx.lineTo(lm.width-20, lm.height); ctx.lineTo(lm.width/2 + 20, 40); ctx.lineTo(lm.width/2 - 20, 40); ctx.fill();
           ctx.fillStyle = "#fff"; 
           ctx.fillRect(25, lm.height - 100, lm.width - 50, 20);
           ctx.fillRect(30, lm.height - 200, lm.width - 60, 20);
           ctx.fillStyle = "yellow"; ctx.globalAlpha = 0.6;
           ctx.beginPath(); ctx.moveTo(lm.width/2, 40); ctx.lineTo(-200, -100); ctx.lineTo(200, -100); ctx.fill();
      } else if (lm.type === 'FINAL_HOUSE') {
           ctx.fillStyle = "#78350f"; 
           ctx.fillRect(20, lm.height - 150, lm.width - 40, 150);
           ctx.fillStyle = "#451a03"; 
           ctx.beginPath(); ctx.moveTo(0, lm.height - 150); ctx.lineTo(lm.width/2, lm.height - 280); ctx.lineTo(lm.width, lm.height - 150); ctx.fill();
           ctx.fillStyle = "#fbbf24"; 
           ctx.fillRect(40, lm.height - 100, 40, 40); ctx.fillRect(lm.width - 80, lm.height - 100, 40, 40);
      } else {
          ctx.fillStyle = "#334155";
          ctx.fillRect(0, 0, lm.width, lm.height);
          ctx.fillStyle = "#475569";
          for(let i=10; i<lm.width-10; i+=20) {
               for(let j=20; j<lm.height-10; j+=40) {
                   ctx.fillRect(i, j, 12, 25);
               }
          }
      }
      ctx.restore();
  };

  const drawPowerup = (ctx: CanvasRenderingContext2D, pup: Powerup) => {
      ctx.save(); 
      ctx.translate(pup.x, pup.y);
      
      ctx.fillStyle = POWERUP_COLORS[pup.type];
      ctx.shadowColor = POWERUP_COLORS[pup.type];
      ctx.shadowBlur = 15;
      ctx.fillRect(0, 0, pup.width, pup.height);
      
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(pup.width / 2 - 5, 0, 10, pup.height);
      ctx.fillRect(0, pup.height / 2 - 5, pup.width, 10);
      
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(pup.width / 2 - 8, -4, 8, 0, Math.PI * 2);
      ctx.arc(pup.width / 2 + 8, -4, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, pup.width, pup.height);
      
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "20px Arial";
      let icon = "⚡";
      switch(pup.type) {
          case PowerupType.SPEED: icon = "⚡"; break;
          case PowerupType.SNOWBALLS: icon = "❄️"; break;
          case PowerupType.BLAST: icon = "💥"; break;
          case PowerupType.HEALING: icon = "➕"; break;
          case PowerupType.LIFE: icon = "❤️"; break;
      }
      ctx.fillText(icon, pup.width/2, pup.height/2);

      ctx.restore();
  };

  const drawLetter = (ctx: CanvasRenderingContext2D, letter: Letter) => {
      ctx.save(); ctx.translate(letter.x, letter.y);
      ctx.rotate(Math.sin(letter.floatOffset) * 0.2);
      
      const isGolden = letter.variant === 'GOLDEN';
      const isSad = letter.variant === 'SAD';
      const isVillain = letter.variant === 'VILLAIN';

      let bgColor = "#f1f5f9";
      let shadowColor = "rgba(0,0,0,0.3)";
      let flapColor = "#e2e8f0";
      let stampColor = "#ef4444";
      let borderColor = "";

      if (isGolden) {
         bgColor = "#fef3c7"; shadowColor = "#fbbf24"; flapColor = "#fde68a"; borderColor = "#d97706";
      } else if (isSad) {
         bgColor = "#cbd5e1"; shadowColor = "rgba(0,0,0,0.5)"; flapColor = "#94a3b8"; stampColor = "#475569";
      } else if (isVillain) {
         bgColor = "#1a0505"; shadowColor = "#ef4444"; flapColor = "#450a0a"; stampColor = "#7f1d1d"; borderColor = "#ef4444";
      }

      ctx.fillStyle = bgColor;
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = (isGolden || isVillain) ? 15 : 5;
      
      ctx.fillRect(0, 0, letter.width, letter.height);
      ctx.fillStyle = flapColor;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(letter.width/2, letter.height/1.5); ctx.lineTo(letter.width, 0); ctx.fill();
      
      if (borderColor) {
          ctx.strokeStyle = borderColor; ctx.lineWidth = 1; ctx.strokeRect(0,0, letter.width, letter.height);
      }
      
      ctx.fillStyle = stampColor;
      ctx.beginPath(); ctx.arc(letter.width/2, letter.height/2.5, 4, 0, Math.PI*2); ctx.fill();
      
      ctx.restore();
  };

  return (
    <div className="relative w-full h-full max-w-[1200px] max-h-[600px] mx-auto border-4 border-slate-800 shadow-2xl rounded-xl overflow-hidden bg-black">
      <canvas 
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-cover"
      />
      
      {gameState !== GameState.INTRO && !cinematicMode && !isEndingSequenceRef.current && (
        <UIOverlay 
          lives={hudState.lives}
          snowballs={hudState.snowballs}
          progress={hudState.progress}
          timeLeft={hudState.timeLeft}
          activePowerups={hudState.activeSpeed + hudState.activeHealing}
          currentLevelName={gameMode === GameMode.ENDLESS ? "Endless Flight" : LEVELS[hudState.levelIndex].name}
          score={hudState.score}
          collectedPowerups={hudState.collectedPowerups}
          activeDialogue={hudState.activeDialogue}
          activeWish={hudState.activeWish}
          wishesCollected={hudState.wishesCollected}
        />
      )}

      {debugMenuOpen && (
          <div className="absolute top-4 left-4 z-50 bg-slate-900/90 border border-slate-600 p-4 rounded-lg shadow-2xl text-white w-64 animate-fade-in">
              <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  <Trophy size={16} /> Developer Debug
              </h3>
              <div className="space-y-2">
                  <button 
                    onClick={() => {
                        setCinematicMode(!cinematicMode);
                        if (cinematicMode) setPromoMode(false); 
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded ${cinematicMode ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                      <span className="flex items-center gap-2">
                          {cinematicMode ? <EyeOff size={16} /> : <Eye size={16} />}
                          Cinematic Mode
                      </span>
                      <span className="text-xs font-mono">{cinematicMode ? 'ON' : 'OFF'}</span>
                  </button>
                  <button 
                    onClick={triggerPromoExplosion}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white transition-colors text-sm"
                  >
                      <span className="flex items-center gap-2"><Camera size={16} /> Promo Explosion</span>
                  </button>
                  <div className="h-px bg-slate-700 my-2"></div>
                   <button 
                    onClick={onWin}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-sm"
                  >
                     <span className="flex items-center gap-2"><Trophy size={14} /> Force Victory</span>
                  </button>
                  <button 
                    onClick={() => { 
                        distanceRef.current = VICTORY_DISTANCE * 0.90; 
                        soundManager.stopEndingMusic();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-sm"
                  >
                     <span className="flex items-center gap-2"><FastForward size={14} /> Skip to Dawn (90%)</span>
                  </button>
                  <button 
                    onClick={() => { playerRef.current.lives = 0; }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-red-300 text-sm"
                  >
                     <span className="flex items-center gap-2"><Skull size={14} /> Force Game Over</span>
                  </button>
                   <button 
                    onClick={() => { wishesCollectedCountRef.current += 5; }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-amber-300 text-sm"
                  >
                     <span className="flex items-center gap-2"><Mail size={14} /> Add 5 Wishes</span>
                  </button>
              </div>
          </div>
      )}
      
      <div className="absolute inset-0 flex md:hidden z-40 pointer-events-auto">
        <div className="w-1/2 h-full" onTouchStart={(e) => { e.preventDefault(); if(!isEndingSequenceRef.current) {playerRef.current.vy = JUMP_STRENGTH; soundManager.playJump();} }} />
        <div className="w-1/2 h-full" onTouchStart={(e) => { e.preventDefault(); if(!isEndingSequenceRef.current) {shootSnowball();} }} />
      </div>
    </div>
  );
};

export default GameCanvas;
