import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export type LogoShape = 'square' | 'rectangle';

export interface StoreSettings {
  logoUrl?: string;
  logoShape?: LogoShape;          // 'square' | 'rectangle'
  showStoreName?: boolean;        // default: true
  showStoreSubtitle?: boolean;    // default: true
  storeName?: string;
  storeSubtitle?: string;
  uploadthingToken?: string;
  metaPixelId?: string;
  updatedAt?: any;
}

const SETTINGS_COLLECTION = 'settings';
const GENERAL_DOC_ID = 'general';
const LOCAL_LOGO_KEY = 'optica_custom_logo_url';
const LOCAL_LOGO_SHAPE_KEY = 'optica_logo_shape';
const LOCAL_SHOW_NAME_KEY = 'optica_show_store_name';
const LOCAL_SHOW_SUBTITLE_KEY = 'optica_show_store_subtitle';
const LOCAL_STORE_NAME_KEY = 'optica_store_name';
const LOCAL_STORE_SUBTITLE_KEY = 'optica_store_subtitle';
const LOCAL_UPLOADTHING_TOKEN_KEY = 'optica_uploadthing_token';

function parseBool(val: string | null, defaultValue: boolean): boolean {
  if (val === null || val === undefined) return defaultValue;
  return val === 'true';
}

/**
 * Get cached settings from localStorage if available (fast first render)
 */
export function getLocalCachedSettings(): StoreSettings | null {
  const cachedLogo = localStorage.getItem(LOCAL_LOGO_KEY);
  const cachedStoreName = localStorage.getItem(LOCAL_STORE_NAME_KEY);
  // Only return cache if user has previously customized or saved settings
  if (cachedLogo !== null || cachedStoreName !== null) {
    return {
      logoUrl: cachedLogo || '',
      logoShape: (localStorage.getItem(LOCAL_LOGO_SHAPE_KEY) as LogoShape) || 'rectangle',
      showStoreName: parseBool(localStorage.getItem(LOCAL_SHOW_NAME_KEY), true),
      showStoreSubtitle: parseBool(localStorage.getItem(LOCAL_SHOW_SUBTITLE_KEY), true),
      storeName: cachedStoreName || '',
      storeSubtitle: localStorage.getItem(LOCAL_STORE_SUBTITLE_KEY) || '',
      uploadthingToken: localStorage.getItem(LOCAL_UPLOADTHING_TOKEN_KEY) || ''
    };
  }
  return null;
}

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
      if (data.logoUrl !== undefined) localStorage.setItem(LOCAL_LOGO_KEY, data.logoUrl);
      if (data.logoShape) localStorage.setItem(LOCAL_LOGO_SHAPE_KEY, data.logoShape);
      if (data.showStoreName !== undefined) localStorage.setItem(LOCAL_SHOW_NAME_KEY, String(data.showStoreName));
      if (data.showStoreSubtitle !== undefined) localStorage.setItem(LOCAL_SHOW_SUBTITLE_KEY, String(data.showStoreSubtitle));
      if (data.storeName !== undefined) localStorage.setItem(LOCAL_STORE_NAME_KEY, data.storeName);
      if (data.storeSubtitle !== undefined) localStorage.setItem(LOCAL_STORE_SUBTITLE_KEY, data.storeSubtitle);
      if (data.uploadthingToken !== undefined) localStorage.setItem(LOCAL_UPLOADTHING_TOKEN_KEY, data.uploadthingToken);
      
      return {
        logoUrl: data.logoUrl || '',
        logoShape: data.logoShape || 'rectangle',
        showStoreName: data.showStoreName !== undefined ? data.showStoreName : true,
        showStoreSubtitle: data.showStoreSubtitle !== undefined ? data.showStoreSubtitle : true,
        storeName: data.storeName || '',
        storeSubtitle: data.storeSubtitle || '',
        ...data
      };
    }
  } catch (err) {
    console.warn('Could not read store settings from Firestore, checking localStorage cache:', err);
  }

  // Fallback to local storage or empty
  return {
    logoUrl: localStorage.getItem(LOCAL_LOGO_KEY) || '',
    logoShape: (localStorage.getItem(LOCAL_LOGO_SHAPE_KEY) as LogoShape) || 'rectangle',
    showStoreName: parseBool(localStorage.getItem(LOCAL_SHOW_NAME_KEY), true),
    showStoreSubtitle: parseBool(localStorage.getItem(LOCAL_SHOW_SUBTITLE_KEY), true),
    storeName: localStorage.getItem(LOCAL_STORE_NAME_KEY) || '',
    storeSubtitle: localStorage.getItem(LOCAL_STORE_SUBTITLE_KEY) || '',
    uploadthingToken: localStorage.getItem(LOCAL_UPLOADTHING_TOKEN_KEY) || ''
  };
}

