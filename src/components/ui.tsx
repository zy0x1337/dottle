import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Pixels } from "@/types";
import { idx } from "@/lib/pixels";

/* ------------------------------------------------------------------ */
/* IconButton                                                          */
/* ------------------------------------------------------------------ */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
  size?: "sm" | "md" | "lg";
}

export function IconButton({
  active,
  label,
  size = "md",
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl transition-colors touch-manipulation",
        "text-zinc-300 hover:bg-zinc-800 hover:text-white active:bg-zinc-700",
        "disabled:opacity-30 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
        size === "sm" && "h-9 w-9",
        size === "md" && "h-11 w-11",
        size === "lg" && "h-12 w-12",
        active && "bg-pink-500/15 text-pink-400 hover:bg-pink-500/20 hover:text-pink-300",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Pill / chip toggle                                                  */
/* ------------------------------------------------------------------ */
interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors touch-manipulation",
        "text-zinc-300 hover:bg-zinc-800 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
        active && "bg-pink-500/15 text-pink-400 hover:bg-pink-500/20",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented control                                                   */
/* ------------------------------------------------------------------ */
interface SegmentedProps<T extends string | number> {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  className,
  size = "sm",
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg bg-zinc-800/80 p-0.5",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors touch-manipulation",
            size === "sm" ? "h-8 min-w-8 px-2 text-xs" : "h-10 min-w-10 px-3 text-sm",
            o.value === value
              ? "bg-zinc-100 text-zinc-900 shadow"
              : "text-zinc-400 hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({
  variant = "secondary",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors touch-manipulation",
        "disabled:opacity-40 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
        variant === "primary" && "bg-pink-500 text-white hover:bg-pink-400 active:bg-pink-600",
        variant === "secondary" && "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-600",
        variant === "ghost" && "text-zinc-300 hover:bg-zinc-800",
        variant === "danger" && "bg-red-500/15 text-red-400 hover:bg-red-500/25",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet (bottom sheet on mobile, dialog on desktop)                   */
/* ------------------------------------------------------------------ */
interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export function Sheet({ open, title, onClose, children, wide }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10 animate-sheet-in",
          "sm:max-h-[85vh] sm:rounded-3xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <div className="relative flex items-center justify-between px-5 pt-5 pb-2">
          <div
            className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-zinc-700 sm:hidden"
            aria-hidden="true"
          />
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <IconButton label="Close" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SpriteThumb – canvas preview of a sprite                            */
/* ------------------------------------------------------------------ */
interface SpriteThumbProps {
  pixels: Pixels;
  size: number;
  scale: number;
  checker?: boolean;
  className?: string;
  tiled?: number;
}

export function SpriteThumb({
  pixels,
  size,
  scale,
  checker = true,
  className,
  tiled = 1,
}: SpriteThumbProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssSize = size * scale * tiled;
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cssSize, cssSize);
    if (checker) {
      const cs = Math.max(4, scale * 2);
      for (let y = 0; y < cssSize; y += cs)
        for (let x = 0; x < cssSize; x += cs) {
          ctx.fillStyle = ((x / cs + y / cs) & 1) === 0 ? "#3f3f46" : "#33333a";
          ctx.fillRect(x, y, cs, cs);
        }
    }
    for (let ty = 0; ty < tiled; ty++) {
      for (let tx = 0; tx < tiled; tx++) {
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            const p = pixels[idx(size, c, r)];
            if (!p) continue;
            ctx.fillStyle = p;
            ctx.fillRect(
              (tx * size + c) * scale,
              (ty * size + r) * scale,
              scale,
              scale,
            );
          }
        }
      }
    }
  }, [pixels, size, scale, checker, tiled]);

  const css = size * scale * tiled;
  return (
    <canvas
      ref={ref}
      className={cn("block", className)}
      style={{ width: css, height: css, imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(11rem+env(safe-area-inset-bottom))] z-[60] flex justify-center lg:bottom-8">
      <div className="animate-fade-in rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 shadow-lg">
        {message}
      </div>
    </div>
  );
}
