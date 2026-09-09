import type { Cell, Mirror, Pixels } from "@/types";

export const createPixels = (size: number): Pixels =>
  new Array<string>(size * size).fill("");

export const idx = (size: number, c: number, r: number) => r * size + c;

export const inBounds = (size: number, c: number, r: number) =>
  c >= 0 && r >= 0 && c < size && r < size;

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

export function setPixel(
  px: Pixels,
  size: number,
  c: number,
  r: number,
  color: string,
) {
  if (inBounds(size, c, r)) px[idx(size, c, r)] = color;
}

export function setMirrored(
  px: Pixels,
  size: number,
  c: number,
  r: number,
  color: string,
  mirror: Mirror,
) {
  setPixel(px, size, c, r, color);
  if (mirror === "h" || mirror === "both")
    setPixel(px, size, size - 1 - c, r, color);
  if (mirror === "v" || mirror === "both")
    setPixel(px, size, c, size - 1 - r, color);
  if (mirror === "both")
    setPixel(px, size, size - 1 - c, size - 1 - r, color);
}

export function plotBrush(
  px: Pixels,
  size: number,
  c: number,
  r: number,
  color: string,
  brush: number,
  mirror: Mirror,
) {
  const off = Math.floor((brush - 1) / 2);
  for (let dy = 0; dy < brush; dy++) {
    for (let dx = 0; dx < brush; dx++) {
      setMirrored(px, size, c - off + dx, r - off + dy, color, mirror);
    }
  }
}

/** Bresenham line between two cells, inclusive of both ends. */
export function bresenham(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Cell[] {
  const pts: Cell[] = [];
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  // Safety cap so a runaway loop can never freeze the UI
  for (let i = 0; i < 4096; i++) {
    pts.push({ c: x, r: y });
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  return pts;
}

export function drawLine(
  px: Pixels,
  size: number,
  a: Cell,
  b: Cell,
  color: string,
  brush: number,
  mirror: Mirror,
) {
  for (const p of bresenham(a.c, a.r, b.c, b.r)) {
    plotBrush(px, size, p.c, p.r, color, brush, mirror);
  }
}

export function drawRect(
  px: Pixels,
  size: number,
  a: Cell,
  b: Cell,
  color: string,
  brush: number,
  mirror: Mirror,
  filled: boolean,
) {
  const x0 = Math.min(a.c, b.c);
  const x1 = Math.max(a.c, b.c);
  const y0 = Math.min(a.r, b.r);
  const y1 = Math.max(a.r, b.r);
  for (let r = y0; r <= y1; r++) {
    for (let c = x0; c <= x1; c++) {
      const edge = r === y0 || r === y1 || c === x0 || c === x1;
      if (filled || edge) plotBrush(px, size, c, r, color, brush, mirror);
    }
  }
}

/**
 * Ellipse inscribed in the bounding box a..b (inclusive).
 * Port of Alois Zingl's plotEllipseRect – handles even & odd diameters.
 */
export function drawEllipse(
  px: Pixels,
  size: number,
  a: Cell,
  b: Cell,
  color: string,
  brush: number,
  mirror: Mirror,
  filled: boolean,
) {
  let x0 = Math.min(a.c, b.c);
  let x1 = Math.max(a.c, b.c);
  let y0 = Math.min(a.r, b.r);
  let y1 = Math.max(a.r, b.r);

  const plot = (x: number, y: number) =>
    plotBrush(px, size, x, y, color, brush, mirror);
  const span = (xa: number, xb: number, y: number) => {
    if (filled) {
      for (let x = xa; x <= xb; x++) plot(x, y);
    } else {
      plot(xa, y);
      plot(xb, y);
    }
  };

  const aa = Math.abs(x1 - x0);
  const bb = Math.abs(y1 - y0);
  let b1 = bb & 1;
  let dx = 4 * (1 - aa) * bb * bb;
  let dy = 4 * (b1 + 1) * aa * aa;
  let err = dx + dy + b1 * aa * aa;

  y0 += Math.floor((bb + 1) / 2);
  y1 = y0 - b1;
  const a8 = 8 * aa * aa;
  b1 = 8 * bb * bb;

  let guard = 0;
  do {
    span(x0, x1, y0);
    if (y1 !== y0) span(x0, x1, y1);
    const e2 = 2 * err;
    if (e2 <= dy) {
      y0++;
      y1--;
      dy += a8;
      err += dy;
    }
    if (e2 >= dx || 2 * err > dy) {
      x0++;
      x1--;
      dx += b1;
      err += dx;
    }
  } while (x0 <= x1 && guard++ < 4096);

  // finish tip of flat ellipses
  while (y0 - y1 <= bb && guard++ < 4096) {
    span(x0 - 1, x1 + 1, y0);
    span(x0 - 1, x1 + 1, y1);
    y0++;
    y1--;
  }
}

/** 4-connected flood fill (mutates px). */
export function floodFill(
  px: Pixels,
  size: number,
  c: number,
  r: number,
  color: string,
) {
  if (!inBounds(size, c, r)) return;
  const target = px[idx(size, c, r)];
  if (target === color) return;
  const stack: number[] = [idx(size, c, r)];
  while (stack.length) {
    const i = stack.pop()!;
    if (px[i] !== target) continue;
    px[i] = color;
    const cc = i % size;
    const rr = (i - cc) / size;
    if (cc > 0) stack.push(i - 1);
    if (cc < size - 1) stack.push(i + 1);
    if (rr > 0) stack.push(i - size);
    if (rr < size - 1) stack.push(i + size);
  }
}

export function replaceColor(px: Pixels, target: string, color: string) {
  for (let i = 0; i < px.length; i++) if (px[i] === target) px[i] = color;
}

export function shiftPixels(
  px: Pixels,
  size: number,
  dc: number,
  dr: number,
  wrap: boolean,
): Pixels {
  const out = createPixels(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = px[idx(size, c, r)];
      if (!v) continue;
      let nc = c + dc;
      let nr = r + dr;
      if (wrap) {
        nc = ((nc % size) + size) % size;
        nr = ((nr % size) + size) % size;
      } else if (!inBounds(size, nc, nr)) continue;
      out[idx(size, nc, nr)] = v;
    }
  }
  return out;
}

export function flipH(px: Pixels, size: number): Pixels {
  const out = createPixels(size);
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      out[idx(size, size - 1 - c, r)] = px[idx(size, c, r)];
  return out;
}

export function flipV(px: Pixels, size: number): Pixels {
  const out = createPixels(size);
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      out[idx(size, c, size - 1 - r)] = px[idx(size, c, r)];
  return out;
}

export function rotateCW(px: Pixels, size: number): Pixels {
  const out = createPixels(size);
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      out[idx(size, size - 1 - r, c)] = px[idx(size, c, r)];
  return out;
}

export function rotateCCW(px: Pixels, size: number): Pixels {
  const out = createPixels(size);
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      out[idx(size, r, size - 1 - c)] = px[idx(size, c, r)];
  return out;
}

/** Adds a 1px outline (4-connected) of `color` around all opaque pixels. */
export function outlinePixels(px: Pixels, size: number, color: string): Pixels {
  const out = px.slice();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (px[idx(size, c, r)]) continue;
      const near =
        (c > 0 && px[idx(size, c - 1, r)]) ||
        (c < size - 1 && px[idx(size, c + 1, r)]) ||
        (r > 0 && px[idx(size, c, r - 1)]) ||
        (r < size - 1 && px[idx(size, c, r + 1)]);
      if (near) out[idx(size, c, r)] = color;
    }
  }
  return out;
}

