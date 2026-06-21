import { CURRENT_SCHEMA_VERSION, type AppDataV2 } from "./storage";

/**
 * Migrate persisted state to the current schema version.
 *
 * - Returns `null` if the persisted data is missing / corrupted / from an
 *   older version that we elect to clean-start from (P0 stance: any v1
 *   payload was test data — drop it).
 * - Throws on payloads from a *newer* schema version than this build supports
 *   (we refuse to read and let the caller surface a user-visible warning).
 * - Returns the parsed object as-is when it already matches the current
 *   schema.
 */
export function migratePersistedState(raw: unknown): AppDataV2 | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const v = obj.schemaVersion;

  if (typeof v !== "number") {
    if (process.env.NODE_ENV !== "production") {
      console.info("[migrate] No schemaVersion found, starting fresh.");
    }
    return null;
  }

  if (v > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported schema v${v}. Update the app to a newer version first.`,
    );
  }

  if (v < CURRENT_SCHEMA_VERSION) {
    // P0 stance: existing data is test data — clean start.
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[migrate] dropping legacy schema v${v} (test data); starting fresh.`,
      );
    }
    return null;
  }

  return raw as AppDataV2;
}
