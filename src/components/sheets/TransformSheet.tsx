import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { Pixels } from "@/types";
import {
  centerPixels,
  createPixels,
  flipH,
  flipV,
  outlinePixels,
  rotateCCW,
  rotateCW,
  shiftPixels,
} from "@/lib/pixels";
import { Sheet } from "../ui";
import { cn } from "@/utils/cn";

interface TransformSheetProps {
  open: boolean;
  pixels: Pixels;
  size: number;
  color: string;
  onClose: () => void;
  onApply: (pixels: Pixels) => void;
}

interface Action {
  label: string;
  icon: LucideIcon;
  run: (px: Pixels, size: number, color: string) => Pixels;
  danger?: boolean;
  swatch?: boolean;
}

const ACTIONS: Action[] = [
  { label: "Flip H", icon: FlipHorizontal2, run: (p, s) => flipH(p, s) },
  { label: "Flip V", icon: FlipVertical2, run: (p, s) => flipV(p, s) },
  { label: "Rotate ↻", icon: RotateCw, run: (p, s) => rotateCW(p, s) },
  { label: "Rotate ↺", icon: RotateCcw, run: (p, s) => rotateCCW(p, s) },
  { label: "Up", icon: ArrowUp, run: (p, s) => shiftPixels(p, s, 0, -1, true) },
  { label: "Down", icon: ArrowDown, run: (p, s) => shiftPixels(p, s, 0, 1, true) },
  { label: "Left", icon: ArrowLeft, run: (p, s) => shiftPixels(p, s, -1, 0, true) },
  { label: "Right", icon: ArrowRight, run: (p, s) => shiftPixels(p, s, 1, 0, true) },
  { label: "Center", icon: Crosshair, run: (p, s) => centerPixels(p, s) },
  { label: "Outline", icon: Sparkles, run: (p, s, c) => outlinePixels(p, s, c), swatch: true },
  { label: "Clear", icon: Trash2, run: (_p, s) => createPixels(s), danger: true },
];

export function TransformSheet({ open, pixels, size, color, onClose, onApply }: TransformSheetProps) {
  return (
    <Sheet open={open} title="Transform" onClose={onClose}>
      <p className="mb-3 text-xs text-zinc-500">
        Shifts wrap around the edges. Every action can be undone.
      </p>
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map(({ label, icon: Icon, run, danger, swatch }) => (
          <button
            key={label}
            type="button"
            onClick={() => onApply(run(pixels, size, color))}
            className={cn(
              "relative flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl bg-zinc-800/80 text-zinc-200 transition-colors hover:bg-zinc-700 active:bg-zinc-600 touch-manipulation",
              danger && "text-red-300 hover:bg-red-500/20",
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-[11px] font-medium">{label}</span>
            {swatch && (
              <span
                className="absolute right-2 top-2 h-3 w-3 rounded-full ring-1 ring-white/30"
                style={{ backgroundColor: color }}
              />
            )}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
