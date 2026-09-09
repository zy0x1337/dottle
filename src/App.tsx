import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { PixelCanvas, type PixelCanvasHandle } from "@/components/PixelCanvas";
import { Header } from "@/components/Header";
import { Toolbar, TOOLS } from "@/components/Toolbar";
import { OptionsBar } from "@/components/OptionsBar";
import { PaletteBar } from "@/components/PaletteBar";
import { SpriteThumb, Toast } from "@/components/ui";
import { GallerySheet } from "@/components/sheets/GallerySheet";
import { ExportSheet } from "@/components/sheets/ExportSheet";
import { ColorSheet } from "@/components/sheets/ColorSheet";
import { TransformSheet } from "@/components/sheets/TransformSheet";
import {
  MenuSheet,
  PreviewSheet,
  SettingsSheet,
} from "@/components/sheets/MiscSheets";
import {
  currentSprite,
  editorReducer,
  initialEditorState,
} from "@/state/editor";
import { getPalette } from "@/lib/palettes";
import { createPixels, usedColors } from "@/lib/pixels";
import { importImageFile } from "@/lib/image";
import { loadSettings, saveData, saveSettings } from "@/lib/storage";
import {
  SPRITE_SIZES,
  type Mirror,
  type Pixels,
  type Settings,
  type SheetId,
  type Tool,
} from "@/types";

const MIRROR_CYCLE: Mirror[] = ["none", "h", "v", "both"];

