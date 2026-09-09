export type Pixels = string[]; // "" = transparent, otherwise "#rrggbb"

export const SPRITE_SIZES = [16, 24, 32] as const;
export type SpriteSize = (typeof SPRITE_SIZES)[number];

export interface Sprite {
  id: string;
  name: string;
  size: number;
  pixels: Pixels;
  createdAt: number;
  updatedAt: number;
}

export type Tool =
  | "pencil"
  | "eraser"
  | "fill"
  | "picker"
  | "line"
  | "rect"
  | "ellipse"
  | "move";

export type Mirror = "none" | "h" | "v" | "both";

export interface Cell {
  c: number;
  r: number;
}

export interface Settings {
  tool: Tool;
  color: string;
  brushSize: number;
  shapeFill: boolean;
  fillGlobal: boolean;
  mirror: Mirror;
  showGrid: boolean;
  checkerDark: boolean;
  offsetCursor: boolean;
  paletteId: string;
  customColors: string[];
  recentColors: string[];
}

export type SheetId =
  | "gallery"
  | "export"
  | "color"
  | "transform"
  | "settings"
  | "preview"
  | "menu"
  | null;
