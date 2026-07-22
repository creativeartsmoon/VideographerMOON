import { PortfolioItem, SiteSettings, ContactInquiry } from '../types';
import { INITIAL_PORTFOLIO_ITEMS, INITIAL_SITE_SETTINGS, INITIAL_CONTACT_INQUIRIES } from '../data';

// --- Local Storage Keys ---
const PORTFOLIO_STORAGE_KEY = 'videographer_portfolio_items';
const SETTINGS_STORAGE_KEY = 'videographer_site_settings';
const INQUIRIES_STORAGE_KEY = 'videographer_contact_inquiries';

const API_BASE = '/.netlify/functions';

// ==========================================
// Portfolio Items API (Via Netlify Functions)
// ==========================================

export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const res = await fetch(`${API_BASE}/portfolio`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Netlify function fetchPortfolioItems failed, using local cache:', err);
  }

  // Fallback to localStorage / initial data
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

export async function savePortfolioItems(items: PortfolioItem[]): Promise<boolean> {
  // Save to local storage for immediateUI reactivity
  localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(items));

  try {
    const res = await fetch(`${API_BASE}/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    return res.ok;
  } catch (err) {
    console.warn('Netlify function savePortfolioItems error:', err);
    return false;
  }
}

export async function deletePortfolioItemFromDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/portfolio?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Netlify function deletePortfolioItemFromDb error:', err);
    return false;
  }
}

// ==========================================
// Site Settings API (Via Netlify Functions)
// ==========================================

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && data.siteTitle) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Netlify function fetchSiteSettings failed, using local cache:', err);
  }

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

export async function saveSiteSettings(settings: SiteSettings): Promise<boolean> {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch (err) {
    console.warn('Netlify function saveSiteSettings error:', err);
    return false;
  }
}

// ==========================================
// Contact Inquiries API (Via Netlify Functions)
// ==========================================

export async function fetchContactInquiries(): Promise<ContactInquiry[]> {
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Netlify function fetchContactInquiries failed, using local cache:', err);
  }

  const saved = localStorage.getItem(INQUIRIES_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error('Error parsing inquiries:', e);
    }
  }

  return INITIAL_CONTACT_INQUIRIES;
}

export async function saveContactInquiries(inquiries: ContactInquiry[]): Promise<boolean> {
  localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));

  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiries),
    });
    return res.ok;
  } catch (err) {
    console.warn('Netlify function saveContactInquiries error:', err);
    return false;
  }
}
