const PREFS_KEY = 'monopay_preferences';

export interface Preferences {
  playerName: string;
  lastRoomCode: string;
}

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw) as Preferences;
  } catch {
    // ignore
  }
  return { playerName: '', lastRoomCode: '' };
}

export function savePreferences(prefs: Partial<Preferences>): void {
  const current = loadPreferences();
  const merged = { ...current, ...prefs };
  localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
}