export default function App() {
  const [state, dispatch] = useReducer(
    editorReducer,
    undefined,
    initialEditorState,
  );
  const sprite = currentSprite(state);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [sheet, setSheet] = useState<SheetId>(null);
  const [zoom, setZoom] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const canvasRef = useRef<PixelCanvasHandle>(null);
  const prevToolRef = useRef<Tool>("pencil");
  const toastTimer = useRef<number | undefined>(undefined);
  const spriteRef = useRef(sprite);
  spriteRef.current = sprite;

  /* ---------- persistence ---------- */
  useEffect(() => {
    saveData({ sprites: state.sprites, currentId: state.currentId });
  }, [state.sprites, state.currentId]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  /* ---------- helpers ---------- */
  const patch = useCallback(
    (p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })),
    [],
  );

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 1800);
  }, []);

  const setTool = useCallback((tool: Tool) => {
    setSettings((s) => {
      if (tool === "picker" && s.tool !== "picker") prevToolRef.current = s.tool;
      return { ...s, tool };
    });
  }, []);

  const selectColor = useCallback((color: string, fromPicker = false) => {
    setSettings((s) => {
      const recentColors = [color, ...s.recentColors.filter((c) => c !== color)].slice(0, 12);
      let customColors = s.customColors;
      if (!getPalette(s.paletteId).colors.includes(color) && !customColors.includes(color)) {
        customColors = [...customColors, color].slice(-32);
      }
      let tool = s.tool;
      if (fromPicker && s.tool === "picker") tool = prevToolRef.current;
      if (tool === "eraser") tool = "pencil";
      return { ...s, color, recentColors, customColors, tool };
    });
  }, []);

  const commit = useCallback((pixels: Pixels) => dispatch({ type: "commit", pixels }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  const cycleMirror = useCallback(
    () =>
      setSettings((s) => ({
        ...s,
        mirror: MIRROR_CYCLE[(MIRROR_CYCLE.indexOf(s.mirror) + 1) % MIRROR_CYCLE.length],
      })),
    [],
  );

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const { size, pixels } = await importImageFile(file, spriteRef.current.size, SPRITE_SIZES);
        const name = file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "Imported";
        dispatch({ type: "import", size, pixels, name });
        setSheet(null);
        toast(`Imported as ${size}×${size}`);
      } catch {
        toast("Could not import that image");
      }
    },
    [toast],
  );

  /* ---------- keyboard shortcuts ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && k === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod || e.altKey) return;
      const tool = TOOLS.find((tl) => tl.key.toLowerCase() === k);
      if (tool) {
        setTool(tool.id);
        return;
      }
      switch (k) {
        case "x":
          cycleMirror();
          break;
        case "g":
          setSettings((s) => ({ ...s, showGrid: !s.showGrid }));
          break;
        case "[":
          setSettings((s) => ({ ...s, brushSize: Math.max(1, s.brushSize - 1) }));
          break;
        case "]":
          setSettings((s) => ({ ...s, brushSize: Math.min(4, s.brushSize + 1) }));
          break;
        case "+":
        case "=":
          canvasRef.current?.zoomBy(1.25);
          break;
        case "-":
          canvasRef.current?.zoomBy(0.8);
          break;
        case "0":
          canvasRef.current?.resetView();
          break;
        case "escape":
          setSheet(null);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, setTool, cycleMirror]);

  /* ---------- derived ---------- */
  const palette = getPalette(settings.paletteId);
  const spriteColors = useMemo(() => usedColors(sprite.pixels), [sprite.pixels]);
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const optionsBarProps = {
    tool: settings.tool,
    brushSize: settings.brushSize,
    shapeFill: settings.shapeFill,
    fillGlobal: settings.fillGlobal,
    mirror: settings.mirror,
    showGrid: settings.showGrid,
    zoom,
    onBrushSize: (n: number) => patch({ brushSize: n }),
    onShapeFill: (v: boolean) => patch({ shapeFill: v }),
    onFillGlobal: (v: boolean) => patch({ fillGlobal: v }),
    onMirror: (m: Mirror) => patch({ mirror: m }),
    onToggleGrid: () => patch({ showGrid: !settings.showGrid }),
    onZoomIn: () => canvasRef.current?.zoomBy(1.25),
    onZoomOut: () => canvasRef.current?.zoomBy(0.8),
    onResetView: () => canvasRef.current?.resetView(),
    onOpenTransform: () => setSheet("transform"),
  };

  const paletteBarProps = {
    colors: palette.colors,
    customColors: settings.customColors,
    color: settings.color,
    onSelect: (c: string) => selectColor(c),
    onAddCustom: (c: string) => selectColor(c.toLowerCase()),
    onOpenColorSheet: () => setSheet("color"),
  };

  return (
    <div className="app-height flex flex-col bg-zinc-950 text-zinc-100 antialiased pt-[env(safe-area-inset-top)]">
      <Header
        sprite={sprite}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onRename={(name) => dispatch({ type: "rename", id: sprite.id, name })}
        onOpenGallery={() => setSheet("gallery")}
        onOpenMenu={() => setSheet("menu")}
        onOpenPreview={() => setSheet("preview")}
      />

      <div className="flex min-h-0 flex-1 flex-col select-none lg:flex-row">
        {/* Desktop tool rail */}
        <aside className="hidden shrink-0 flex-col items-center gap-2 border-r border-white/5 bg-zinc-950 p-2 lg:flex">
          <Toolbar vertical tool={settings.tool} onChange={setTool} />
        </aside>

        {/* Canvas */}
        <main className="relative min-h-0 flex-1 bg-zinc-900/60">
          <div className="absolute inset-0 p-2 lg:p-6">
            <div className="relative h-full w-full">
              <PixelCanvas
                ref={canvasRef}
                size={sprite.size}
                pixels={sprite.pixels}
                tool={settings.tool}
                color={settings.color}
                brushSize={settings.brushSize}
                shapeFill={settings.shapeFill}
                fillGlobal={settings.fillGlobal}
                mirror={settings.mirror}
                showGrid={settings.showGrid}
                checkerDark={settings.checkerDark}
                offsetCursor={settings.offsetCursor}
                onCommit={commit}
                onPickColor={(c) => selectColor(c, true)}
                onZoomChange={setZoom}
                onTwoFingerTap={() => {
                  if (state.past.length > 0) {
                    undo();
                    toast("Undo");
                  }
                }}
              />
            </div>
          </div>
        </main>

        {/* Desktop side panel */}
        <aside className="hidden w-80 shrink-0 flex-col gap-5 overflow-y-auto border-l border-white/5 bg-zinc-950 p-4 lg:flex">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Preview</h3>
            <button
              type="button"
              onClick={() => setSheet("preview")}
              className="flex w-full items-end gap-4 rounded-2xl bg-zinc-900 p-3 ring-1 ring-white/5 hover:ring-white/20"
            >
              {[1, 2, 4].map((s) => (
                <SpriteThumb key={s} pixels={sprite.pixels} size={sprite.size} scale={s} checker={false} />
              ))}
            </button>
          </section>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Options</h3>
            <OptionsBar {...optionsBarProps} wrap />
          </section>
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {palette.name}
              </h3>
              <button
                type="button"
                onClick={() => setSheet("color")}
                className="text-xs font-medium text-pink-400 hover:text-pink-300"
              >
                Change palette
              </button>
            </div>
            <PaletteBar {...paletteBarProps} wrap />
          </section>
        </aside>

        {/* Mobile bottom bars */}
        <div className="shrink-0 border-t border-white/5 bg-zinc-950 pb-[env(safe-area-inset-bottom)] lg:hidden">
          <div className="flex h-11 items-center">
            <div className="w-full">
              <OptionsBar {...optionsBarProps} />
            </div>
          </div>
          <div className="flex h-14 items-center border-t border-white/5">
            <div className="w-full">
              <PaletteBar {...paletteBarProps} />
            </div>
          </div>
          <div className="flex h-16 items-center border-t border-white/5">
            <Toolbar tool={settings.tool} onChange={setTool} />
          </div>
        </div>
      </div>

      {/* Sheets */}
      <GallerySheet
        open={sheet === "gallery"}
        sprites={state.sprites}
        currentId={state.currentId}
        onClose={() => setSheet(null)}
        onSelect={(id) => dispatch({ type: "select", id })}
        onCreate={(size) => {
          dispatch({ type: "create", size });
          setSheet(null);
        }}
        onDuplicate={(id) => {
          dispatch({ type: "duplicate", id });
          toast("Duplicated");
        }}
        onRemove={(id) => dispatch({ type: "remove", id })}
        onImport={handleImport}
      />
      <ExportSheet open={sheet === "export"} sprite={sprite} onClose={() => setSheet(null)} toast={toast} />
      <ColorSheet
        open={sheet === "color"}
        color={settings.color}
        paletteId={settings.paletteId}
        customColors={settings.customColors}
        recentColors={settings.recentColors}
        spriteColors={spriteColors}
        onClose={() => setSheet(null)}
        onSelect={(c) => selectColor(c)}
        onPalette={(id) => patch({ paletteId: id })}
        onAddCustom={(c) => selectColor(c.toLowerCase())}
        onRemoveCustom={(c) =>
          setSettings((s) => ({ ...s, customColors: s.customColors.filter((x) => x !== c) }))
        }
      />
      <TransformSheet
        open={sheet === "transform"}
        pixels={sprite.pixels}
        size={sprite.size}
        color={settings.color}
        onClose={() => setSheet(null)}
        onApply={(px) => commit(px)}
      />
      <SettingsSheet
        open={sheet === "settings"}
        sprite={sprite}
        settings={settings}
        onClose={() => setSheet(null)}
        onResize={(size) => dispatch({ type: "resize", size })}
        onSettings={patch}
      />
      <PreviewSheet open={sheet === "preview"} sprite={sprite} onClose={() => setSheet(null)} />
      <MenuSheet
        open={sheet === "menu"}
        onClose={() => setSheet(null)}
        onExport={() => setSheet("export")}
        onImport={handleImport}
        onTransform={() => setSheet("transform")}
        onSettings={() => setSheet("settings")}
        onGallery={() => setSheet("gallery")}
        onClear={() => {
          commit(createPixels(sprite.size));
          toast("Canvas cleared");
        }}
      />

      <Toast message={toastMsg} />
    </div>
  );
}
