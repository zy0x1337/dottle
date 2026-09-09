import {
  FlipHorizontal2,
  FlipVertical2,
  Grid3x3,
  Maximize,
  Shapes,
  Square,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { Mirror, Tool } from "@/types";
import { Chip, IconButton, Segmented } from "./ui";
import { cn } from "@/utils/cn";

interface OptionsBarProps {
  tool: Tool;
  brushSize: number;
  shapeFill: boolean;
  fillGlobal: boolean;
  mirror: Mirror;
  showGrid: boolean;
  zoom: number;
  onBrushSize: (n: number) => void;
  onShapeFill: (v: boolean) => void;
  onFillGlobal: (v: boolean) => void;
  onMirror: (m: Mirror) => void;
  onToggleGrid: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onOpenTransform: () => void;
  wrap?: boolean;
}

const MIRROR_CYCLE: Mirror[] = ["none", "h", "v", "both"];
const MIRROR_LABEL: Record<Mirror, string> = {
  none: "Mirror off",
  h: "Mirror horizontal",
  v: "Mirror vertical",
  both: "Mirror both",
};

export function OptionsBar(props: OptionsBarProps) {
  const { tool, brushSize, shapeFill, fillGlobal, mirror, showGrid, zoom, wrap } = props;

  const usesBrush =
    tool === "pencil" || tool === "eraser" || tool === "line" ||
    tool === "rect" || tool === "ellipse";
  const isShape = tool === "rect" || tool === "ellipse";

  const nextMirror = () =>
    props.onMirror(MIRROR_CYCLE[(MIRROR_CYCLE.indexOf(mirror) + 1) % 4]);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        wrap ? "flex-wrap gap-y-2" : "no-scrollbar overflow-x-auto px-2",
      )}
    >
      {usesBrush && (
        <div className="flex shrink-0 items-center gap-1.5" title="Brush size ([ / ])">
          {wrap && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Size
            </span>
          )}
          <Segmented
            value={brushSize}
            onChange={props.onBrushSize}
            options={[1, 2, 3, 4].map((n) => ({ value: n, label: n, title: `Brush ${n}px` }))}
            className="[&>button]:min-w-7 [&>button]:px-1.5"
          />
        </div>
      )}
      {isShape && (
        <Chip
          active={shapeFill}
          onClick={() => props.onShapeFill(!shapeFill)}
          title={shapeFill ? "Filled shape" : "Outlined shape"}
          className="px-2.5"
        >
          <Square className="h-4 w-4" fill={shapeFill ? "currentColor" : "none"} />
          Fill
        </Chip>
      )}
      {tool === "fill" && (
        <Chip
          active={fillGlobal}
          onClick={() => props.onFillGlobal(!fillGlobal)}
          title="Replace this colour everywhere instead of filling the connected area"
          className="px-2.5"
        >
          {fillGlobal ? "Replace all" : "Area"}
        </Chip>
      )}
      {tool === "picker" && (
        <span className="shrink-0 pl-1 text-xs text-zinc-500">Tap a pixel to pick</span>
      )}
      {tool === "move" && (
        <span className="shrink-0 pl-1 text-xs text-zinc-500">Drag to move</span>
      )}

      <div className={cn("min-w-2 flex-1", wrap && "basis-full")} />

      <Chip
        active={mirror !== "none"}
        onClick={nextMirror}
        title={`${MIRROR_LABEL[mirror]} (X)`}
        aria-label={`${MIRROR_LABEL[mirror]} – tap to change`}
        className="gap-1 px-2"
      >
        {mirror === "v" ? (
          <FlipVertical2 className="h-4 w-4" />
        ) : (
          <FlipHorizontal2 className="h-4 w-4" />
        )}
        <span className="text-[11px]">
          {mirror === "none" ? "Mirror" : mirror === "h" ? "H" : mirror === "v" ? "V" : "H+V"}
        </span>
      </Chip>

      <IconButton
        label="Toggle grid (G)"
        size="sm"
        active={showGrid}
        onClick={props.onToggleGrid}
      >
        <Grid3x3 className="h-[18px] w-[18px]" />
      </IconButton>

      <IconButton label="Transform sprite" size="sm" onClick={props.onOpenTransform}>
        <Shapes className="h-[18px] w-[18px]" />
      </IconButton>

      <div className="hidden shrink-0 items-center sm:flex">
        <IconButton label="Zoom out (-)" size="sm" onClick={props.onZoomOut} disabled={zoom <= 1}>
          <ZoomOut className="h-[18px] w-[18px]" />
        </IconButton>
        <button
          type="button"
          onClick={props.onResetView}
          className="min-w-12 rounded-md px-1 text-center text-xs tabular-nums text-zinc-400 hover:text-white"
          title="Reset view (0)"
        >
          {Math.round(zoom * 100)}%
        </button>
        <IconButton label="Zoom in (+)" size="sm" onClick={props.onZoomIn} disabled={zoom >= 16}>
          <ZoomIn className="h-[18px] w-[18px]" />
        </IconButton>
      </div>
      {zoom > 1.01 && (
        <IconButton
          label="Reset view"
          size="sm"
          onClick={props.onResetView}
          className="text-pink-400 sm:hidden"
        >
          <Maximize className="h-[18px] w-[18px]" />
        </IconButton>
      )}
    </div>
  );
}
