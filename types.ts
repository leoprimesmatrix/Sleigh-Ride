
export enum GameState {
  MENU,
  HELP,
  INTRO,
  PLAYING,
  GAME_OVER,
  VICTORY,
  BAD_ENDING
}

export enum GameMode {
  STORY,
  ENDLESS
}

export enum PowerupType {
  SPEED = 'SPEED',
  SNOWBALLS = 'SNOWBALLS',
  BLAST = 'BLAST',
  HEALING = 'HEALING',
  LIFE = 'LIFE'
}

export interface Entity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  markedForDeletion: boolean;
}

export interface Player extends Entity {
  vy: number;
  lives: number;
  snowballs: number;
  isInvincible: boolean;
  invincibleTimer: number;
  healingTimer: number;
  speedTimer: number;
  angle: number;
}

export interface Obstacle extends Entity {
  type: 'TREE' | 'BIRD' | 'SNOWMAN' | 'BUILDING' | 'CLOUD';
  rotation?: number;
}

export interface Landmark extends Entity {
  type: 'HOSPITAL' | 'ORPHANAGE' | 'LIGHTHOUSE' | 'CLOCK_TOWER' | 'FINAL_HOUSE';
  name: string;
}

export interface Powerup extends Entity {
  type: PowerupType;
  floatOffset: number;
}

export type LetterVariant = 'NORMAL' | 'GOLDEN' | 'SAD' | 'VILLAIN';

export interface Letter extends Entity {
  message: string;
  floatOffset: number;
  variant: LetterVariant;
}

export interface Projectile extends Entity {
  vx: number;
  trail: {x: number, y: number}[];
}

export enum ParticleType {
  SNOW,
  SPARKLE,
  DEBRIS,
  SMOKE,
  GLOW,
  SHOCKWAVE,
  FIRE,
  LIFE
}

export interface Particle {
  id: number;
  type: ParticleType;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  growth: number;
}

export interface LevelConfig {
  name: string;
  description: string;
  backgroundGradient: [string, string];
  obstacleSpeedMultiplier: number;
  spawnRateMultiplier: number;
  weatherIntensity: number;
}

export interface BackgroundLayer {
  points: number[];
  color: string;
  speedModifier: number;
  offset: number;
}

export interface DialogueLine {
  id: string;
  speaker: 'Santa' | 'Rudolph';
  text: string;
}
