import {
  Circle,
  Eraser,
  Move,
  PaintBucket,
  Pencil,
  Pipette,
  Slash,
  Square,
  type LucideIcon,
} from "lucide-react";
import type { Tool } from "@/types";
import { cn } from "@/utils/cn";

export const TOOLS: {
  id: Tool;
  label: string;
  short: string;
  icon: LucideIcon;
  key: string;
}[] = [
  { id: "pencil", label: "Pencil", short: "Pencil", icon: Pencil, key: "P" },
  { id: "eraser", label: "Eraser", short: "Eraser", icon: Eraser, key: "E" },
  { id: "fill", label: "Fill", short: "Fill", icon: PaintBucket, key: "F" },
  { id: "picker", label: "Eyedropper", short: "Picker", icon: Pipette, key: "I" },
  { id: "line", label: "Line", short: "Line", icon: Slash, key: "L" },
  { id: "rect", label: "Rectangle", short: "Rect", icon: Square, key: "R" },
  { id: "ellipse", label: "Ellipse", short: "Ellipse", icon: Circle, key: "O" },
  { id: "move", label: "Move", short: "Move", icon: Move, key: "M" },
];

interface ToolbarProps {
  tool: Tool;
  onChange: (tool: Tool) => void;
  vertical?: boolean;
}

export function Toolbar({ tool, onChange, vertical }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Tools"
      className={cn(
        "flex items-center gap-1",
        vertical ? "flex-col" : "w-full justify-between px-1",
      )}
    >
      {TOOLS.map(({ id, label, short, icon: Icon, key }) => {
        const active = id === tool;
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={`${label} (${key})`}
            onClick={() => onChange(id)}
            className={cn(
              "relative flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors touch-manipulation",
              vertical ? "h-12 w-12" : "h-12 flex-1 min-w-10",
              "text-zinc-400 hover:text-white active:bg-zinc-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
              active && "bg-pink-500/15 text-pink-400 hover:text-pink-300",
            )}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
            <span className="text-[9px] font-medium leading-none tracking-wide">
              {short}
            </span>
          </button>
        );
      })}
    </div>
  );
}
