import { AdMob, BannerAdPosition, BannerAdSize, RewardAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Standard Google AdMob test IDs for dev/emulators
export const AD_UNITS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',       // Google Test Banner
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712', // Google Test Interstitial
  REWARDED: 'ca-app-pub-3940256099942544/5224354917'      // Google Test Rewarded
};

let isInitialized = false;

export async function initializeAdMob() {
  if (!Capacitor.isNativePlatform()) {
    isInitialized = true;
    return;
  }

  try {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: true
    });
    isInitialized = true;
  } catch (err) {
    console.warn('AdMob initialization notice:', err);
  }
}

/**
 * 1. Non-Intrusive Banner Ad (Shown on Library and Plan screens)
 * Sits comfortably above bottom navigation bar.
 */
export async function showLibraryBanner(adsRemoved = false) {
  if (adsRemoved) return;
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.showBanner({
      adId: AD_UNITS.BANNER,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 68 // Sits above bottom nav bar
    });
  } catch (err) {
    console.warn('Banner ad load skipped:', err);
  }
}

export async function hideBanner() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.hideBanner();
  } catch {}
}

/**
 * 2. High-eCPM Interstitial Ad on "Finish Workout"
 * Strict UX rule: ONLY shown after workout is finalized and user is on celebration screen!
 */
export async function showWorkoutFinishedAd(adsRemoved = false) {
  if (adsRemoved) return;
  if (!Capacitor.isNativePlatform()) {
    console.log('[Dev Ad Preview] Interstitial ad shown after workout completion');
    return;
  }

  try {
    await AdMob.prepareInterstitial({ adId: AD_UNITS.INTERSTITIAL });
    await AdMob.showInterstitial();
  } catch (err) {
    console.warn('Interstitial ad notice:', err);
  }
}

/**
 * 3. Rewarded Ad to Unlock Bonus Themes or Pro Features for 7 Days
 */
export async function showRewardedUnlockAd(onSuccess) {
  if (!Capacitor.isNativePlatform()) {
    // Immediate mock success in browser development
    if (onSuccess) onSuccess({ type: 'pro_reward_unlocked', amount: 1 });
    return;
  }

  try {
    await AdMob.prepareRewardVideoAd({ adId: AD_UNITS.REWARDED });
    const listener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
      if (onSuccess) onSuccess(reward);
      listener.remove();
    });
    await AdMob.showRewardVideoAd();
  } catch (err) {
    console.warn('Rewarded ad notice:', err);
    // Fallback trigger
    if (onSuccess) onSuccess({ type: 'pro_reward_unlocked', amount: 1 });
  }
}
