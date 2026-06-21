import type { AppData, StorageRepo } from "./storage";

const STORAGE_KEY = "leetcode-prep:v1";
export const CURRENT_VERSION = 1;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function tryParse(raw: string | null): AppData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AppData;
    if (typeof parsed !== "object" || parsed === null) return null;
    if (parsed.version !== CURRENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const localStorageRepo: StorageRepo = {
  load() {
    if (!isBrowser()) return null;
    try {
      return tryParse(window.localStorage.getItem(STORAGE_KEY));
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
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  },
  importJSON(json) {
    const parsed = JSON.parse(json) as AppData;
    if (parsed.version !== CURRENT_VERSION) {
      throw new Error(
        `Unsupported data version: ${parsed.version}, expected ${CURRENT_VERSION}`,
      );
    }
    if (isBrowser()) {
      window.localStorage.setItem(STORAGE_KEY, json);
    }
    return parsed;
  },
  clear() {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
