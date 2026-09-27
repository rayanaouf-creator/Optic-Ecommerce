import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface StoreSettings {
  logoUrl?: string;
  storeName?: string;
  storeSubtitle?: string;
  uploadthingToken?: string;
  metaPixelId?: string;
  updatedAt?: any;
}

const SETTINGS_COLLECTION = 'settings';
const GENERAL_DOC_ID = 'general';
const LOCAL_LOGO_KEY = 'optica_custom_logo_url';
const LOCAL_STORE_NAME_KEY = 'optica_store_name';
const LOCAL_STORE_SUBTITLE_KEY = 'optica_store_subtitle';
const LOCAL_UPLOADTHING_TOKEN_KEY = 'optica_uploadthing_token';

/**
 * Fetch settings from Firestore with graceful fallback to localStorage and defaults
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as StoreSettings;
      // sync to local storage cache
      if (data.logoUrl) localStorage.setItem(LOCAL_LOGO_KEY, data.logoUrl);
      if (data.storeName) localStorage.setItem(LOCAL_STORE_NAME_KEY, data.storeName);
      if (data.storeSubtitle) localStorage.setItem(LOCAL_STORE_SUBTITLE_KEY, data.storeSubtitle);
      if (data.uploadthingToken) localStorage.setItem(LOCAL_UPLOADTHING_TOKEN_KEY, data.uploadthingToken);
      return data;
    }
  } catch (err) {
    console.warn('Could not read store settings from Firestore, checking localStorage cache:', err);
  }

  // Fallback to local storage
  return {
    logoUrl: localStorage.getItem(LOCAL_LOGO_KEY) || '',
    storeName: localStorage.getItem(LOCAL_STORE_NAME_KEY) || 'VISIOTTICA',
    storeSubtitle: localStorage.getItem(LOCAL_STORE_SUBTITLE_KEY) || 'EYEWEAR',
    uploadthingToken: localStorage.getItem(LOCAL_UPLOADTHING_TOKEN_KEY) || ''
  };
}

/**
 * Save settings to Firestore and localStorage
 */
export async function saveStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
  // Update local storage immediate cache
  if (settings.logoUrl !== undefined) {
    if (settings.logoUrl) localStorage.setItem(LOCAL_LOGO_KEY, settings.logoUrl);
    else localStorage.removeItem(LOCAL_LOGO_KEY);
  }
  if (settings.storeName !== undefined) {
    localStorage.setItem(LOCAL_STORE_NAME_KEY, settings.storeName || 'VISIOTTICA');
  }
  if (settings.storeSubtitle !== undefined) {
    localStorage.setItem(LOCAL_STORE_SUBTITLE_KEY, settings.storeSubtitle || 'EYEWEAR');
  }
  if (settings.uploadthingToken !== undefined) {
    if (settings.uploadthingToken) localStorage.setItem(LOCAL_UPLOADTHING_TOKEN_KEY, settings.uploadthingToken);
    else localStorage.removeItem(LOCAL_UPLOADTHING_TOKEN_KEY);
  }

  // Sync to Firestore for all users & devices
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Failed to sync settings to Firestore:', err);
    throw err;
  }
}

/**
 * Subscribe to real-time changes of store settings
 */
export function subscribeToStoreSettings(callback: (settings: StoreSettings) => void) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreSettings;
        if (data.logoUrl) localStorage.setItem(LOCAL_LOGO_KEY, data.logoUrl);
        if (data.storeName) localStorage.setItem(LOCAL_STORE_NAME_KEY, data.storeName);
        if (data.storeSubtitle) localStorage.setItem(LOCAL_STORE_SUBTITLE_KEY, data.storeSubtitle);
        if (data.uploadthingToken) localStorage.setItem(LOCAL_UPLOADTHING_TOKEN_KEY, data.uploadthingToken);
        callback(data);
      } else {
        callback({
          logoUrl: localStorage.getItem(LOCAL_LOGO_KEY) || '',
          storeName: localStorage.getItem(LOCAL_STORE_NAME_KEY) || 'VISIOTTICA',
          storeSubtitle: localStorage.getItem(LOCAL_STORE_SUBTITLE_KEY) || 'EYEWEAR',
          uploadthingToken: localStorage.getItem(LOCAL_UPLOADTHING_TOKEN_KEY) || ''
        });
      }
    }, (error) => {
      console.warn('Real-time store settings subscription error:', error);
      callback({
        logoUrl: localStorage.getItem(LOCAL_LOGO_KEY) || '',
        storeName: localStorage.getItem(LOCAL_STORE_NAME_KEY) || 'VISIOTTICA',
        storeSubtitle: localStorage.getItem(LOCAL_STORE_SUBTITLE_KEY) || 'EYEWEAR',
        uploadthingToken: localStorage.getItem(LOCAL_UPLOADTHING_TOKEN_KEY) || ''
      });
    });
  } catch (e) {
    console.warn('Error subscribing to store settings:', e);
    callback({
      logoUrl: localStorage.getItem(LOCAL_LOGO_KEY) || '',
      storeName: localStorage.getItem(LOCAL_STORE_NAME_KEY) || 'VISIOTTICA',
      storeSubtitle: localStorage.getItem(LOCAL_STORE_SUBTITLE_KEY) || 'EYEWEAR',
      uploadthingToken: localStorage.getItem(LOCAL_UPLOADTHING_TOKEN_KEY) || ''
    });
    return () => {};
  }
}
