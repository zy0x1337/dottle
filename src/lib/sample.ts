import type { Pixels } from "@/types";

const SLIME_KEY: Record<string, string> = {
  ".": "",
  o: "#1d2b53",
  g: "#00e436",
  d: "#008751",
  l: "#fff1e8",
  k: "#000000",
};

const SLIME_ROWS = [
  "................",
  "................",
  "................",
  "......oooo......",
  "....ooggggoo....",
  "...ogllgggggo...",
  "..oglggggggggo..",
  ".oggggggggggggo.",
  ".ogggkggggkgggo.",
  ".ogggkggggkgggo.",
  ".oggggggggggggo.",
  ".ogggggddgggggo.",
  ".odggggggggggdo.",
  "..oddggggggddo..",
  "...ooddddddoo...",
  ".....oooooo.....",
];

const HEART_KEY: Record<string, string> = {
  ".": "",
  o: "#7e2553",
  r: "#ff004d",
  p: "#ff77a8",
  w: "#fff1e8",
};

const HEART_ROWS = [
  "................",
  "................",
  "...ooo....ooo...",
  "..oppro..orrro..",
  ".opwprroorrrrro.",
  ".oprrrrrrrrrrro.",
  ".orrrrrrrrrrrro.",
  ".orrrrrrrrrrrro.",
  "..orrrrrrrrrro..",
  "...orrrrrrrro...",
  "....orrrrrro....",
  ".....orrrro.....",
  "......orro......",
  ".......oo.......",
  "................",
  "................",
];

export function parseArt(
  rows: string[],
  key: Record<string, string>,
  size: number,
): Pixels {
  const out = new Array<string>(size * size).fill("");
  for (let r = 0; r < size; r++) {
    const row = rows[r] ?? "";
    for (let c = 0; c < size; c++) {
      const ch = row[c] ?? ".";
      out[r * size + c] = key[ch] ?? "";
    }
  }
  return out;
}

export const SAMPLE_SLIME = parseArt(SLIME_ROWS, SLIME_KEY, 16);
export const SAMPLE_HEART = parseArt(HEART_ROWS, HEART_KEY, 16);
