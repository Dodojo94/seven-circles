import type { WeaponSlot } from '../weapons/catalog';

/**
 * Synthetic one-shots. No sampled gun recordings.
 * Call `unlock` from the gesture that takes pointer lock.
 */
export function createSfx(): {
  unlock(): void;
  fire(slot: WeaponSlot): void;
  reload(): void;
} {
  let ctx: AudioContext | null = null;
  let noise: AudioBuffer | null = null;

  function context(): AudioContext | null {
    const AudioCtx = window.AudioContext;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx.state === 'running' ? ctx : null;
  }

  function noiseBuffer(audio: AudioContext): AudioBuffer {
    if (noise) return noise;
    const length = Math.floor(audio.sampleRate * 0.2);
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    noise = buffer;
    return buffer;
  }

  function burst(
    audio: AudioContext,
    dur: number,
    freq: number,
    q: number,
    gainValue: number,
    filterType: BiquadFilterType,
  ): void {
    const time = audio.currentTime;
    const source = audio.createBufferSource();
    source.buffer = noiseBuffer(audio);
    const filter = audio.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, time);
    filter.Q.value = q;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(gainValue, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    source.start(time);
    source.stop(time + dur + 0.02);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  function tone(
    audio: AudioContext,
    freq: number,
    dur: number,
    type: OscillatorType,
    gainValue: number,
    delay = 0,
  ): void {
    const time = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(gainValue, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(time);
    osc.stop(time + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  return {
    unlock(): void {
      context();
    },

    fire(slot: WeaponSlot): void {
      const audio = context();
      if (!audio) return;
      if (slot === 'primary') {
        burst(audio, 0.055, 1700, 0.6, 0.16, 'bandpass');
        tone(audio, 140, 0.05, 'triangle', 0.1);
        return;
      }
      if (slot === 'secondary') {
        burst(audio, 0.09, 720, 0.45, 0.26, 'lowpass');
        tone(audio, 78, 0.12, 'sine', 0.2);
        return;
      }
      burst(audio, 0.08, 2200, 0.7, 0.08, 'highpass');
      tone(audio, 540, 0.06, 'triangle', 0.05);
    },

    reload(): void {
      const audio = context();
      if (!audio) return;
      tone(audio, 1400, 0.03, 'square', 0.035);
      tone(audio, 900, 0.04, 'square', 0.03, 0.06);
    },
  };
}
