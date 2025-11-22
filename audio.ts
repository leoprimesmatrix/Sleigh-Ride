
// Audio Engine for Sleigh Ride

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  
  // Sleigh Loop
  private sleighSource: AudioBufferSourceNode | null = null;
  private sleighGain: GainNode | null = null;

  // Ending Music
  private endingAudio: HTMLAudioElement | null = null;
  private musicFadeInterval: number | null = null;

  constructor() {
    if (typeof Audio !== 'undefined') {
      this.endingAudio = new Audio('./ending.mp3');
      this.endingAudio.volume = 0; // Start at 0 for fade-in
      this.endingAudio.preload = 'auto';
    }
  }

  init() {
    if (this.ctx) {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return;
    }
    
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.4;
    this.sfxGain.connect(this.masterGain);

    this.startSleighLoop();
    
    // Unlock ending audio on user interaction just in case
    if (this.endingAudio) {
        this.endingAudio.load();
    }
  }

  reset() {
    this.stopEndingMusic();
  }

  // --- SFX Generators ---

  playJump() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime); // Reduced volume
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playShoot() {
    if (!this.ctx || !this.sfxGain) return;
    this.createNoiseBurst(0.05, 2000, 0, 0.3); // Reduced volume
  }

  playCrash() {
    if (!this.ctx || !this.sfxGain) return;
    // Changed from Sawtooth (harsh) to Triangle (softer) and lowered pitch for a "thud"
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(60, this.ctx.currentTime); // Lower pitch (60Hz)
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime); // Reduced gain
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
    
    // Add low thud noise
    this.createNoiseBurst(0.3, 500, 50, 0.3);
  }

  playPowerup(typeStr: string) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Softer chime
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine'; // Changed from Square to Sine for softness
      osc.frequency.value = freq;
      const startTime = now + i * 0.05;
      
      gain.gain.setValueAtTime(0.05, startTime); // Heavily reduced volume
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  playHeal() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playCollectWish() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 1.0);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.0);
  }

  playTimeWarning() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); 
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  // --- Music Logic ---

  playEndingMusic(startOffsetSeconds: number = 0, fadeDurationSeconds: number = 10) {
    if (!this.endingAudio) {
        console.warn("Ending audio element not initialized");
        return;
    }
    
    console.log(`Triggering ending music with fade.`);
    
    // If already playing, do nothing
    if (!this.endingAudio.paused && this.endingAudio.currentTime > 0) return;

    this.endingAudio.currentTime = startOffsetSeconds;
    this.endingAudio.volume = 0;
    
    this.endingAudio.play()
        .then(() => {
            console.log("Ending music started. Fading in...");
            // Fade in logic
            let vol = 0;
            const step = 1 / (fadeDurationSeconds * 10); // Update every 100ms
            
            if (this.musicFadeInterval) clearInterval(this.musicFadeInterval);
            
            this.musicFadeInterval = window.setInterval(() => {
                if (!this.endingAudio) return;
                vol = Math.min(1, vol + step);
                this.endingAudio.volume = vol;
                if (vol >= 1) {
                    if (this.musicFadeInterval) clearInterval(this.musicFadeInterval);
                }
            }, 100);
        })
        .catch(e => console.error("Failed to play ending music:", e));
  }

  stopEndingMusic() {
    if (this.endingAudio) {
        this.endingAudio.pause();
        this.endingAudio.currentTime = 0;
        this.endingAudio.volume = 0;
    }
    if (this.musicFadeInterval) {
        clearInterval(this.musicFadeInterval);
        this.musicFadeInterval = null;
    }
  }

  // --- Helpers ---

  private createNoiseBurst(duration: number, filterFreq: number, q: number, vol: number = 0.5) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = q;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start();
  }

  // --- Sleigh Loop (Wind + Runners) ---
  private startSleighLoop() {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.sleighSource = this.ctx.createBufferSource();
    this.sleighSource.buffer = buffer;
    this.sleighSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    this.sleighGain = this.ctx.createGain();
    this.sleighGain.gain.value = 0.0; 

    this.sleighSource.connect(filter);
    filter.connect(this.sleighGain);
    this.sleighGain.connect(this.sfxGain);
    this.sleighSource.start();
  }

  setSleighVolume(speed: number) {
    if (this.sleighGain && this.ctx) {
      // Volume logic
      const vol = Math.min(0.2, Math.max(0.05, speed / 50));
      this.sleighGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }
}

export const soundManager = new SoundManager();
