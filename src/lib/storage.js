import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export const STORAGE_KEY = 'gymbeam_state_v1';
export const FILE_NAME = 'gymbeam_state_mirror.json';

/**
 * Saves state to both localStorage (for fast Web access) and native Filesystem (durable Android mirror)
 */
export async function saveStateToDevice(state) {
  try {
    const json = JSON.stringify(state);
    // 1. Web localStorage
    localStorage.setItem(STORAGE_KEY, json);

    // 2. Native durable Android storage (immune to WebView cleanup)
    await Filesystem.writeFile({
      path: FILE_NAME,
      data: json,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
  } catch (err) {
    // Non-fatal if running in pure browser environment
  }
}

/**
 * Loads state from native Filesystem first, falling back to localStorage
 */
export async function loadStateFromDevice() {
  try {
    const file = await Filesystem.readFile({
      path: FILE_NAME,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    if (file && file.data) {
      return JSON.parse(file.data);
    }
  } catch {
    // Fallback to localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
  }
  return null;
}
