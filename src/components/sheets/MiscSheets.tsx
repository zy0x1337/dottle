import { useRef } from "react";
import {
  Crosshair,
  Download,
  Grid3x3,
  Info,
  Moon,
  Settings as SettingsIcon,
  Shapes,
  Sun,
  Upload,
  Layers,
  Trash2,
  Keyboard,
  type LucideIcon,
} from "lucide-react";
import type { Settings, Sprite } from "@/types";
import { SPRITE_SIZES } from "@/types";
import { cn } from "@/utils/cn";
import { TOOLS } from "../Toolbar";
import { Segmented, Sheet, SpriteThumb } from "../ui";

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */
interface MenuSheetProps {
  open: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onTransform: () => void;
  onSettings: () => void;
  onClear: () => void;
  onGallery: () => void;
}

function MenuItem({
  icon: Icon,
  label,
  hint,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-14 w-full items-center gap-3 rounded-2xl px-3 text-left transition-colors hover:bg-zinc-800 active:bg-zinc-700 touch-manipulation",
        danger && "text-red-300",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800",
          danger ? "text-red-300" : "text-pink-400",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
    </button>
  );
}

export function MenuSheet(props: MenuSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const go = (fn: () => void) => () => {
    props.onClose();
    fn();
  };
  return (
    <Sheet open={props.open} title="Menu" onClose={props.onClose}>
      <div className="-mx-2 grid gap-0.5">
        <MenuItem icon={Download} label="Export PNG" hint="Download, share or copy" onClick={go(props.onExport)} />
        <MenuItem icon={Upload} label="Import image" hint="Opens as a new sprite" onClick={() => fileRef.current?.click()} />
        <MenuItem icon={Layers} label="Sprite gallery" hint="Switch, duplicate or delete sprites" onClick={go(props.onGallery)} />
        <MenuItem icon={Shapes} label="Transform" hint="Flip, rotate, shift, outline" onClick={go(props.onTransform)} />
        <MenuItem icon={SettingsIcon} label="Canvas & settings" hint="Size, grid, cursor, shortcuts" onClick={go(props.onSettings)} />
        <MenuItem icon={Trash2} label="Clear canvas" hint="Undoable" onClick={go(props.onClear)} danger />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/gif,image/webp,image/bmp,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) {
            props.onClose();
            props.onImport(f);
          }
        }}
      />
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */
interface SettingsSheetProps {
  open: boolean;
  sprite: Sprite;
  settings: Settings;
  onClose: () => void;
  onResize: (size: number) => void;
  onSettings: (patch: Partial<Settings>) => void;
}

function ToggleRow({
  icon: Icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left hover:bg-zinc-800/60 touch-manipulation"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-pink-400">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="block text-xs text-zinc-500">{hint}</span>
      </span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          value ? "bg-pink-500" : "bg-zinc-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
            value ? "translate-x-[1.375rem]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function SettingsSheet({ open, sprite, settings, onClose, onResize, onSettings }: SettingsSheetProps) {
  return (
    <Sheet open={open} title="Canvas & settings" onClose={onClose}>
      <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-zinc-800/60 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
        <p className="text-xs text-zinc-400">
          Sprites are saved only in this browser, on this device — nothing is uploaded anywhere.
          Clearing your browser data or switching devices will lose them, so export anything you
          want to keep.
        </p>
      </div>

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Canvas size</h3>
      <Segmented
        size="md"
        value={sprite.size}
        onChange={onResize}
        options={SPRITE_SIZES.map((s) => ({ value: s, label: `${s} × ${s}` }))}
        className="w-full [&>button]:flex-1"
      />
      <p className="mb-4 mt-1.5 text-xs text-zinc-500">
        Resizing keeps your artwork centered. Shrinking crops the edges (undoable).
      </p>

      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Drawing</h3>
      <div className="-mx-2 mb-4">
        <ToggleRow
          icon={Crosshair}
          label="Fingertip offset cursor"
          hint="Draw slightly above your finger so you can see the pixel"
          value={settings.offsetCursor}
          onChange={(v) => onSettings({ offsetCursor: v })}
        />
        <ToggleRow
          icon={Grid3x3}
          label="Pixel grid"
          hint="Thicker lines every 8 pixels"
          value={settings.showGrid}
          onChange={(v) => onSettings({ showGrid: v })}
        />
        <ToggleRow
          icon={settings.checkerDark ? Moon : Sun}
          label="Dark transparency checker"
          hint="Better for light-coloured sprites"
          value={settings.checkerDark}
          onChange={(v) => onSettings({ checkerDark: v })}
        />
      </div>

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Gestures</h3>
      <ul className="mb-4 space-y-1 text-sm text-zinc-300">
        <li>• One finger — draw with the active tool</li>
        <li>• Two fingers — pinch to zoom, drag to pan</li>
        <li>• Two-finger tap — undo</li>
        <li>• Right-click / mouse wheel — pick colour / zoom</li>
      </ul>

      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        <Keyboard className="h-3.5 w-3.5" /> Keyboard shortcuts
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-300">
        {TOOLS.map((t) => (
          <div key={t.id} className="flex justify-between">
            <span>{t.label}</span>
            <kbd className="rounded bg-zinc-800 px-1.5 font-mono text-xs text-zinc-400">{t.key}</kbd>
          </div>
        ))}
        {[
          ["Undo / Redo", "⌘Z / ⇧⌘Z"],
          ["Mirror", "X"],
          ["Grid", "G"],
          ["Brush size", "[ ]"],
          ["Zoom", "+ / −"],
          ["Reset view", "0"],
        ].map(([l, k]) => (
          <div key={l} className="flex justify-between">
            <span>{l}</span>
            <kbd className="rounded bg-zinc-800 px-1.5 font-mono text-xs text-zinc-400">{k}</kbd>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Preview                                                             */
/* ------------------------------------------------------------------ */
interface PreviewSheetProps {
  open: boolean;
  sprite: Sprite;
  onClose: () => void;
}

export function PreviewSheet({ open, sprite, onClose }: PreviewSheetProps) {
  return (
    <Sheet open={open} title="Preview" onClose={onClose}>
      <div className="mb-4 rounded-2xl bg-zinc-800/60 p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Actual sizes</div>
        <div className="flex flex-wrap items-end gap-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <SpriteThumb pixels={sprite.pixels} size={sprite.size} scale={s} checker={false} />
              <span className="text-[10px] text-zinc-500">{s}×</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-zinc-800/60 p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Tiled 3 × 3</div>
        <div className="flex justify-center">
          <SpriteThumb
            pixels={sprite.pixels}
            size={sprite.size}
            scale={Math.max(1, Math.floor(84 / sprite.size))}
            tiled={3}
            checker={false}
          />
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-white p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">On light background</div>
        <div className="flex items-end gap-6">
          {[2, 4].map((s) => (
            <SpriteThumb key={s} pixels={sprite.pixels} size={sprite.size} scale={s} checker={false} />
          ))}
        </div>
      </div>
    </Sheet>
  );
}
