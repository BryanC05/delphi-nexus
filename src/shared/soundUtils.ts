let audioContext: AudioContext | null = null;

function createAudioContext(): AudioContext | null {
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

export const isSoundEnabled = (): boolean => localStorage.getItem('soundEnabled') === 'true';

export const setSoundEnabled = (enabled: boolean) => {
  localStorage.setItem('soundEnabled', enabled ? 'true' : 'false');
};

export const toggleSound = (enabled: boolean) => {
  setSoundEnabled(enabled);
};

function getAudioContext(): AudioContext | null {
  if (!isSoundEnabled()) return null;
  try {
    if (!audioContext) {
      audioContext = createAudioContext();
    }
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

function playVintageClick(freq = 880, duration = 0.035, volume = 0.02) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Ignore audio error
  }
}

function playBrassChime(freq = 554.37, duration = 0.14, volume = 0.035) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Ignore audio error
  }
}

export const playHoverSound = () => playVintageClick(880, 0.03, 0.02);

export const playClickSound = () => playBrassChime(587.33, 0.14, 0.035);
