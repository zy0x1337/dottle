import { useEffect, useRef } from "react";
import { Palette, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import { isLightColor } from "@/lib/pixels";

interface PaletteBarProps {
  colors: string[];
  customColors: string[];
  color: string;
  onSelect: (color: string) => void;
  onAddCustom: (color: string) => void;
  onOpenColorSheet: () => void;
  wrap?: boolean;
}

export function Swatch({
  color,
  selected,
  onClick,
  size = "md",
  className,
}: {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const light = isLightColor(color);
  return (
    <button
      type="button"
      aria-label={`Colour ${color}`}
      aria-pressed={selected}
      title={color}
      onClick={onClick}
      style={{ backgroundColor: color }}
      className={cn(
        "relative shrink-0 rounded-lg ring-1 ring-inset ring-white/10 transition-transform touch-manipulation active:scale-95",
        size === "sm" && "h-8 w-8",
        size === "md" && "h-9 w-9",
        size === "lg" && "h-11 w-11",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
        selected && "scale-110 ring-2 ring-inset",
        selected && (light ? "ring-black/70" : "ring-white"),
        className,
      )}
    >
      {selected && (
        <span
          className={cn(
            "absolute inset-0 m-auto h-2 w-2 rounded-full",
            light ? "bg-black/70" : "bg-white",
          )}
        />
      )}
    </button>
  );
}

export function PaletteBar({
  colors,
  customColors,
  color,
  onSelect,
  onAddCustom,
  onOpenColorSheet,
  wrap,
}: PaletteBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // keep the active swatch visible in the horizontal strip
  useEffect(() => {
    if (wrap) return;
    const el = scrollRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [color, wrap]);

  return (
    <div className={cn("flex items-center gap-2", wrap ? "flex-col items-stretch" : "px-2")}>
      <button
        type="button"
        onClick={onOpenColorSheet}
        aria-label="Current colour – open colour picker"
        title="Colour picker"
        className={cn(
          "relative shrink-0 rounded-xl ring-2 ring-white/20 transition-transform touch-manipulation active:scale-95",
          wrap ? "h-12 w-full" : "h-11 w-11",
        )}
        style={{ backgroundColor: color }}
      >
        <Palette
          className={cn(
            "absolute bottom-1 right-1 h-3.5 w-3.5 drop-shadow",
            isLightColor(color) ? "text-black/60" : "text-white/80",
          )}
        />
        {wrap && (
          <span
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold",
              isLightColor(color) ? "text-black/70" : "text-white/90",
            )}
          >
            {color}
          </span>
        )}
      </button>

      <div
        ref={scrollRef}
        className={cn(
          "flex items-center gap-1.5",
          wrap
            ? "flex-wrap"
            : "flex-1 overflow-x-auto no-scrollbar py-1.5 pr-1 scroll-px-2",
        )}
      >
        {colors.map((c) => (
          <Swatch key={c} color={c} selected={c === color} onClick={() => onSelect(c)} />
        ))}
        {customColors.length > 0 && (
          <span className="mx-0.5 h-6 w-px shrink-0 bg-zinc-700" aria-hidden="true" />
        )}
        {customColors.map((c) => (
          <Swatch key={"custom-" + c} color={c} selected={c === color} onClick={() => onSelect(c)} />
        ))}
        <button
          type="button"
          aria-label="Add custom colour"
          title="Add custom colour"
          onClick={() => inputRef.current?.click()}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-600 text-zinc-400 hover:border-zinc-400 hover:text-white touch-manipulation"
        >
          <Plus className="h-4 w-4" />
          <input
            ref={inputRef}
            type="color"
            value={color}
            onChange={(e) => onAddCustom(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            tabIndex={-1}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
