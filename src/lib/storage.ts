import type { Settings, Sprite } from "@/types";
import { DEFAULT_PALETTE_ID } from "./palettes";

const DATA_KEY = "dottle.data.v1";
const SETTINGS_KEY = "dottle.settings.v1";

export interface PersistedData {
  sprites: Sprite[];
  currentId: string;
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

export function loadData(): PersistedData | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedData;
    if (!Array.isArray(parsed.sprites) || parsed.sprites.length === 0)
      return null;
    // basic validation
    const sprites = parsed.sprites.filter(
      (s) =>
        s &&
        typeof s.id === "string" &&
        typeof s.size === "number" &&
        Array.isArray(s.pixels) &&
        s.pixels.length === s.size * s.size,
    );
    if (sprites.length === 0) return null;
    const currentId = sprites.some((s) => s.id === parsed.currentId)
      ? parsed.currentId
      : sprites[0].id;
    return { sprites, currentId };
  } catch {
    return null;
  }
}

let saveTimer: number | undefined;
export function saveData(data: PersistedData) {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable – ignore */
    }
  }, 250);
}

export const DEFAULT_SETTINGS: Settings = {
  tool: "pencil",
  color: "#ff004d",
  brushSize: 1,
  shapeFill: false,
  fillGlobal: false,
  mirror: "none",
  showGrid: true,
  checkerDark: false,
  offsetCursor: false,
  paletteId: DEFAULT_PALETTE_ID,
  customColors: [],
  recentColors: [],
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed, tool: "pencil" };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
