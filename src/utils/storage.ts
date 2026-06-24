import type { DisplayConfig } from '../types';
import { DEFAULT_CONFIG } from '../displayConfig';

const STORAGE_KEY = 'mission-display-config';

export function loadConfig(): DisplayConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return JSON.parse(raw) as DisplayConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: DisplayConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}
