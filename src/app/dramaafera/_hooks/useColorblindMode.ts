"use client";

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'dramaafera-results-colorblind';
const CHANGE_EVENT = 'dramaafera-colorblind-change';
let fallback = false;
let storageAvailable = true;

function getSnapshot() {
  if (!storageAvailable) return fallback;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return fallback;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useColorblindMode() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const setEnabled = (value: boolean) => {
    fallback = value;
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      storageAvailable = false;
      // Keep the control usable when browser storage is unavailable.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };
  return [enabled, setEnabled] as const;
}
