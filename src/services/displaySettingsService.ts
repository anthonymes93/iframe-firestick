import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_CONFIG } from '../displayConfig';
import type { DisplayConfig } from '../types';

const SETTINGS_REF = () => doc(db, 'displaySettings', 'main');

export async function loadSettings(): Promise<DisplayConfig> {
  let snap;
  try {
    snap = await getDoc(SETTINGS_REF());
  } catch (err) {
    console.error('[displaySettingsService] Failed to load settings from Firestore:', err);
    throw err;
  }

  if (!snap.exists()) {
    console.info('[displaySettingsService] No settings document found — creating from default config.');
    await saveSettings(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  const data = snap.data();
  return {
    defaultDurationMinutes: data.defaultDurationMinutes ?? DEFAULT_CONFIG.defaultDurationMinutes,
    pages: data.pages ?? DEFAULT_CONFIG.pages,
  };
}

export async function saveSettings(config: DisplayConfig): Promise<void> {
  try {
    await setDoc(SETTINGS_REF(), {
      defaultDurationMinutes: config.defaultDurationMinutes,
      pages: config.pages,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('[displaySettingsService] Failed to save settings to Firestore:', err);
    throw err;
  }
}
