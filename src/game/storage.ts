import type { Records } from './types';

const BEST_FLOOR_KEY = 'numericTowerBestFloor';
const BEST_DAMAGE_KEY = 'numericTowerBestDamage';
const CLEAR_COUNT_KEY = 'numericTowerClearCount';

const fallbackRecords: Records = {
  bestFloor: 1,
  bestDamage: 0,
  clearCount: 0,
};

function readNumber(key: string, fallback: number): number {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = Number(window.localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

export function loadRecords(): Records {
  return {
    bestFloor: readNumber(BEST_FLOOR_KEY, fallbackRecords.bestFloor),
    bestDamage: readNumber(BEST_DAMAGE_KEY, fallbackRecords.bestDamage),
    clearCount: readNumber(CLEAR_COUNT_KEY, fallbackRecords.clearCount),
  };
}

export function saveRecords(records: Records): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(BEST_FLOOR_KEY, String(records.bestFloor));
  window.localStorage.setItem(BEST_DAMAGE_KEY, String(records.bestDamage));
  window.localStorage.setItem(CLEAR_COUNT_KEY, String(records.clearCount));
}
