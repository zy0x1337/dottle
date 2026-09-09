import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { PALETTES } from "@/lib/palettes";
import { isLightColor, normalizeHex } from "@/lib/pixels";
import { cn } from "@/utils/cn";
import { Swatch } from "../PaletteBar";
import { Chip, Sheet } from "../ui";

interface ColorSheetProps {
  open: boolean;
  color: string;
  paletteId: string;
  customColors: string[];
  recentColors: string[];
  spriteColors: string[];
  onClose: () => void;
  onSelect: (color: string) => void;
  onPalette: (id: string) => void;
  onAddCustom: (color: string) => void;
  onRemoveCustom: (color: string) => void;
}

export function ColorSheet(props: ColorSheetProps) {
  const { open, color, paletteId, customColors, recentColors, spriteColors, onClose } = props;
  const [hex, setHex] = useState(color);
  const [editCustom, setEditCustom] = useState(false);

  useEffect(() => setHex(color), [color, open]);

  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];
  const hexValid = normalizeHex(hex) !== null;

  const applyHex = () => {
    const n = normalizeHex(hex);
    if (n) props.onAddCustom(n);
  };

  return (
    <Sheet open={open} title="Colour" onClose={onClose}>
      {/* current colour + hex entry */}
      <div className="mb-5 flex items-center gap-3">
        <label
          className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-2xl ring-2 ring-white/20"
          style={{ backgroundColor: color }}
          title="Open system colour picker"
        >
          <input
            type="color"
            value={color}
            onChange={(e) => props.onAddCustom(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="System colour picker"
          />
          <span
            className={cn(
              "pointer-events-none absolute bottom-1 right-1.5 text-[9px] font-bold uppercase",
              isLightColor(color) ? "text-black/60" : "text-white/80",
            )}
          >
            pick
          </span>
        </label>
        <div className="flex flex-1 items-center gap-2">
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyHex()}
            spellCheck={false}
            autoCapitalize="off"
            inputMode="text"
            className={cn(
              "h-11 w-full min-w-0 rounded-xl bg-zinc-800 px-3 font-mono text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-pink-500",
              !hexValid && "ring-red-500 focus:ring-red-500",
            )}
            placeholder="#rrggbb"
            aria-label="Hex colour"
          />
          <button
            type="button"
            onClick={applyHex}
            disabled={!hexValid}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white disabled:opacity-40 touch-manipulation"
            aria-label="Use colour"
          >
            <Check className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* palette picker */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Palette</h3>
        <span className="text-xs text-zinc-500">{palette.colors.length} colours</span>
      </div>
      <div className="no-scrollbar -mx-5 mb-3 flex gap-1.5 overflow-x-auto px-5">
        {PALETTES.map((p) => (
          <Chip key={p.id} active={p.id === paletteId} onClick={() => props.onPalette(p.id)}>
            <span className="flex gap-px">
              {p.colors.slice(0, 4).map((c) => (
                <span key={c} className="h-3 w-1.5 first:rounded-l-sm last:rounded-r-sm" style={{ backgroundColor: c }} />
              ))}
            </span>
            {p.name}
          </Chip>
        ))}
      </div>
      <div className="mb-5 grid grid-cols-8 gap-1.5">
        {palette.colors.map((c) => (
          <Swatch key={c} color={c} size="lg" selected={c === color} onClick={() => props.onSelect(c)} className="w-full" />
        ))}
      </div>

      {/* sprite colours */}
      {spriteColors.length > 0 && (
        <>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            In this sprite
          </h3>
          <div className="mb-5 flex flex-wrap gap-1.5">
            {spriteColors.map((c) => (
              <Swatch key={c} color={c} selected={c === color} onClick={() => props.onSelect(c)} />
            ))}
          </div>
        </>
      )}

      {/* custom colours */}
      {customColors.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Custom</h3>
            <button
              type="button"
              onClick={() => setEditCustom((v) => !v)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {editCustom ? "Done" : "Remove"}
            </button>
          </div>
          <div className="mb-5 flex flex-wrap gap-1.5">
            {customColors.map((c) => (
              <div key={c} className="relative">
                <Swatch
                  color={c}
                  selected={!editCustom && c === color}
                  onClick={() => (editCustom ? props.onRemoveCustom(c) : props.onSelect(c))}
                  className={cn(editCustom && "opacity-70")}
                />
                {editCustom && (
                  <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    ×
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {recentColors.length > 0 && (
        <>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Recent</h3>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {recentColors.map((c) => (
              <Swatch key={c} color={c} size="sm" selected={c === color} onClick={() => props.onSelect(c)} />
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}
