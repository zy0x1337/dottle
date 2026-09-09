import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Cell, Mirror, Pixels, Tool } from "@/types";
import {
  bresenham,
  clamp,
  drawEllipse,
  drawLine,
  drawRect,
  floodFill,
  idx,
  inBounds,
  plotBrush,
  replaceColor,
  shiftPixels,
} from "@/lib/pixels";

export interface PixelCanvasHandle {
  zoomBy: (factor: number) => void;
  resetView: () => void;
}

export interface PixelCanvasProps {
  size: number;
  pixels: Pixels;
  tool: Tool;
  color: string;
  brushSize: number;
  shapeFill: boolean;
  fillGlobal: boolean;
  mirror: Mirror;
  showGrid: boolean;
  checkerDark: boolean;
  offsetCursor: boolean;
  onCommit: (pixels: Pixels) => void;
  onPickColor: (color: string) => void;
  onZoomChange?: (zoom: number) => void;
  onTwoFingerTap?: () => void;
}

interface View {
  zoom: number;
  panX: number;
  panY: number;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  pointerId: number;
  offset: boolean;
  tool: Tool;
  snapshot: Pixels;
  start: Cell;
  last: Cell;
}

interface Gesture {
  startDist: number;
  startZoom: number;
  startMid: Point;
  startPan: Point;
  startTime: number;
  moved: boolean;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 16;
const OFFSET_Y = 64; // css px the offset-cursor floats above the fingertip

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

function clampView(v: View, display: number): View {
  const zoom = clamp(v.zoom, MIN_ZOOM, MAX_ZOOM);
  const minPan = display - display * zoom;
  return {
    zoom,
    panX: clamp(v.panX, minPan, 0),
    panY: clamp(v.panY, minPan, 0),
  };
}

export const PixelCanvas = forwardRef<PixelCanvasHandle, PixelCanvasProps>(
  function PixelCanvas(props, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [display, setDisplay] = useState(0);
    const displayRef = useRef(0);
    displayRef.current = display;
    const propsRef = useRef(props);
    propsRef.current = props;

    const viewRef = useRef<View>({ zoom: 1, panX: 0, panY: 0 });
    const draftRef = useRef<Pixels | null>(null);
    const strokeRef = useRef<Stroke | null>(null);
    const gestureRef = useRef<Gesture | null>(null);
    const pointersRef = useRef(new Map<number, Point>());
    const suppressRef = useRef(false);
    const cursorRef = useRef<Cell | null>(null);
    const rafRef = useRef(0);
    const lastZoomPctRef = useRef(100);

    /* ---------- measuring ---------- */
    useLayoutEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const update = () => {
        const rect = el.getBoundingClientRect();
        setDisplay(Math.max(0, Math.floor(Math.min(rect.width, rect.height))));
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    /* ---------- rendering ---------- */
    const render = useCallback(() => {
      const canvas = canvasRef.current;
      const d = displayRef.current;
      if (!canvas || d === 0) return;
      const { size, showGrid, mirror, checkerDark, brushSize, tool } =
        propsRef.current;
      const pixels = draftRef.current ?? propsRef.current.pixels;
      const dpr = window.devicePixelRatio || 1;
      const W = Math.round(d * dpr);
      if (canvas.width !== W || canvas.height !== W) {
        canvas.width = W;
        canvas.height = W;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const v = viewRef.current;
      const cell = (W * v.zoom) / size;
      const ox = v.panX * dpr;
      const oy = v.panY * dpr;
      const ex: number[] = new Array(size + 1);
      const ey: number[] = new Array(size + 1);
      for (let i = 0; i <= size; i++) {
        ex[i] = Math.round(ox + i * cell);
        ey[i] = Math.round(oy + i * cell);
      }

      ctx.clearRect(0, 0, W, W);

      const cMin = clamp(Math.floor(-ox / cell), 0, size - 1);
      const cMax = clamp(Math.floor((W - ox) / cell), 0, size - 1);
      const rMin = clamp(Math.floor(-oy / cell), 0, size - 1);
      const rMax = clamp(Math.floor((W - oy) / cell), 0, size - 1);

      const checker = checkerDark
        ? ["#3b3b42", "#2e2e34"]
        : ["#ececf1", "#d6d6de"];

      for (let r = rMin; r <= rMax; r++) {
        const y0 = ey[r];
        const h = ey[r + 1] - y0;
        for (let c = cMin; c <= cMax; c++) {
          const x0 = ex[c];
          const w = ex[c + 1] - x0;
          ctx.fillStyle = checker[(c + r) & 1];
          ctx.fillRect(x0, y0, w, h);
          const p = pixels[idx(size, c, r)];
          if (p) {
            ctx.fillStyle = p;
            ctx.fillRect(x0, y0, w, h);
          }
        }
      }

      const lw = dpr >= 3 ? 2 : 1;
      if (showGrid && cell >= 4 * lw) {
        const minor = checkerDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.16)";
        const major = checkerDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.42)";
        const yStart = ey[rMin];
        const yEnd = ey[rMax + 1];
        const xStart = ex[cMin];
        const xEnd = ex[cMax + 1];
        for (let i = cMin + 1; i <= cMax; i++) {
          ctx.fillStyle = i % 8 === 0 ? major : minor;
          ctx.fillRect(ex[i], yStart, lw, yEnd - yStart);
        }
        for (let i = rMin + 1; i <= rMax; i++) {
          ctx.fillStyle = i % 8 === 0 ? major : minor;
          ctx.fillRect(xStart, ey[i], xEnd - xStart, lw);
        }
      }

      if (mirror !== "none") {
        ctx.fillStyle = "rgba(244,114,182,0.9)";
        const m = size / 2;
        const aw = lw * 2;
        if (mirror === "h" || mirror === "both") {
          ctx.fillRect(ex[m] - lw, ey[0], aw, ey[size] - ey[0]);
        }
        if (mirror === "v" || mirror === "both") {
          ctx.fillRect(ex[0], ey[m] - lw, ex[size] - ex[0], aw);
        }
      }

      // border
      ctx.strokeStyle = checkerDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.4)";
      ctx.lineWidth = lw;
      ctx.strokeRect(
        ex[0] + lw / 2,
        ey[0] + lw / 2,
        ex[size] - ex[0] - lw,
        ey[size] - ey[0] - lw,
      );

      // cursor / brush footprint
      const cur = cursorRef.current;
      if (cur) {
        const usesBrush =
          tool === "pencil" || tool === "eraser" || tool === "line" ||
          tool === "rect" || tool === "ellipse";
        const b = usesBrush ? brushSize : 1;
        const off = Math.floor((b - 1) / 2);
        const c0 = clamp(cur.c - off, 0, size);
        const c1 = clamp(cur.c - off + b, 0, size);
        const r0 = clamp(cur.r - off, 0, size);
        const r1 = clamp(cur.r - off + b, 0, size);
        if (c1 > c0 && r1 > r0) {
          const x0 = ex[c0];
          const y0 = ey[r0];
          const w = ex[c1] - x0;
          const h = ey[r1] - y0;
          ctx.lineWidth = 3 * lw;
          ctx.strokeStyle = "rgba(0,0,0,0.75)";
          ctx.strokeRect(x0, y0, w, h);
          ctx.lineWidth = lw;
          ctx.strokeStyle = "#ffffff";
          ctx.strokeRect(x0, y0, w, h);
          if (strokeRef.current?.offset) {
            // crosshair ticks to make the floating cursor obvious
            const cx = x0 + w / 2;
            const cy = y0 + h / 2;
            const t = 14 * dpr;
            ctx.fillStyle = "rgba(0,0,0,0.75)";
            ctx.fillRect(cx - lw * 1.5, y0 - t, lw * 3, t - 2 * lw);
            ctx.fillRect(cx - lw * 1.5, y0 + h + 2 * lw, lw * 3, t - 2 * lw);
            ctx.fillRect(x0 - t, cy - lw * 1.5, t - 2 * lw, lw * 3);
            ctx.fillRect(x0 + w + 2 * lw, cy - lw * 1.5, t - 2 * lw, lw * 3);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx - lw / 2, y0 - t + lw, lw, t - 4 * lw);
            ctx.fillRect(cx - lw / 2, y0 + h + 3 * lw, lw, t - 4 * lw);
            ctx.fillRect(x0 - t + lw, cy - lw / 2, t - 4 * lw, lw);
            ctx.fillRect(x0 + w + 3 * lw, cy - lw / 2, t - 4 * lw, lw);
          }
        }
      }
    }, []);

