import { useMemo, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";
import type { Sprite } from "@/types";
import {
  canCopyImage,
  canShareFiles,
  canvasToBlob,
  copyBlobToClipboard,
  downloadBlob,
  renderSpriteToCanvas,
  safeFileName,
  shareBlob,
} from "@/lib/image";
import { Button, Segmented, Sheet, SpriteThumb } from "../ui";

interface ExportSheetProps {
  open: boolean;
  sprite: Sprite;
  onClose: () => void;
  toast: (msg: string) => void;
}

const SCALES = [1, 2, 4, 8, 16, 32];
type Bg = "transparent" | "white" | "black";

export function ExportSheet({ open, sprite, onClose, toast }: ExportSheetProps) {
  const [scale, setScale] = useState(8);
  const [bg, setBg] = useState<Bg>("transparent");
  const [busy, setBusy] = useState(false);

  const shareOk = useMemo(() => canShareFiles(), []);
  const copyOk = useMemo(() => canCopyImage(), []);

  const background = bg === "transparent" ? undefined : bg === "white" ? "#ffffff" : "#000000";
  const filename = `${safeFileName(sprite.name)}-${sprite.size}x${sprite.size}@${scale}x.png`;

  const makeBlob = () =>
    canvasToBlob(renderSpriteToCanvas(sprite.pixels, sprite.size, scale, background));

  const run = async (fn: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await fn();
      toast(success);
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") toast("That didn't work – try downloading instead");
    } finally {
      setBusy(false);
    }
  };

  const px = sprite.size * scale;

  return (
    <Sheet open={open} title="Export PNG" onClose={onClose}>
      <div className="mb-4 flex justify-center rounded-2xl bg-zinc-800/60 p-4">
        <div className="checker rounded-lg p-2">
          <SpriteThumb
            pixels={sprite.pixels}
            size={sprite.size}
            scale={Math.max(1, Math.floor(128 / sprite.size))}
            checker={false}
          />
        </div>
      </div>

      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Scale
      </label>
      <Segmented
        size="md"
        value={scale}
        onChange={setScale}
        options={SCALES.map((s) => ({ value: s, label: `${s}×` }))}
        className="mb-1 w-full justify-between [&>button]:flex-1"
      />
      <p className="mb-4 text-xs text-zinc-500">
        Output: {px} × {px} px · nearest-neighbour, crisp pixels
      </p>

      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Background
      </label>
      <Segmented
        size="md"
        value={bg}
        onChange={setBg}
        options={[
          { value: "transparent", label: "Transparent" },
          { value: "white", label: "White" },
          { value: "black", label: "Black" },
        ]}
        className="mb-6 w-full [&>button]:flex-1"
      />

      <div className="grid gap-2">
        <Button
          variant="primary"
          disabled={busy}
          onClick={() =>
            run(async () => downloadBlob(await makeBlob(), filename), "Downloading PNG")
          }
        >
          <Download className="h-4 w-4" />
          Download {filename}
        </Button>
        {shareOk && (
          <Button
            disabled={busy}
            onClick={() =>
              run(async () => shareBlob(await makeBlob(), filename, sprite.name), "Shared")
            }
          >
            <Share2 className="h-4 w-4" />
            Share…
          </Button>
        )}
        {copyOk && (
          <Button
            disabled={busy}
            onClick={() => run(() => copyBlobToClipboard(makeBlob()), "Copied image to clipboard")}
          >
            <Copy className="h-4 w-4" />
            Copy to clipboard
          </Button>
        )}
      </div>
    </Sheet>
  );
}
