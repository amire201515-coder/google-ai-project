import { MedicalCenter } from '../types/center';
import { INITIAL_CENTERS } from '../data/initialCenters';
import { buildSearchIndex } from './textNormalizer';

const DB_NAME = 'BimehNovinCentersDB';
const DB_VERSION = 1;
const STORE_NAME = 'centers';
const META_STORE = 'metadata';
const LS_FALLBACK_KEY = 'bimenovin_centers_fallback_v2';
const LS_LAST_UPDATED_KEY = 'bimenovin_last_updated_v2';

let dbInstance: IDBDatabase | null = null;

/**
 * اتصال پایدار به دیتابیس بومی IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * بارگذاری تمامی مراکز از IndexedDB (با فال‌بک خودکار)
 */
export async function getAllCentersFromStorage(): Promise<MedicalCenter[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as MedicalCenter[];
        if (Array.isArray(results) && results.length > 0) {
          // مطمئن شویم ایندکس جستجو برای تمام داده‌ها آماده است
          const indexed = results.map(c => ({
            ...c,
            _searchIndex: c._searchIndex || buildSearchIndex(c)
          }));
          resolve(indexed);
        } else {
          // اگر داده‌ای در IndexedDB نبود، تمامی ۱۹۵۸ مرکز اولیه را فوراً در دیتابیس بومی ذخیره و آماده می‌کنیم
          const withIndex = INITIAL_CENTERS.map(c => ({
            ...c,
            _searchIndex: buildSearchIndex(c)
          }));
          // ذخیره در IndexedDB برای اجراهای بعدی
          saveAllCentersToStorage(withIndex).catch(console.error);
          resolve(withIndex);
        }
      };

      req.onerror = () => {
        resolve(getLocalStorageFallback());
      };
    });
  } catch (err) {
    console.warn('Falling back to LocalStorage:', err);
    return getLocalStorageFallback();
  }
}

/**
 * ذخیره و جایگزینی کامل تمامی رکوردهای واردشده در IndexedDB
 */
export async function saveAllCentersToStorage(centers: MedicalCenter[]): Promise<boolean> {
  const prepared = centers.map((c, i) => ({
    ...c,
    id: c.id || `center-${c.mcId || i}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    _searchIndex: buildSearchIndex(c)
  }));

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const meta = tx.objectStore(META_STORE);

      // پاک کردن رکوردهای قبلی
      store.clear();

      // درج ردیف به ردیف بدون هیچ محدودیت تعدادی
      for (const item of prepared) {
        store.put(item);
      }

      const now = new Date().toISOString();
      meta.put({ key: 'lastUpdated', value: now });
      meta.put({ key: 'totalCount', value: prepared.length });

      tx.oncomplete = () => {
        try {
          localStorage.setItem(LS_LAST_UPDATED_KEY, now);
        } catch {
          // ignore
        }
        resolve(true);
      };

      tx.onerror = () => {
        console.error('IndexedDB transaction error:', tx.error);
        resolve(saveToLocalStorageFallback(prepared));
      };
    });
  } catch (err) {
    console.error('Failed to open IndexedDB, using fallback:', err);
    return saveToLocalStorageFallback(prepared);
  }
}

/**
 * افزودن داده‌های جدید به رکوردهای قبلی (با جلوگیری از تکرار کد مرکز)
 */
export async function appendCentersToStorage(newCenters: MedicalCenter[]): Promise<MedicalCenter[]> {
  const current = await getAllCentersFromStorage();
  
  // نگاشت مراکز موجود بر اساس mcId و نام
  const existingMap = new Map<string, MedicalCenter>();
  current.forEach(c => {
    const key = c.mcId ? `mc-${c.mcId}` : `name-${c.centerName}-${c.city}`;
    existingMap.set(key, c);
  });

  // افزودن یا به‌روزرسانی رکوردهای جدید
  newCenters.forEach((c, idx) => {
    const key = c.mcId ? `mc-${c.mcId}` : `name-${c.centerName}-${c.city}`;
    const prepared: MedicalCenter = {
      ...c,
      id: c.id || existingMap.get(key)?.id || `center-${c.mcId || idx}-${Date.now()}-${idx}`,
      _searchIndex: buildSearchIndex(c)
    };
    existingMap.set(key, prepared);
  });

  const merged = Array.from(existingMap.values());
  await saveAllCentersToStorage(merged);
  return merged;
}

/**
 * پاکسازی داده‌های واردشده و بازنشانی به داده‌های پیش‌فرض پروژه
 */
export async function resetCentersToBaseline(): Promise<MedicalCenter[]> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.objectStore(META_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem(LS_FALLBACK_KEY);
    localStorage.removeItem(LS_LAST_UPDATED_KEY);
  } catch {
    // ignore
  }

  const baseline = INITIAL_CENTERS.map(c => ({
    ...c,
    _searchIndex: buildSearchIndex(c)
  }));

  // ذخیره حالت اولیه در IndexedDB
  await saveAllCentersToStorage(baseline);
  return baseline;
}

/**
 * دریافت تاریخ آخرین به‌روزرسانی
 */
export async function getLastUpdatedTimestamp(): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(META_STORE, 'readonly');
      const req = tx.objectStore(META_STORE).get('lastUpdated');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          const d = new Date(req.result.value);
          resolve(new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(d));
        } else {
          resolve(getLocalStorageLastUpdated());
        }
      };
      req.onerror = () => resolve(getLocalStorageLastUpdated());
    });
  } catch {
    return getLocalStorageLastUpdated();
  }
}

// ---- کمکی‌های LocalStorage در صورت عدم دسترسی به IndexedDB ----

function getLocalStorageFallback(): MedicalCenter[] {
  try {
    const raw = localStorage.getItem(LS_FALLBACK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => ({ ...c, _searchIndex: c._searchIndex || buildSearchIndex(c) }));
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_CENTERS.map(c => ({ ...c, _searchIndex: buildSearchIndex(c) }));
}

function saveToLocalStorageFallback(centers: MedicalCenter[]): boolean {
  try {
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(centers));
    localStorage.setItem(LS_LAST_UPDATED_KEY, new Date().toISOString());
    return true;
  } catch (e) {
    console.error('LocalStorage write failed:', e);
    return false;
  }
}

function getLocalStorageLastUpdated(): string | null {
  try {
    const d = localStorage.getItem(LS_LAST_UPDATED_KEY);
    if (!d) return null;
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));
  } catch {
    return null;
  }
}
