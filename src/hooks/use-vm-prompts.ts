"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  VMPrompt,
  loadVMPrompts,
  saveVMPrompts,
  createVMPrompt,
  sortVMPrompts,
  SEED_PROMPTS,
} from "@/lib/virtual-met";

// localStorage-backed store for the new Virtual Met flow's prompts, following
// the useSyncExternalStore pattern used elsewhere (SSR-safe, no setState-in-effect).

const STORAGE_KEY = "vm_v2_prompts";
const listeners = new Set<() => void>();
let cache: VMPrompt[] | null = null;

function read(): VMPrompt[] {
  if (cache === null) cache = loadVMPrompts();
  return cache;
}

function write(next: VMPrompt[]) {
  cache = next;
  saveVMPrompts(next);
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = loadVMPrompts();
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useVMPrompts() {
  const prompts = useSyncExternalStore(subscribe, read, () => SEED_PROMPTS);

  const addPrompt = useCallback(
    (title: string, prompt: string, isPinned: boolean) => {
      const created = createVMPrompt(title, prompt, isPinned);
      write([created, ...read()]);
      return created;
    },
    [],
  );

  const editPrompt = useCallback(
    (
      id: string,
      changes: { title?: string; prompt?: string; isPinned?: boolean },
    ) => {
      write(
        read().map((p) =>
          p.id === id
            ? {
                ...p,
                title: changes.title?.trim() ?? p.title,
                prompt: changes.prompt?.trim() ?? p.prompt,
                isPinned: changes.isPinned ?? p.isPinned,
                updatedAt: Date.now(),
              }
            : p,
        ),
      );
    },
    [],
  );

  const deletePrompt = useCallback((id: string) => {
    write(read().filter((p) => p.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    write(
      read().map((p) =>
        p.id === id ? { ...p, isPinned: !p.isPinned, updatedAt: Date.now() } : p,
      ),
    );
  }, []);

  return {
    prompts: sortVMPrompts(prompts),
    addPrompt,
    editPrompt,
    deletePrompt,
    togglePin,
  };
}
