import { useState, useEffect } from 'react';
import { SystemSettings } from '../types/settings';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'nha_co_tiec_system_settings_v1';
const BROADCAST_CHANNEL_NAME = 'nha_co_tiec_system_settings_channel';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  basicPrice: '59.000',
  premiumPrice: '79.000',
  renewalPrice: '30.000',
  slaHours: '24',
  freeRevisions: '3',
  updatedAt: new Date().toISOString(),
};

let currentSystemSettings: SystemSettings = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load system settings from localStorage', e);
  }
  return DEFAULT_SYSTEM_SETTINGS;
})();

const listeners = new Set<() => void>();

// Cross-tab BroadcastChannel for 0ms multi-tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'SYSTEM_SETTINGS_UPDATED' && event.data?.settings) {
        currentSystemSettings = event.data.settings;
        listeners.forEach((fn) => fn());
      }
    };
  }
} catch (e) {}

// Sync real-time with Firestore `settings/system`
let firestoreInitialized = false;
function initFirestoreSync() {
  if (firestoreInitialized || typeof window === 'undefined') return;
  firestoreInitialized = true;

  try {
    const docRef = doc(db, 'settings', 'system');
    onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as Partial<SystemSettings>;
          currentSystemSettings = {
            ...DEFAULT_SYSTEM_SETTINGS,
            ...remoteData,
            updatedAt: remoteData.updatedAt || new Date().toISOString(),
          };

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSystemSettings));
          } catch (e) {}

          listeners.forEach((fn) => fn());
        } else {
          // If Firestore doc doesn't exist yet, initialize it
          setDoc(docRef, currentSystemSettings, { merge: true }).catch(() => {});
        }
      },
      (err) => {
        console.warn('Firestore settings/system onSnapshot error:', err);
      }
    );
  } catch (e) {
    console.warn('Failed to attach Firestore settings/system listener:', e);
  }
}

initFirestoreSync();

export function getSystemSettings(): SystemSettings {
  return currentSystemSettings;
}

export function updateSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  currentSystemSettings = {
    ...currentSystemSettings,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSystemSettings));
  } catch (e) {
    console.error('Failed to save system settings to localStorage', e);
  }

  try {
    broadcastChannel?.postMessage({
      type: 'SYSTEM_SETTINGS_UPDATED',
      settings: currentSystemSettings,
    });
  } catch (e) {}

  listeners.forEach((fn) => fn());

  try {
    setDoc(doc(db, 'settings', 'system'), currentSystemSettings, { merge: true }).catch((err) => {
      console.warn('Failed to sync system settings to Firestore:', err);
    });
  } catch (e) {}

  return currentSystemSettings;
}

export function useSystemSettings(): SystemSettings {
  const [settings, setSettings] = useState<SystemSettings>(currentSystemSettings);

  useEffect(() => {
    initFirestoreSync();
    const update = () => setSettings(currentSystemSettings);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return settings;
}
