// ============================================================
// SOUND EFFECTS - Web Audio API + Voice Synthesis
// ============================================================

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* silent */ }
}

function playNoise(duration: number, volume = 0.1) {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch { /* silent */ }
}

// Voice names for dice results (Indonesian)
const DICE_VOICE_WORDS: Record<number, string> = {
  1: 'satu',
  2: 'dua',
  3: 'tiga',
  4: 'empat',
  5: 'lima',
  6: 'enam',
  7: 'tujuh',
  8: 'delapan',
  9: 'sembilan',
  10: 'sepuluh',
  11: 'sebelas',
  12: 'dua belas',
};

function speakNumber(num: number) {
  try {
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = DICE_VOICE_WORDS[num] || num.toString();
    utterance.lang = 'id-ID';
    utterance.rate = 0.85;
    utterance.pitch = 0.7;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch { /* silent */ }
}

export const SoundEffects = {
  diceRoll() {
    // Shaky rattle sound
    for (let i = 0; i < 8; i++) {
      setTimeout(() => playNoise(0.05, 0.15), i * 50);
    }
    // Final thud
    setTimeout(() => playTone(120, 0.15, 'sine', 0.25), 400);
  },

  diceResult(total: number) {
    // Play thud + voice the number
    playTone(200, 0.08, 'square', 0.15);
    setTimeout(() => playTone(150, 0.1, 'sine', 0.2), 30);
    // Speak the number after a short delay
    setTimeout(() => speakNumber(total), 200);
  },

  cardDraw() {
    playTone(800, 0.08, 'sine', 0.15);
    setTimeout(() => playTone(1200, 0.06, 'sine', 0.12), 60);
    setTimeout(() => playTone(1600, 0.05, 'sine', 0.1), 120);
  },

  buyProperty() {
    // Cash register cha-ching
    playTone(1200, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1600, 0.08, 'sine', 0.18), 80);
    setTimeout(() => playTone(2000, 0.15, 'sine', 0.15), 160);
  },

  payRent() {
    playTone(400, 0.1, 'sawtooth', 0.1);
    setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.08), 100);
  },

  achievementUnlock() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.2), i * 120);
    });
  },

  gameOver() {
    const notes = [784, 659, 523, 392];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 200);
    });
  },

  click() {
    playTone(600, 0.03, 'sine', 0.1);
  },

  error() {
    playTone(200, 0.15, 'sawtooth', 0.12);
    setTimeout(() => playTone(180, 0.2, 'sawtooth', 0.1), 100);
  },

  success() {
    playTone(523, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.15), 100);
  },

  turnStart() {
    playTone(440, 0.08, 'sine', 0.12);
    setTimeout(() => playTone(550, 0.1, 'sine', 0.12), 80);
  },
};

let masterVolume = 1;

export function setMasterVolume(vol: number) {
  masterVolume = Math.max(0, Math.min(1, vol));
}

export function getMasterVolume() {
  return masterVolume;
}
