import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, LayoutGrid, Redo2, Undo2 } from "lucide-react";
import type { Sprite } from "@/types";
import { IconButton, SpriteThumb } from "./ui";

interface HeaderProps {
  sprite: Sprite;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRename: (name: string) => void;
  onOpenGallery: () => void;
  onOpenMenu: () => void;
  onOpenPreview: () => void;
}

export function Header({
  sprite,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRename,
  onOpenGallery,
  onOpenMenu,
  onOpenPreview,
}: HeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(sprite.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== sprite.name) onRename(draft);
  };

  const thumbScale = Math.max(1, Math.floor(36 / sprite.size));

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-white/5 bg-zinc-950/80 px-2 backdrop-blur">
      <IconButton label="Sprite gallery" onClick={onOpenGallery}>
        <LayoutGrid className="h-5 w-5" />
      </IconButton>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onOpenPreview}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800/80 ring-1 ring-white/10 touch-manipulation"
          aria-label="Preview"
          title="Preview at actual size"
        >
          <SpriteThumb pixels={sprite.pixels} size={sprite.size} scale={thumbScale} checker={false} />
        </button>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            maxLength={40}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(sprite.name);
                setEditing(false);
              }
            }}
            className="h-9 min-w-0 flex-1 rounded-lg bg-zinc-800 px-2 text-sm font-semibold text-white outline-none ring-2 ring-pink-500"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(sprite.name);
              setEditing(true);
            }}
            className="flex min-w-0 flex-col items-start rounded-lg px-1.5 py-1 text-left hover:bg-zinc-800/70 touch-manipulation"
            title="Rename sprite"
          >
            <span className="w-full truncate text-sm font-semibold text-white">
              {sprite.name}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {sprite.size}×{sprite.size}
            </span>
          </button>
        )}
      </div>

      <IconButton label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
        <Undo2 className="h-5 w-5" />
      </IconButton>
      <IconButton label="Redo (Ctrl+Shift+Z)" onClick={onRedo} disabled={!canRedo}>
        <Redo2 className="h-5 w-5" />
      </IconButton>
      <IconButton label="Menu" onClick={onOpenMenu}>
        <EllipsisVertical className="h-5 w-5" />
      </IconButton>
    </header>
  );
}
