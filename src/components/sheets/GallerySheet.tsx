import { useRef, useState } from "react";
import { Check, CopyPlus, Plus, Trash2, Upload } from "lucide-react";
import type { Sprite } from "@/types";
import { SPRITE_SIZES } from "@/types";
import { cn } from "@/utils/cn";
import { Button, Sheet, SpriteThumb } from "../ui";

interface GallerySheetProps {
  open: boolean;
  sprites: Sprite[];
  currentId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreate: (size: number) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onImport: (file: File) => void;
}

export function GallerySheet(props: GallerySheetProps) {
  const { open, sprites, currentId, onClose } = props;
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Sheet open={open} title="Sprites" onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap gap-2">
        {SPRITE_SIZES.map((s) => (
          <Button key={s} onClick={() => props.onCreate(s)} className="flex-1 min-w-[6.5rem]">
            <Plus className="h-4 w-4" />
            {s}×{s}
          </Button>
        ))}
        <Button onClick={() => fileRef.current?.click()} className="flex-1 min-w-[6.5rem]">
          <Upload className="h-4 w-4" />
          Import PNG
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/gif,image/webp,image/bmp,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) props.onImport(f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sprites.map((s) => {
          const active = s.id === currentId;
          const scale = Math.max(1, Math.floor(88 / s.size));
          return (
            <div
              key={s.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-800/70 ring-1 transition-colors",
                active ? "ring-pink-500" : "ring-white/5 hover:ring-white/20",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  props.onSelect(s.id);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-3 pb-2 touch-manipulation"
              >
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg">
                  <SpriteThumb pixels={s.pixels} size={s.size} scale={scale} />
                </div>
                <div className="w-full text-center">
                  <div className="truncate text-sm font-semibold text-white">{s.name}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    {s.size}×{s.size}
                  </div>
                </div>
              </button>
              <div className="flex items-center justify-between border-t border-white/5 px-1 py-1">
                <button
                  type="button"
                  onClick={() => props.onDuplicate(s.id)}
                  className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white touch-manipulation"
                  title="Duplicate"
                >
                  <CopyPlus className="h-3.5 w-3.5" />
                  Copy
                </button>
                {confirmId === s.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      props.onRemove(s.id);
                      setConfirmId(null);
                    }}
                    onBlur={() => setConfirmId(null)}
                    autoFocus
                    className="flex h-8 items-center gap-1 rounded-lg bg-red-500 px-2 text-xs font-semibold text-white touch-manipulation"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Delete?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(s.id)}
                    className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-zinc-400 hover:bg-red-500/20 hover:text-red-300 touch-manipulation"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {active && (
                <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-pink-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  Open
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
