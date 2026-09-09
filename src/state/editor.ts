import type { Pixels, Sprite } from "@/types";
import { createPixels, pixelsEqual, resizePixels } from "@/lib/pixels";
import { loadData, uid } from "@/lib/storage";
import { SAMPLE_HEART, SAMPLE_SLIME } from "@/lib/sample";

interface Snapshot {
  size: number;
  pixels: Pixels;
}

export interface EditorState {
  sprites: Sprite[];
  currentId: string;
  past: Snapshot[];
  future: Snapshot[];
}

export type EditorAction =
  | { type: "commit"; pixels: Pixels }
  | { type: "resize"; size: number }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "select"; id: string }
  | { type: "create"; size: number }
  | { type: "duplicate"; id: string }
  | { type: "remove"; id: string }
  | { type: "rename"; id: string; name: string }
  | { type: "import"; size: number; pixels: Pixels; name: string };

const HISTORY_LIMIT = 100;

function makeSprite(size: number, name: string, pixels?: Pixels): Sprite {
  const now = Date.now();
  return {
    id: uid(),
    name,
    size,
    pixels: pixels ?? createPixels(size),
    createdAt: now,
    updatedAt: now,
  };
}

export function currentSprite(state: EditorState): Sprite {
  return (
    state.sprites.find((s) => s.id === state.currentId) ?? state.sprites[0]
  );
}

function nextUntitledName(sprites: Sprite[]) {
  const used = new Set(sprites.map((s) => s.name));
  let n = 1;
  while (used.has(`Sprite ${n}`)) n++;
  return `Sprite ${n}`;
}

function updateCurrent(
  state: EditorState,
  snap: Snapshot,
  past: Snapshot[],
  future: Snapshot[],
): EditorState {
  const now = Date.now();
  return {
    ...state,
    past,
    future,
    sprites: state.sprites.map((s) =>
      s.id === state.currentId
        ? { ...s, size: snap.size, pixels: snap.pixels, updatedAt: now }
        : s,
    ),
  };
}

export function editorReducer(
  state: EditorState,
  action: EditorAction,
): EditorState {
  switch (action.type) {
    case "commit": {
      const cur = currentSprite(state);
      if (
        action.pixels.length !== cur.pixels.length ||
        pixelsEqual(cur.pixels, action.pixels)
      )
        return state;
      const past = [...state.past, { size: cur.size, pixels: cur.pixels }];
      if (past.length > HISTORY_LIMIT) past.shift();
      return updateCurrent(
        state,
        { size: cur.size, pixels: action.pixels },
        past,
        [],
      );
    }
    case "resize": {
      const cur = currentSprite(state);
      if (cur.size === action.size) return state;
      const past = [...state.past, { size: cur.size, pixels: cur.pixels }];
      if (past.length > HISTORY_LIMIT) past.shift();
      return updateCurrent(
        state,
        {
          size: action.size,
          pixels: resizePixels(cur.pixels, cur.size, action.size),
        },
        past,
        [],
      );
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const cur = currentSprite(state);
      const prev = state.past[state.past.length - 1];
      return updateCurrent(state, prev, state.past.slice(0, -1), [
        { size: cur.size, pixels: cur.pixels },
        ...state.future,
      ]);
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const cur = currentSprite(state);
      const next = state.future[0];
      return updateCurrent(
        state,
        next,
        [...state.past, { size: cur.size, pixels: cur.pixels }],
        state.future.slice(1),
      );
    }
    case "select": {
      if (action.id === state.currentId) return state;
      if (!state.sprites.some((s) => s.id === action.id)) return state;
      return { ...state, currentId: action.id, past: [], future: [] };
    }
    case "create": {
      const sprite = makeSprite(action.size, nextUntitledName(state.sprites));
      return {
        sprites: [sprite, ...state.sprites],
        currentId: sprite.id,
        past: [],
        future: [],
      };
    }
    case "duplicate": {
      const src = state.sprites.find((s) => s.id === action.id);
      if (!src) return state;
      const copy = makeSprite(src.size, `${src.name} copy`, src.pixels.slice());
      const i = state.sprites.findIndex((s) => s.id === action.id);
      const sprites = [...state.sprites];
      sprites.splice(i + 1, 0, copy);
      return { sprites, currentId: copy.id, past: [], future: [] };
    }
    case "remove": {
      let sprites = state.sprites.filter((s) => s.id !== action.id);
      if (sprites.length === 0) sprites = [makeSprite(16, "Sprite 1")];
      const currentId =
        action.id === state.currentId
          ? sprites[
              Math.min(
                state.sprites.findIndex((s) => s.id === action.id),
                sprites.length - 1,
              )
            ].id
          : state.currentId;
      const changedCurrent = currentId !== state.currentId;
      return {
        sprites,
        currentId,
        past: changedCurrent ? [] : state.past,
        future: changedCurrent ? [] : state.future,
      };
    }
    case "rename": {
      const name = action.name.trim().slice(0, 40);
      if (!name) return state;
      return {
        ...state,
        sprites: state.sprites.map((s) =>
          s.id === action.id ? { ...s, name } : s,
        ),
      };
    }
    case "import": {
      const sprite = makeSprite(action.size, action.name, action.pixels);
      return {
        sprites: [sprite, ...state.sprites],
        currentId: sprite.id,
        past: [],
        future: [],
      };
    }
    default:
      return state;
  }
}

export function initialEditorState(): EditorState {
  const saved = loadData();
  if (saved) return { ...saved, past: [], future: [] };
  const slime = makeSprite(16, "Slime", SAMPLE_SLIME);
  const heart = makeSprite(16, "Heart", SAMPLE_HEART);
  const blank = makeSprite(24, "Sprite 1");
  return {
    sprites: [slime, heart, blank],
    currentId: slime.id,
    past: [],
    future: [],
  };
}