/** Resize the canvas keeping the artwork centered. */
export function resizePixels(px: Pixels, from: number, to: number): Pixels {
  if (from === to) return px.slice();
  const out = createPixels(to);
  const off = Math.floor((to - from) / 2);
  for (let r = 0; r < to; r++) {
    for (let c = 0; c < to; c++) {
      const sc = c - off;
      const sr = r - off;
      if (inBounds(from, sc, sr)) out[idx(to, c, r)] = px[idx(from, sc, sr)];
    }
  }
  return out;
}

/** Moves the artwork so its bounding box is centered on the canvas. */
export function centerPixels(px: Pixels, size: number): Pixels {
  let minC = size, minR = size, maxC = -1, maxR = -1;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (px[idx(size, c, r)]) {
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
      }
  if (maxC < 0) return px.slice();
  const dc = Math.floor((size - (maxC - minC + 1)) / 2) - minC;
  const dr = Math.floor((size - (maxR - minR + 1)) / 2) - minR;
  return shiftPixels(px, size, dc, dr, false);
}

export function pixelsEqual(a: Pixels, b: Pixels) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function usedColors(px: Pixels): string[] {
  const set = new Set<string>();
  for (const p of px) if (p) set.add(p);
  return [...set];
}

export function isEmpty(px: Pixels) {
  return px.every((p) => !p);
}

export function normalizeHex(input: string): string | null {
  let s = input.trim().toLowerCase();
  if (!s.startsWith("#")) s = "#" + s;
  if (/^#[0-9a-f]{3}$/.test(s)) {
    s = "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  }
  return /^#[0-9a-f]{6}$/.test(s) ? s : null;
}

/** Relative luminance helper used to pick a readable contrast color. */
export function isLightColor(hex: string) {
  const n = normalizeHex(hex);
  if (!n) return false;
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
