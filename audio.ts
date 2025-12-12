

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  
  private sleighSource: AudioBufferSourceNode | null = null;
  private sleighGain: GainNode | null = null;

  private endingAudio: HTMLAudioElement | null = null;
  private musicFadeInterval: number | null = null;

  private bgmTracks: Map<string, HTMLAudioElement> = new Map();
  private currentBgm: HTMLAudioElement | null = null;

  constructor() {
    if (typeof Audio !== 'undefined') {
      this.endingAudio = new Audio('./ending.mp3');
      this.endingAudio.volume = 0; 
      this.endingAudio.preload = 'auto';

      const tracks = [
          { id: 'wonderland', src: './wonderland.mp3' },
          { id: 'gray_world', src: './gray_world.mp3' },
          { id: 'ocean_of_silence', src: './ocean_of_silence.mp3' },
          { id: 'great_blizzard', src: './great_blizzard.mp3' }
      ];

      tracks.forEach(t => {
          const audio = new Audio(t.src);
          audio.loop = true;
          audio.volume = 0;
          audio.preload = 'auto';
          this.bgmTracks.set(t.id, audio);
      });
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
    
    if (this.endingAudio) this.endingAudio.load();
    this.bgmTracks.forEach(track => track.load());
  }

  reset() {
    this.stopEndingMusic();
    this.stopBgm();
  }

  playLevelBgm(levelIndex: number) {
      let trackKey: string | null = null;
      if (levelIndex === 0) trackKey = 'wonderland';
      else if (levelIndex === 1) trackKey = 'gray_world';
      else if (levelIndex === 2) trackKey = 'ocean_of_silence';
      else if (levelIndex === 3) trackKey = 'great_blizzard';
      
      this.transitionBgm(trackKey);
  }

  stopBgm() {
      this.transitionBgm(null);
  }

  private transitionBgm(trackKey: string | null) {
      const newTrack = trackKey ? this.bgmTracks.get(trackKey) : null;
      
      if (this.currentBgm === newTrack) return; 

      if (this.currentBgm) {
          const oldTrack = this.currentBgm;
          this.fadeVolume(oldTrack, 0, 1000, () => {
              oldTrack.pause();
              oldTrack.currentTime = 0;
          });
      }

      if (newTrack) {
          newTrack.volume = 0;
          newTrack.play().catch(e => console.warn("BGM play failed", e));
          this.fadeVolume(newTrack, 0.3, 1000); 
          this.currentBgm = newTrack;
      } else {
          this.currentBgm = null;
      }
  }

  private fadeVolume(audio: HTMLAudioElement, target: number, duration: number, onComplete?: () => void) {
      // Clear any existing fade interval on this specific audio element if we were tracking it map-wise, 
      // but for simplicity we rely on the rapid updates. 
      // A more robust system would track intervals per audio element.
      // Since we only really fade one BGM out and one in, it's usually fine.
      
      const stepTime = 50;
      const steps = duration / stepTime;
      const diff = target - audio.volume;
      const stepVol = diff / steps;
      
      const interval = setInterval(() => {
          let newVol = audio.volume + stepVol;
          newVol = Math.max(0, Math.min(1, newVol));
          
          // Safety check if audio is paused/ended externally
          if (audio.paused && target > 0) {
             clearInterval(interval);
             return;
          }

          audio.volume = newVol;
          
          if ((stepVol >= 0 && newVol >= target) || (stepVol < 0 && newVol <= target)) {
              audio.volume = target;
              clearInterval(interval);
              if (onComplete) onComplete();
          }
      }, stepTime);
  }

  playJump() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playShoot() {
    if (!this.ctx || !this.sfxGain) return;
    this.createNoiseBurst(0.05, 2000, 0, 0.3); 
  }

  playCrash() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(60, this.ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
    
    this.createNoiseBurst(0.3, 500, 50, 0.3);
  }

  playPowerup(typeStr: string) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine'; 
      osc.frequency.value = freq;
      const startTime = now + i * 0.05;
      
      gain.gain.setValueAtTime(0.05, startTime); 
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

  playEndingMusic(startOffsetSeconds: number = 0, fadeDurationSeconds: number = 5) {
    if (!this.endingAudio) {
        console.warn("Ending audio element not initialized");
        return;
    }
    
    // Stop any existing BGM
    this.stopBgm();
    
    // Ensure any previous ending music fade interval is cleared
    if (this.musicFadeInterval) {
        clearInterval(this.musicFadeInterval);
        this.musicFadeInterval = null;
    }
    
    // Reset volume and time
    this.endingAudio.pause();
    this.endingAudio.currentTime = startOffsetSeconds;
    this.endingAudio.volume = 0;
    
    const playPromise = this.endingAudio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
          let vol = 0;
          const intervalStep = 50; // ms
          const totalSteps = (fadeDurationSeconds * 1000) / intervalStep;
          const volStep = 1.0 / totalSteps;

          this.musicFadeInterval = window.setInterval(() => {
              if (!this.endingAudio) {
                  if (this.musicFadeInterval) clearInterval(this.musicFadeInterval);
                  return;
              }
              
              vol = Math.min(1.0, vol + volStep);
              this.endingAudio.volume = vol;
              
              if (vol >= 1.0) {
                  if (this.musicFadeInterval) clearInterval(this.musicFadeInterval);
              }
          }, intervalStep);
      }).catch(e => {
          console.error("Failed to play ending music:", e);
      });
    }
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
      const vol = Math.min(0.2, Math.max(0.05, speed / 50));
      this.sleighGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }
}

export const soundManager = new SoundManager();