    const schedule = useCallback(() => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        render();
      });
    }, [render]);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    // Committed pixels changed → drop any draft and redraw
    useLayoutEffect(() => {
      draftRef.current = null;
      render();
    }, [render, props.pixels]);

    // Visual-only settings changed → just redraw
    useLayoutEffect(() => {
      render();
    }, [
      render,
      props.showGrid,
      props.mirror,
      props.checkerDark,
      props.brushSize,
      props.tool,
    ]);

    const emitZoom = useCallback(() => {
      const pct = Math.round(viewRef.current.zoom * 100);
      if (pct !== lastZoomPctRef.current) {
        lastZoomPctRef.current = pct;
        propsRef.current.onZoomChange?.(viewRef.current.zoom);
      }
    }, []);

    // New sprite size or viewport → reset the view
    useLayoutEffect(() => {
      viewRef.current = { zoom: 1, panX: 0, panY: 0 };
      emitZoom();
      render();
    }, [props.size, display, render, emitZoom]);

    /* ---------- view helpers ---------- */
    const setView = useCallback(
      (v: View) => {
        viewRef.current = clampView(v, displayRef.current);
        emitZoom();
        schedule();
      },
      [emitZoom, schedule],
    );

    const zoomAt = useCallback(
      (factor: number, fx: number, fy: number) => {
        const v = viewRef.current;
        const zoom = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
        const k = zoom / v.zoom;
        setView({
          zoom,
          panX: fx - (fx - v.panX) * k,
          panY: fy - (fy - v.panY) * k,
        });
      },
      [setView],
    );

    useImperativeHandle(
      ref,
      () => ({
        zoomBy: (factor) =>
          zoomAt(factor, displayRef.current / 2, displayRef.current / 2),
        resetView: () => setView({ zoom: 1, panX: 0, panY: 0 }),
      }),
      [zoomAt, setView],
    );

    // Mouse wheel / trackpad zoom (needs a non-passive listener)
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        const factor = Math.exp(-delta * (e.ctrlKey ? 0.01 : 0.002));
        zoomAt(factor, e.clientX - rect.left, e.clientY - rect.top);
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }, [zoomAt]);

    /* ---------- coordinate helpers ---------- */
    const getPoint = (e: ReactPointerEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const pointToCell = (p: Point): Cell => {
      const v = viewRef.current;
      const cellCss = (displayRef.current * v.zoom) / propsRef.current.size;
      return {
        c: Math.floor((p.x - v.panX) / cellCss),
        r: Math.floor((p.y - v.panY) / cellCss),
      };
    };

    const clampCell = (cell: Cell): Cell => {
      const s = propsRef.current.size - 1;
      return { c: clamp(cell.c, 0, s), r: clamp(cell.r, 0, s) };
    };

    /* ---------- strokes ---------- */
    const applyShape = (draft: Pixels, stroke: Stroke, cur: Cell) => {
      const { size, color, brushSize, mirror, shapeFill } = propsRef.current;
      const a = clampCell(stroke.start);
      const b = clampCell(cur);
      if (stroke.tool === "line")
        drawLine(draft, size, a, b, color, brushSize, mirror);
      else if (stroke.tool === "rect")
        drawRect(draft, size, a, b, color, brushSize, mirror, shapeFill);
      else if (stroke.tool === "ellipse")
        drawEllipse(draft, size, a, b, color, brushSize, mirror, shapeFill);
    };

    const beginStroke = (e: ReactPointerEvent) => {
      const p = propsRef.current;
      const offset = p.offsetCursor && e.pointerType === "touch";
      const pt = getPoint(e);
      if (offset) pt.y -= OFFSET_Y;
      const cell = pointToCell(pt);
      const { tool, size, color, brushSize, mirror, fillGlobal, pixels } = p;

      if (tool === "picker") {
        if (inBounds(size, cell.c, cell.r)) {
          const col = pixels[idx(size, cell.c, cell.r)];
          if (col) p.onPickColor(col);
        }
        return;
      }

      if (tool === "fill") {
        if (!inBounds(size, cell.c, cell.r)) return;
        const draft = pixels.slice();
        if (fillGlobal) {
          replaceColor(draft, pixels[idx(size, cell.c, cell.r)], color);
        } else {
          floodFill(draft, size, cell.c, cell.r, color);
          if (mirror === "h" || mirror === "both")
            floodFill(draft, size, size - 1 - cell.c, cell.r, color);
          if (mirror === "v" || mirror === "both")
            floodFill(draft, size, cell.c, size - 1 - cell.r, color);
          if (mirror === "both")
            floodFill(draft, size, size - 1 - cell.c, size - 1 - cell.r, color);
        }
        p.onCommit(draft);
        return;
      }

      const draft = pixels.slice();
      const stroke: Stroke = {
        pointerId: e.pointerId,
        offset,
        tool,
        snapshot: pixels,
        start: cell,
        last: cell,
      };
      strokeRef.current = stroke;

      if (tool === "pencil" || tool === "eraser") {
        plotBrush(
          draft,
          size,
          cell.c,
          cell.r,
          tool === "eraser" ? "" : color,
          brushSize,
          mirror,
        );
      } else if (tool !== "move") {
        applyShape(draft, stroke, cell);
      }
      draftRef.current = draft;
      cursorRef.current = cell;
      schedule();
    };

    const continueStroke = (e: ReactPointerEvent) => {
      const stroke = strokeRef.current;
      if (!stroke) return;
      const pt = getPoint(e);
      if (stroke.offset) pt.y -= OFFSET_Y;
      const cell = pointToCell(pt);
      if (cell.c === stroke.last.c && cell.r === stroke.last.r) return;
      const { size, color, brushSize, mirror } = propsRef.current;

      if (stroke.tool === "pencil" || stroke.tool === "eraser") {
        const draft = draftRef.current ?? stroke.snapshot.slice();
        const pts = bresenham(stroke.last.c, stroke.last.r, cell.c, cell.r);
        const col = stroke.tool === "eraser" ? "" : color;
        for (let i = 1; i < pts.length; i++)
          plotBrush(draft, size, pts[i].c, pts[i].r, col, brushSize, mirror);
        draftRef.current = draft;
      } else if (stroke.tool === "move") {
        draftRef.current = shiftPixels(
          stroke.snapshot,
          size,
          cell.c - stroke.start.c,
          cell.r - stroke.start.r,
          false,
        );
      } else {
        const draft = stroke.snapshot.slice();
        applyShape(draft, stroke, cell);
        draftRef.current = draft;
      }
      stroke.last = cell;
      cursorRef.current = cell;
      schedule();
    };

    const endStroke = (commit: boolean) => {
      const stroke = strokeRef.current;
      if (!stroke) return;
      strokeRef.current = null;
      cursorRef.current = null;
      const draft = draftRef.current;
      draftRef.current = null;
      if (commit && draft) propsRef.current.onCommit(draft);
      schedule();
    };

    /* ---------- gestures ---------- */
    const beginGesture = () => {
      const pts = [...pointersRef.current.values()];
      if (pts.length < 2) return;
      const v = viewRef.current;
      gestureRef.current = {
        startDist: Math.max(1, dist(pts[0], pts[1])),
        startZoom: v.zoom,
        startMid: mid(pts[0], pts[1]),
        startPan: { x: v.panX, y: v.panY },
        startTime: performance.now(),
        moved: false,
      };
    };

    const updateGesture = () => {
      const g = gestureRef.current;
      const pts = [...pointersRef.current.values()];
      if (!g || pts.length < 2) return;
      const d = dist(pts[0], pts[1]);
      const m = mid(pts[0], pts[1]);
      if (
        Math.abs(d - g.startDist) > 10 ||
        Math.hypot(m.x - g.startMid.x, m.y - g.startMid.y) > 10
      )
        g.moved = true;
      const zoom = clamp(g.startZoom * (d / g.startDist), MIN_ZOOM, MAX_ZOOM);
      const k = zoom / g.startZoom;
      setView({
        zoom,
        panX: g.startMid.x - (g.startMid.x - g.startPan.x) * k + (m.x - g.startMid.x),
        panY: g.startMid.y - (g.startMid.y - g.startPan.y) * k + (m.y - g.startMid.y),
      });
    };

    /* ---------- pointer events ---------- */
    const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) {
        if (e.button === 2) {
          const cell = pointToCell(getPoint(e));
          const { size, pixels, onPickColor } = propsRef.current;
          if (inBounds(size, cell.c, cell.r)) {
            const col = pixels[idx(size, cell.c, cell.r)];
            if (col) onPickColor(col);
          }
        }
        return;
      }
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      pointersRef.current.set(e.pointerId, getPoint(e));
      if (pointersRef.current.size === 1) {
        if (suppressRef.current) return;
        beginStroke(e);
      } else if (pointersRef.current.size === 2) {
        endStroke(false);
        suppressRef.current = true;
        beginGesture();
      }
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      const pt = getPoint(e);
      if (pointersRef.current.has(e.pointerId))
        pointersRef.current.set(e.pointerId, pt);
      if (gestureRef.current) {
        if (pointersRef.current.size >= 2) updateGesture();
        return;
      }
      const stroke = strokeRef.current;
      if (stroke) {
        if (stroke.pointerId === e.pointerId) continueStroke(e);
        return;
      }
      if (e.pointerType !== "touch") {
        const cell = pointToCell(pt);
        const cur = cursorRef.current;
        const inside = inBounds(propsRef.current.size, cell.c, cell.r);
        if (!inside) {
          if (cur) {
            cursorRef.current = null;
            schedule();
          }
        } else if (!cur || cur.c !== cell.c || cur.r !== cell.r) {
          cursorRef.current = cell;
          schedule();
        }
      }
    };

    const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
      pointersRef.current.delete(e.pointerId);
      const g = gestureRef.current;
      if (g && pointersRef.current.size < 2) {
        gestureRef.current = null;
        if (!g.moved && performance.now() - g.startTime < 300)
          propsRef.current.onTwoFingerTap?.();
      }
      if (strokeRef.current?.pointerId === e.pointerId) endStroke(true);
      if (pointersRef.current.size === 0) suppressRef.current = false;
      if (e.pointerType === "touch" && cursorRef.current) {
        cursorRef.current = null;
        schedule();
      }
    };

    const onPointerLeave = () => {
      if (!strokeRef.current && cursorRef.current) {
        cursorRef.current = null;
        schedule();
      }
    };

    return (
      <div
        ref={containerRef}
        className="relative h-full w-full touch-none select-none overflow-hidden cursor-crosshair"
        style={{ WebkitTouchCallout: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerLeave}
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm shadow-2xl shadow-black/60"
          style={{ width: display, height: display, imageRendering: "pixelated" }}
        />
      </div>
    );
  },
);
