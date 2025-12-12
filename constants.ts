
import { LevelConfig, PowerupType, DialogueLine } from './types.ts';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 600;
export const GRAVITY = 0.4;
export const JUMP_STRENGTH = -8;
export const FLIGHT_LIFT = -0.5;
export const BASE_SPEED = 5;

export const REQUIRED_WISHES = 30;

export const POWERUP_COLORS: Record<PowerupType, string> = {
  [PowerupType.SPEED]: '#ef4444',
  [PowerupType.SNOWBALLS]: '#06b6d4',
  [PowerupType.BLAST]: '#eab308',
  [PowerupType.HEALING]: '#22c55e',
  [PowerupType.LIFE]: '#ec4899',
};

export const LEVEL_THRESHOLDS = [0, 20, 50, 70, 90];

export const LEVELS: LevelConfig[] = [
  {
    name: "The Departure",
    description: "The North Pole is behind us. Fly fast!",
    backgroundGradient: ['#1e3a8a', '#60a5fa'], 
    obstacleSpeedMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    weatherIntensity: 1,
  },
  {
    name: "The Gray World",
    description: "The colors are fading... Bring them back.",
    backgroundGradient: ['#475569', '#94a3b8'],
    obstacleSpeedMultiplier: 1.1,
    spawnRateMultiplier: 1.1,
    weatherIntensity: 2,
  },
  {
    name: "Ocean of Silence",
    description: "No houses. Just the wind and the deep.",
    backgroundGradient: ['#0f172a', '#1e293b'],
    obstacleSpeedMultiplier: 1.3,
    spawnRateMultiplier: 0.8,
    weatherIntensity: 3,
  },
  {
    name: "The Great Blizzard",
    description: "Hold on! Use your heart to see!",
    backgroundGradient: ['#e2e8f0', '#f8fafc'],
    obstacleSpeedMultiplier: 1.5,
    spawnRateMultiplier: 1.4,
    weatherIntensity: 10,
  },
  {
    name: "The Final Delivery",
    description: "It's time.",
    backgroundGradient: ['#f59e0b', '#fde047'],
    obstacleSpeedMultiplier: 0,
    spawnRateMultiplier: 0,
    weatherIntensity: 0,
  }
];

export const TOTAL_GAME_TIME_SECONDS = 720; 
export const VICTORY_DISTANCE = 250000; 

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

export const SAD_WISHES = [
  "Santa forgot about us.",
  "We are abandoned.",
  "Why didn't you come?",
  "Christmas is a lie.",
  "No toys this year.",
  "Left in the cold.",
  "Nobody cares.",
  "Hope is gone."
];

export const VILLAIN_MESSAGE = "Santa forgot about us. He ABANDONED us. Hatred towards us. I will remember this for the rest of my life. Christmas will never be the same again once I find Santa... and make him pay for creating hopes and dreams for me and then destroying them for never coming.";

export const NARRATIVE_LETTERS = [
    { progress: 0.30, message: "Dear Santa, I don't need toys. I just want my dad to come home safe." },
    { progress: 0.60, message: "I'm too old to believe, but... my little sister isn't. Please visit her." },
    { progress: 0.85, message: "I know you're out there. I left the light on for you." }
];

export const STORY_MOMENTS: { progress: number; dialogue: DialogueLine }[] = [
  { progress: 0.01, dialogue: { id: 'act1_start', speaker: 'Rudolph', text: "The sleigh is heavy with hope tonight, Santa! Let's fly!" } },
  
  { progress: 0.20, dialogue: { id: 'act2_start', speaker: 'Rudolph', text: "The world... it's losing its color. Everything is so gray." } },
  { progress: 0.22, dialogue: { id: 'act2_santa', speaker: 'Santa', text: "They have forgotten the magic. We must re-ignite it, one gift at a time." } },
  { progress: 0.35, dialogue: { id: 'act2_clock', speaker: 'Rudolph', text: "Look! The Old Clock Tower! It's frozen in time!" } },

  { progress: 0.50, dialogue: { id: 'act3_start', speaker: 'Rudolph', text: "The ocean... it's so quiet. Are we the only ones left who believe?" } },
  { progress: 0.55, dialogue: { id: 'act3_santa', speaker: 'Santa', text: "Silence is not empty, old friend. It is full of answers. Keep flying." } },

  { progress: 0.70, dialogue: { id: 'act4_start', speaker: 'Rudolph', text: "I can't see! The storm is too thick! My light is flickering!" } },
  { progress: 0.75, dialogue: { id: 'act4_santa', speaker: 'Santa', text: "Hold on! We cannot fail them! Not now! Follow the letters!" } },

  { progress: 0.90, dialogue: { id: 'act5_start', speaker: 'Rudolph', text: "The wind... it stopped. Santa, look." } },
  { progress: 0.92, dialogue: { id: 'act5_santa', speaker: 'Santa', text: "The dawn. We made it." } }
];

export const LANDMARKS = [
    { progress: 0.35, type: 'CLOCK_TOWER', name: "Frozen Clock Tower" },
    { progress: 0.55, type: 'LIGHTHOUSE', name: "The Last Beacon" },
    { progress: 0.99, type: 'FINAL_HOUSE', name: "The Final Home" }
] as const;
