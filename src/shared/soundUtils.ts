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

function playTone(frequency: number, durationMs: number, volume = 0.04) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
}

export const playHoverSound = () => playTone(520, 40, 0.025);

export const playClickSound = () => playTone(600, 60, 0.035);
