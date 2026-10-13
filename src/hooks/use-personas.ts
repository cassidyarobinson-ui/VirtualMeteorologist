"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  Persona,
  PromptTemplate,
  PersonaParameters,
  loadPersonas,
  savePersonas,
  loadTemplates,
  saveTemplates,
  createPersona,
  duplicatePersona as duplicatePersonaRecord,
  createTemplate,
  sortPersonas,
  FEATURED_PERSONAS,
  FEATURED_TEMPLATES,
} from "@/lib/personas";

// External stores backed by localStorage, mirroring use-prompts.ts. Two stores
// (personas + templates) share the subscribe/notify machinery. useSyncExternalStore
// keeps hydration SSR-safe without setState-in-effect (forbidden by lint config).

const PERSONA_STORAGE_KEY = "vm_personas";
const TEMPLATE_STORAGE_KEY = "vm_prompt_templates";

const listeners = new Set<() => void>();

let personaCache: Persona[] | null = null;
let templateCache: PromptTemplate[] | null = null;

function readPersonas(): Persona[] {
  if (personaCache === null) personaCache = loadPersonas();
  return personaCache;
}

function readTemplates(): PromptTemplate[] {
  if (templateCache === null) templateCache = loadTemplates();
  return templateCache;
}

function writePersonas(next: Persona[]) {
  personaCache = next;
  savePersonas(next);
  for (const l of listeners) l();
}

function writeTemplates(next: PromptTemplate[]) {
  templateCache = next;
  saveTemplates(next);
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PERSONA_STORAGE_KEY) {
      personaCache = loadPersonas();
      onChange();
    } else if (e.key === TEMPLATE_STORAGE_KEY) {
      templateCache = loadTemplates();
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// Stable server/first-paint snapshots that match the seeded defaults so markup
// is consistent before hydration.
const SERVER_PERSONAS: Persona[] = FEATURED_PERSONAS;
const SERVER_TEMPLATES: PromptTemplate[] = FEATURED_TEMPLATES;

export function usePersonas() {
  const personas = useSyncExternalStore(
    subscribe,
    readPersonas,
    () => SERVER_PERSONAS,
  );
  const templates = useSyncExternalStore(
    subscribe,
    readTemplates,
    () => SERVER_TEMPLATES,
  );

  const addPersona = useCallback(
    (input: {
      title: string;
      description?: string;
      systemInstructions: string;
      defaultParameters?: Partial<PersonaParameters>;
      isPublic?: boolean;
      isShared?: boolean;
    }) => {
      const created = createPersona(input);
      writePersonas([created, ...readPersonas()]);
      return created;
    },
    [],
  );

  const editPersona = useCallback(
    (
      id: string,
      changes: Partial<
        Pick<
          Persona,
          | "title"
          | "description"
          | "systemInstructions"
          | "defaultParameters"
          | "isPublic"
          | "isShared"
        >
      >,
    ) => {
      writePersonas(
        readPersonas().map((p) =>
          p.id === id
            ? {
                ...p,
                ...changes,
                title: changes.title?.trim() ?? p.title,
                description: changes.description?.trim() ?? p.description,
                systemInstructions:
                  changes.systemInstructions?.trim() ?? p.systemInstructions,
                updatedAt: Date.now(),
              }
            : p,
        ),
      );
    },
    [],
  );

  const deletePersona = useCallback((id: string) => {
    writePersonas(readPersonas().filter((p) => p.id !== id));
    // Orphaned templates lose their persona link (kept, just unscoped).
    writeTemplates(
      readTemplates().map((t) =>
        t.personaId === id ? { ...t, personaId: undefined } : t,
      ),
    );
  }, []);

  const duplicatePersona = useCallback((id: string) => {
    const source = readPersonas().find((p) => p.id === id);
    if (!source) return undefined;
    const copy = duplicatePersonaRecord(source);
    writePersonas([copy, ...readPersonas()]);
    return copy;
  }, []);

  const addTemplate = useCallback(
    (input: { title: string; templateText: string; personaId?: string }) => {
      const created = createTemplate(input);
      writeTemplates([created, ...readTemplates()]);
      return created;
    },
    [],
  );

  const editTemplate = useCallback(
    (
      id: string,
      changes: Partial<Pick<PromptTemplate, "title" | "templateText" | "personaId">>,
    ) => {
      writeTemplates(
        readTemplates().map((t) =>
          t.id === id
            ? {
                ...t,
                ...changes,
                title: changes.title?.trim() ?? t.title,
                templateText: changes.templateText?.trim() ?? t.templateText,
                updatedAt: Date.now(),
              }
            : t,
        ),
      );
    },
    [],
  );

  const deleteTemplate = useCallback((id: string) => {
    writeTemplates(readTemplates().filter((t) => t.id !== id));
  }, []);

  return {
    personas: sortPersonas(personas),
    templates,
    addPersona,
    editPersona,
    deletePersona,
    duplicatePersona,
    addTemplate,
    editTemplate,
    deleteTemplate,
  };
}