/**
 * Save settings to Firestore and localStorage
 */
export async function saveStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
  // Update local storage immediate cache
  if (settings.logoUrl !== undefined) {
    localStorage.setItem(LOCAL_LOGO_KEY, settings.logoUrl);
  }
  if (settings.logoShape !== undefined) {
    localStorage.setItem(LOCAL_LOGO_SHAPE_KEY, settings.logoShape);
  }
  if (settings.showStoreName !== undefined) {
    localStorage.setItem(LOCAL_SHOW_NAME_KEY, String(settings.showStoreName));
  }
  if (settings.showStoreSubtitle !== undefined) {
    localStorage.setItem(LOCAL_SHOW_SUBTITLE_KEY, String(settings.showStoreSubtitle));
  }
  if (settings.storeName !== undefined) {
    localStorage.setItem(LOCAL_STORE_NAME_KEY, settings.storeName);
  }
  if (settings.storeSubtitle !== undefined) {
    localStorage.setItem(LOCAL_STORE_SUBTITLE_KEY, settings.storeSubtitle);
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
  const getFallback = (): StoreSettings => ({
    logoUrl: localStorage.getItem(LOCAL_LOGO_KEY) || '',
    logoShape: (localStorage.getItem(LOCAL_LOGO_SHAPE_KEY) as LogoShape) || 'rectangle',
    showStoreName: parseBool(localStorage.getItem(LOCAL_SHOW_NAME_KEY), true),
    showStoreSubtitle: parseBool(localStorage.getItem(LOCAL_SHOW_SUBTITLE_KEY), true),
    storeName: localStorage.getItem(LOCAL_STORE_NAME_KEY) || '',
    storeSubtitle: localStorage.getItem(LOCAL_STORE_SUBTITLE_KEY) || '',
    uploadthingToken: localStorage.getItem(LOCAL_UPLOADTHING_TOKEN_KEY) || ''
  });

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreSettings;
        if (data.logoUrl !== undefined) localStorage.setItem(LOCAL_LOGO_KEY, data.logoUrl);
        if (data.logoShape) localStorage.setItem(LOCAL_LOGO_SHAPE_KEY, data.logoShape);
        if (data.showStoreName !== undefined) localStorage.setItem(LOCAL_SHOW_NAME_KEY, String(data.showStoreName));
        if (data.showStoreSubtitle !== undefined) localStorage.setItem(LOCAL_SHOW_SUBTITLE_KEY, String(data.showStoreSubtitle));
        if (data.storeName !== undefined) localStorage.setItem(LOCAL_STORE_NAME_KEY, data.storeName);
        if (data.storeSubtitle !== undefined) localStorage.setItem(LOCAL_STORE_SUBTITLE_KEY, data.storeSubtitle);
        if (data.uploadthingToken !== undefined) localStorage.setItem(LOCAL_UPLOADTHING_TOKEN_KEY, data.uploadthingToken);
        
        callback({
          logoUrl: data.logoUrl || '',
          logoShape: data.logoShape || 'rectangle',
          showStoreName: data.showStoreName !== undefined ? data.showStoreName : true,
          showStoreSubtitle: data.showStoreSubtitle !== undefined ? data.showStoreSubtitle : true,
          storeName: data.storeName || '',
          storeSubtitle: data.storeSubtitle || '',
          ...data
        });
      } else {
        callback(getFallback());
      }
    }, (error) => {
      console.warn('Real-time store settings subscription error:', error);
      callback(getFallback());
    });
  } catch (e) {
    console.warn('Error subscribing to store settings:', e);
    callback(getFallback());
    return () => {};
  }
}
