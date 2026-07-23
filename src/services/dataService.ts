import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PortfolioItem, SiteSettings, ContactInquiry } from '../types';
import { INITIAL_PORTFOLIO_ITEMS, INITIAL_SITE_SETTINGS, INITIAL_CONTACT_INQUIRIES } from '../data';

// --- Local Storage Keys ---
const PORTFOLIO_STORAGE_KEY = 'videographer_portfolio_items';
const SETTINGS_STORAGE_KEY = 'videographer_site_settings';
const INQUIRIES_STORAGE_KEY = 'videographer_contact_inquiries';

const PORTFOLIO_COLLECTION = 'portfolio_items';
const SETTINGS_COLLECTION = 'site_settings';
const INQUIRIES_COLLECTION = 'contact_inquiries';

// ==========================================
// Portfolio Items API (Firebase Firestore)
// ==========================================

export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const colRef = collection(db, PORTFOLIO_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const items: PortfolioItem[] = snapshot.docs.map((d) => ({
        ...(d.data() as PortfolioItem),
        id: d.id,
      }));
      console.log('[Firebase Firestore] Portfolio items fetched successfully:', items.length, 'items');
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(items));
      return items;
    } else {
      // Seed Firestore with initial portfolio items if database collection is empty
      console.log('[Firebase Firestore] Collection is empty. Seeding initial portfolio items...');
      const batch = writeBatch(db);
      INITIAL_PORTFOLIO_ITEMS.forEach((item) => {
        const itemRef = doc(db, PORTFOLIO_COLLECTION, item.id);
        batch.set(itemRef, item);
      });
      await batch.commit();
      console.log('[Firebase Firestore] Initial portfolio items seeded successfully.');
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(INITIAL_PORTFOLIO_ITEMS));
      return INITIAL_PORTFOLIO_ITEMS;
    }
  } catch (err) {
    console.error('[Firebase Firestore] Error fetching portfolio items, falling back to local cache:', err);
    const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing portfolio from localStorage:', e);
      }
    }
    return INITIAL_PORTFOLIO_ITEMS;
  }
}

export async function savePortfolioItems(items: PortfolioItem[]): Promise<boolean> {
  // Save to local storage immediately
  localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(items));

  try {
    const batch = writeBatch(db);
    
    // Save/Upsert all current items
    items.forEach((item) => {
      const docRef = doc(db, PORTFOLIO_COLLECTION, item.id);
      batch.set(docRef, item, { merge: true });
    });

    // Detect and delete items removed from the array
    const snapshot = await getDocs(collection(db, PORTFOLIO_COLLECTION));
    const currentIds = new Set(items.map((i) => i.id));
    snapshot.docs.forEach((d) => {
      if (!currentIds.has(d.id)) {
        batch.delete(doc(db, PORTFOLIO_COLLECTION, d.id));
      }
    });

    await batch.commit();
    console.log('[Firebase Firestore] Portfolio items saved successfully:', items.length, 'items');
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error saving portfolio items:', err);
    return false;
  }
}

export async function deletePortfolioItemFromDb(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, PORTFOLIO_COLLECTION, id);
    await deleteDoc(docRef);
    console.log(`[Firebase Firestore] Portfolio item "${id}" deleted successfully.`);

    // Update local cache
    const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (saved) {
      try {
        const items: PortfolioItem[] = JSON.parse(saved);
        const filtered = items.filter((item) => item.id !== id);
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {
        // ignore
      }
    }
    return true;
  } catch (err) {
    console.error(`[Firebase Firestore] Error deleting portfolio item "${id}":`, err);
    return false;
  }
}

// ==========================================
// Site Settings API (Firebase Firestore)
// ==========================================

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'default');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as SiteSettings;
      console.log('[Firebase Firestore] Site settings fetched successfully');
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      return { ...INITIAL_SITE_SETTINGS, ...data };
    } else {
      console.log('[Firebase Firestore] Site settings document not found. Seeding initial settings...');
      await setDoc(docRef, INITIAL_SITE_SETTINGS);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SITE_SETTINGS));
      return INITIAL_SITE_SETTINGS;
    }
  } catch (err) {
    console.error('[Firebase Firestore] Error fetching site settings, falling back to local cache:', err);
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return { ...INITIAL_SITE_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error parsing settings from localStorage:', e);
      }
    }
    return INITIAL_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<boolean> {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'default');
    await setDoc(docRef, settings, { merge: true });
    console.log('[Firebase Firestore] Site settings saved successfully to Firestore');
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error saving site settings:', err);
    return false;
  }
}

// ==========================================
// Contact Inquiries API (Firebase Firestore)
// ==========================================

export async function fetchContactInquiries(): Promise<ContactInquiry[]> {
  try {
    const colRef = collection(db, INQUIRIES_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const inquiries: ContactInquiry[] = snapshot.docs.map((d) => ({
        ...(d.data() as ContactInquiry),
        id: d.id,
      }));
      console.log('[Firebase Firestore] Contact inquiries fetched successfully:', inquiries.length);
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
      return inquiries;
    } else {
      console.log('[Firebase Firestore] Contact inquiries collection empty, seeding defaults...');
      const batch = writeBatch(db);
      INITIAL_CONTACT_INQUIRIES.forEach((inq) => {
        const inqRef = doc(db, INQUIRIES_COLLECTION, inq.id);
        batch.set(inqRef, inq);
      });
      await batch.commit();
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(INITIAL_CONTACT_INQUIRIES));
      return INITIAL_CONTACT_INQUIRIES;
    }
  } catch (err) {
    console.error('[Firebase Firestore] Error fetching contact inquiries:', err);
    const saved = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_CONTACT_INQUIRIES;
  }
}

export async function saveContactInquiries(inquiries: ContactInquiry[]): Promise<boolean> {
  localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));

  try {
    const batch = writeBatch(db);
    inquiries.forEach((inq) => {
      const docRef = doc(db, INQUIRIES_COLLECTION, inq.id);
      batch.set(docRef, inq, { merge: true });
    });
    await batch.commit();
    console.log('[Firebase Firestore] Contact inquiries saved successfully');
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error saving contact inquiries:', err);
    return false;
  }
}

export async function deleteContactInquiryFromDb(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, INQUIRIES_COLLECTION, id);
    await deleteDoc(docRef);
    console.log(`[Firebase Firestore] Contact inquiry "${id}" deleted successfully.`);
    return true;
  } catch (err) {
    console.error(`[Firebase Firestore] Error deleting inquiry "${id}":`, err);
    return false;
  }
}
