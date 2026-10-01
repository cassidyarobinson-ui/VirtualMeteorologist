"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  SavedPrompt,
  loadPrompts,
  savePrompts,
  createPrompt,
  sortPrompts,
} from "@/lib/prompts";

// External store backed by localStorage. Using useSyncExternalStore gives us
// SSR-safe hydration (a stable server snapshot) without calling setState inside
// an effect, which the project's lint config forbids. All mutations go through
// `write`, which persists and notifies subscribers.

const listeners = new Set<() => void>();
let cache: SavedPrompt[] | null = null;

function read(): SavedPrompt[] {
  if (cache === null) cache = loadPrompts();
  return cache;
}

function write(next: SavedPrompt[]) {
  cache = next;
  savePrompts(next);
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keep in sync if another tab edits the same library.
  const onStorage = (e: StorageEvent) => {
    if (e.key === "vm_saved_prompts") {
      cache = loadPrompts();
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// Stable empty array for the server/first-paint snapshot so markup matches.
const SERVER_SNAPSHOT: SavedPrompt[] = [];

export function usePrompts() {
  const prompts = useSyncExternalStore(
    subscribe,
    read,
    () => SERVER_SNAPSHOT,
  );

  const addPrompt = useCallback((title: string, prompt: string) => {
    const created = createPrompt(title.trim(), prompt.trim());
    write([created, ...read()]);
    return created;
  }, []);

  const editPrompt = useCallback(
    (
      id: string,
      changes: { title?: string; prompt?: string; isFavorite?: boolean },
    ) => {
      write(
        read().map((p) =>
          p.id === id
            ? {
                ...p,
                title: changes.title?.trim() ?? p.title,
                prompt: changes.prompt?.trim() ?? p.prompt,
                isFavorite: changes.isFavorite ?? p.isFavorite,
                updatedAt: Date.now(),
              }
            : p,
        ),
      );
    },
    [],
  );

  const renamePrompt = useCallback((id: string, title: string) => {
    write(
      read().map((p) =>
        p.id === id ? { ...p, title: title.trim(), updatedAt: Date.now() } : p,
      ),
    );
  }, []);

  const deletePrompt = useCallback((id: string) => {
    write(read().filter((p) => p.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    write(
      read().map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p,
      ),
    );
  }, []);

  const markRun = useCallback((id: string) => {
    write(
      read().map((p) =>
        p.id === id
          ? { ...p, lastRunAt: Date.now(), runCount: p.runCount + 1 }
          : p,
      ),
    );
  }, []);

  return {
    prompts: sortPrompts(prompts),
    addPrompt,
    editPrompt,
    renamePrompt,
    deletePrompt,
    toggleFavorite,
    markRun,
  };
}
