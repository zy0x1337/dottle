import type { Pixels } from "@/types";
import { createPixels, idx } from "./pixels";

export function renderSpriteToCanvas(
  pixels: Pixels,
  size: number,
  scale: number,
  background?: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const color = pixels[idx(size, c, r)];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(c * scale, r * scale, scale, scale);
    }
  }
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode PNG"));
    }, "image/png");
  });
}

export function spriteToDataUrl(pixels: Pixels, size: number, scale = 1) {
  return renderSpriteToCanvas(pixels, size, scale).toDataURL("image/png");
}

export function safeFileName(name: string) {
  const s = name
    .trim()
    .replace(/[^a-z0-9-_ ]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  return s || "sprite";
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || !("share" in navigator)) return false;
  try {
    const file = new File([new Uint8Array(1)], "t.png", { type: "image/png" });
    return navigator.canShare?.({ files: [file] }) ?? false;
  } catch {
    return false;
  }
}

export async function shareBlob(blob: Blob, filename: string, title: string) {
  const file = new File([blob], filename, { type: "image/png" });
  await navigator.share({ files: [file], title });
}

export function canCopyImage(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.write === "function" &&
    typeof ClipboardItem !== "undefined"
  );
}

export async function copyBlobToClipboard(blobPromise: Promise<Blob>) {
  // Passing a promise keeps Safari happy (must be inside the user gesture)
  const item = new ClipboardItem({ "image/png": blobPromise });
  await navigator.clipboard.write([item]);
}

async function fileToImageSource(
  file: Blob,
): Promise<{ source: CanvasImageSource; width: number; height: number; release: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file);
      return {
        source: bmp,
        width: bmp.width,
        height: bmp.height,
        release: () => bmp.close(),
      };
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = url;
  });
  return {
    source: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    release: () => URL.revokeObjectURL(url),
  };
}

const toHex = (n: number) => n.toString(16).padStart(2, "0");

/**
 * Imports any image into a square pixel grid.
 * If the image is exactly 16/24/32 px square it is used 1:1, otherwise it is
 * nearest-neighbour resampled ("contain") into `fallbackSize`.
 */
export async function importImageFile(
  file: Blob,
  fallbackSize: number,
  allowedSizes: readonly number[],
): Promise<{ size: number; pixels: Pixels }> {
  const { source, width, height, release } = await fileToImageSource(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source, 0, 0);
    const data = ctx.getImageData(0, 0, width, height).data;

    const exact = width === height && allowedSizes.includes(width);
    const size = exact ? width : fallbackSize;
    const pixels = createPixels(size);

    const scale = exact ? 1 : Math.max(width, height) / size;
    const ox = exact ? 0 : (size - width / scale) / 2;
    const oy = exact ? 0 : (size - height / scale) / 2;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const sx = Math.floor((c + 0.5 - ox) * scale);
        const sy = Math.floor((r + 0.5 - oy) * scale);
        if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
        const i = (sy * width + sx) * 4;
        if (data[i + 3] < 128) continue;
        pixels[idx(size, c, r)] =
          "#" + toHex(data[i]) + toHex(data[i + 1]) + toHex(data[i + 2]);
      }
    }
    return { size, pixels };
  } finally {
    release();
  }
}
