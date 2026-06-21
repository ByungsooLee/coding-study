import { migratePersistedState } from "./migrate";
import {
  APP_VERSION,
  CURRENT_SCHEMA_VERSION,
  type AppDataV2,
  type StorageRepo,
} from "./storage";

const STORAGE_KEY = "leetcode-prep:v2";
const LEGACY_STORAGE_KEY = "leetcode-prep:v1";
const SNAPSHOT_PREFIX = "leetcode-prep:snapshot:";
const SNAPSHOT_RETENTION = 7;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const localStorageRepo: StorageRepo = {
  load() {
    if (!isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = safeParse(raw);
      if (parsed) {
        return migratePersistedState(parsed);
      }
      // Discover stale v1 data and remove it (test-data only assumption)
      const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        try {
          window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      return null;
    } catch (err) {
      console.warn("[storage] load failed:", err);
      return null;
    }
  },

  save(data) {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("[storage] save failed (quota or disabled):", err);
    }
  },

  isAvailable() {
    if (!isBrowser()) return false;
    try {
      const k = "__probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  },

  exportJSON() {
    if (!isBrowser()) return "";
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw) as AppDataV2;
      parsed.exportedAt = new Date().toISOString();
      parsed.appVersion = APP_VERSION;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  },

  importJSON(json) {
    const parsed = JSON.parse(json) as unknown;
    const migrated = migratePersistedState(parsed);
    if (!migrated) {
      throw new Error(
        `Imported data is incompatible with this app version (expected schemaVersion ${CURRENT_SCHEMA_VERSION}).`,
      );
    }
    if (isBrowser()) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  },

  clear() {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  takeSnapshot(data) {
    if (!isBrowser()) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const key = `${SNAPSHOT_PREFIX}${today}`;
      window.localStorage.setItem(key, JSON.stringify(data));

      // Rotate: keep at most SNAPSHOT_RETENTION snapshots
      const snapshotKeys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(SNAPSHOT_PREFIX)) snapshotKeys.push(k);
      }
      snapshotKeys.sort();
      while (snapshotKeys.length > SNAPSHOT_RETENTION) {
        const oldest = snapshotKeys.shift();
        if (oldest) window.localStorage.removeItem(oldest);
      }
    } catch (err) {
      console.warn("[storage] snapshot failed:", err);
    }
  },
};
