
import { LevelConfig, PowerupType, DialogueLine } from './types.ts';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 600;
export const GRAVITY = 0.4;
export const JUMP_STRENGTH = -8;
export const FLIGHT_LIFT = -0.5;
export const BASE_SPEED = 5;

// Powerup Colors
export const POWERUP_COLORS: Record<PowerupType, string> = {
  [PowerupType.SPEED]: '#ef4444', // Red
  [PowerupType.SNOWBALLS]: '#06b6d4', // Cyan
  [PowerupType.BLAST]: '#eab308', // Yellow/Gold
  [PowerupType.HEALING]: '#22c55e', // Green
  [PowerupType.LIFE]: '#ec4899', // Pink
};

// 5-Act Structure Thresholds (0% -> 100%)
export const LEVEL_THRESHOLDS = [0, 20, 50, 70, 90];

export const LEVELS: LevelConfig[] = [
  {
    name: "The Departure", // Act I
    description: "The North Pole is behind us. Fly fast!",
    backgroundGradient: ['#1e3a8a', '#60a5fa'], 
    obstacleSpeedMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    weatherIntensity: 1,
  },
  {
    name: "The Gray World", // Act II
    description: "The colors are fading... Bring them back.",
    backgroundGradient: ['#475569', '#94a3b8'], // Desaturated Slate
    obstacleSpeedMultiplier: 1.1,
    spawnRateMultiplier: 1.1,
    weatherIntensity: 2,
  },
  {
    name: "Ocean of Silence", // Act III
    description: "No houses. Just the wind and the deep.",
    backgroundGradient: ['#0f172a', '#1e293b'], // Very Dark Blue
    obstacleSpeedMultiplier: 1.3,
    spawnRateMultiplier: 0.8, // Fewer obstacles, but tricky aerial ones
    weatherIntensity: 3,
  },
  {
    name: "The Great Blizzard", // Act IV
    description: "Hold on! Use your heart to see!",
    backgroundGradient: ['#e2e8f0', '#f8fafc'], // Whiteout
    obstacleSpeedMultiplier: 1.5,
    spawnRateMultiplier: 1.4,
    weatherIntensity: 10,
  },
  {
    name: "The Final Delivery", // Act V
    description: "It's time.",
    backgroundGradient: ['#f59e0b', '#fde047'], // Sunrise Gold
    obstacleSpeedMultiplier: 0, // No obstacles
    spawnRateMultiplier: 0,
    weatherIntensity: 0,
  }
];

// Calculated Time: Distance 250k / Avg Speed ~450px/s = ~550s (9m 10s).
// Setting to 720s (12 mins) gives a healthy ~3 min buffer for imperfect play.
export const TOTAL_GAME_TIME_SECONDS = 720; 
export const VICTORY_DISTANCE = 250000; 

// --- Narrative Content ---

export const WISHES = [
  "I wish Dad wasn't so sad.",
  "I wish I could make a friend.",
  "I wish Mom was home for dinner.",
  "I just want a hug.",
  "I wish we were all together.",
  "I wish Grandpa wasn't lonely.",
  "I wish for peace and quiet.",
  "I wish to be brave tomorrow."
];

// Specific Narrative Letters for the new Acts
export const NARRATIVE_LETTERS = [
    { progress: 0.30, message: "Dear Santa, I don't need toys. I just want my dad to come home safe." },
    { progress: 0.60, message: "I'm too old to believe, but... my little sister isn't. Please visit her." },
    { progress: 0.85, message: "I know you're out there. I left the light on for you." }
];

export const STORY_MOMENTS: { progress: number; dialogue: DialogueLine }[] = [
  // Act I
  { progress: 0.01, dialogue: { id: 'act1_start', speaker: 'Rudolph', text: "The sleigh is heavy with hope tonight, Santa! Let's fly!" } },
  
  // Act II
  { progress: 0.20, dialogue: { id: 'act2_start', speaker: 'Rudolph', text: "The world... it's losing its color. Everything is so gray." } },
  { progress: 0.22, dialogue: { id: 'act2_santa', speaker: 'Santa', text: "They have forgotten the magic. We must re-ignite it, one gift at a time." } },
  { progress: 0.35, dialogue: { id: 'act2_clock', speaker: 'Rudolph', text: "Look! The Old Clock Tower! It's frozen in time!" } },

  // Act III
  { progress: 0.50, dialogue: { id: 'act3_start', speaker: 'Rudolph', text: "The ocean... it's so quiet. Are we the only ones left who believe?" } },
  { progress: 0.55, dialogue: { id: 'act3_santa', speaker: 'Santa', text: "Silence is not empty, old friend. It is full of answers. Keep flying." } },

  // Act IV
  { progress: 0.70, dialogue: { id: 'act4_start', speaker: 'Rudolph', text: "I can't see! The storm is too thick! My light is flickering!" } },
  { progress: 0.75, dialogue: { id: 'act4_santa', speaker: 'Santa', text: "Hold on! We cannot fail them! Not now! Follow the letters!" } },

  // Act V
  { progress: 0.90, dialogue: { id: 'act5_start', speaker: 'Rudolph', text: "The wind... it stopped. Santa, look." } },
  { progress: 0.92, dialogue: { id: 'act5_santa', speaker: 'Santa', text: "The dawn. We made it." } }
];

export const LANDMARKS = [
    { progress: 0.35, type: 'CLOCK_TOWER', name: "Frozen Clock Tower" },
    { progress: 0.55, type: 'LIGHTHOUSE', name: "The Last Beacon" }, // Moved to Ocean
    { progress: 0.99, type: 'FINAL_HOUSE', name: "The Final Home" }
] as const;
