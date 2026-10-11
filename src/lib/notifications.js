import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) {
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch {}
    }
    return true;
  }

  try {
    const status = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  } catch {
    return false;
  }
}

/**
 * Schedules daily workout reminders (100% offline, $0 server cost)
 */
export async function scheduleDailyWorkoutReminder(hour = 18, minute = 0, routineName = 'Today\'s Routine') {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: 'GymBeam · Time to Train! 🔥',
          body: `Today is ${routineName}. Crush your workout and keep your streak alive!`,
          schedule: {
            on: {
              hour,
              minute
            },
            allowWhileIdle: true
          },
          sound: 'beep.wav'
        }
      ]
    });
  } catch (err) {
    console.warn('Local notification schedule skipped:', err);
  }
}

/**
 * Schedules streak saver alert at 8:00 PM
 */
export async function scheduleStreakSaverAlert() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.cancel({ notifications: [{ id: 1002 }] });

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1002,
          title: 'GymBeam · Streak Protector! ⚡',
          body: 'Don\'t break your training streak today! Get a quick workout in 💪',
          schedule: {
            on: {
              hour: 20,
              minute: 0
            },
            allowWhileIdle: true
          }
        }
      ]
    });
  } catch (err) {
    console.warn('Streak alert schedule skipped:', err);
  }
}

/**
 * Schedules a rest-timer notification in case the user backgrounds the app
 */
export async function scheduleRestTimerNotification(seconds) {
  if (seconds <= 0) return;
  if (!Capacitor.isNativePlatform()) return;

  try {
    const at = new Date(Date.now() + seconds * 1000);
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: 'GymBeam · Rest Complete ⏱️',
          body: 'Rest period is over. Get ready for your next set!',
          schedule: { at, allowWhileIdle: true }
        }
      ]
    });
  } catch {}
}

export async function cancelRestTimerNotification() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
  } catch {}
}
