import { KeepAwake } from '@capacitor-community/keep-awake';
import { Capacitor } from '@capacitor/core';

let webWakeLockSentinel = null;

export async function keepScreenAwake() {
  if (Capacitor.isNativePlatform()) {
    try {
      await KeepAwake.keepAwake();
    } catch (err) {
      console.warn('Native KeepAwake error:', err);
    }
    return;
  }

  // Web Browser Screen Wake Lock API fallback
  if ('wakeLock' in navigator) {
    try {
      webWakeLockSentinel = await navigator.wakeLock.request('screen');
    } catch (err) {
      console.warn('Web wake lock unavailable:', err);
    }
  }
}

export async function allowScreenSleep() {
  if (Capacitor.isNativePlatform()) {
    try {
      await KeepAwake.allowSleep();
    } catch {}
    return;
  }

  if (webWakeLockSentinel) {
    try {
      await webWakeLockSentinel.release();
      webWakeLockSentinel = null;
    } catch {}
  }
}
