/**
 * loadout.util.ts
 *
 * Persists Mario's pre-fight "loadout" (max HP/FP + equipment) to
 * localStorage, following the same plain-localStorage pattern App.tsx
 * already uses for the dark-mode preference. Used by BasicStats.tsx (the
 * "Remember Loadout" toggle) and FinalBowser.tsx (initial fightData state).
 */

const ENABLED_KEY = "pm64.saveLoadout.enabled";
const DATA_KEY = "pm64.saveLoadout.data";

export interface SavedLoadout {
    maxHP: number;
    maxFP: number;
    boots: string;
    hammer: string;
}

/** Whether the "Remember Loadout" toggle was left on. Defaults to false. */
export function isSaveLoadoutEnabled(): boolean {
    try {
        return localStorage.getItem(ENABLED_KEY) === "true";
    } catch {
        return false;
    }
}

export function setSaveLoadoutEnabled(enabled: boolean) {
    try {
        localStorage.setItem(ENABLED_KEY, enabled ? "true" : "false");
    } catch {
        // Storage unavailable (e.g. private browsing) — silently no-op,
        // same as if the toggle were simply off.
    }
}

/** The last-saved loadout, or null if none was saved (or storage failed). */
export function loadSavedLoadout(): SavedLoadout | null {
    try {
        const raw = localStorage.getItem(DATA_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (
            typeof parsed?.maxHP === "number" &&
            typeof parsed?.maxFP === "number" &&
            typeof parsed?.boots === "string" &&
            typeof parsed?.hammer === "string"
        ) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
}

export function saveLoadout(loadout: SavedLoadout) {
    try {
        localStorage.setItem(DATA_KEY, JSON.stringify(loadout));
    } catch {
        // Storage unavailable — nothing to do.
    }
}
