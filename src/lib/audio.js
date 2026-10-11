import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes a clean tone using Web Audio API (ducking-friendly)
 */
export function playTone(frequency = 880, duration = 0.15, type = 'sine') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Smooth envelope attack and release
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn('Audio tone skipped:', err);
  }
}

/**
 * 3-2-1 Countdown Ticks
 */
export function playCountdownTick() {
  playTone(587.33, 0.1, 'sine'); // D5
  triggerHapticTick();
}

/**
 * Rest Complete Celebration Chime
 */
export function playRestCompleteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Dual-harmonic chime (A5 + C#6)
    playTone(880, 0.35, 'triangle');
    setTimeout(() => {
      playTone(1108.73, 0.5, 'sine');
    }, 120);

    triggerHapticSuccess();
  } catch {}
}

/**
 * PR Broken Fanfare Sound
 */
export function playPrFanfare() {
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.25, 'triangle'), idx * 100);
    });
    triggerHapticSuccess();
  } catch {}
}

/**
 * Haptic feedback wrappers
 */
export async function triggerHapticTick() {
  if (!Capacitor.isNativePlatform()) {
    if (navigator.vibrate) navigator.vibrate(20);
    return;
  }
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

export async function triggerHapticSuccess() {
  if (!Capacitor.isNativePlatform()) {
    if (navigator.vibrate) navigator.vibrate([40, 60, 80]);
    return;
  }
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}
