// Domain model + localStorage persistence for the Persona / Gems framework.
//
// This is a client-only faithful mock: there is no server or database here, so
// the "schema" from the ticket is represented as typed records persisted to
// localStorage. The field names map 1:1 to the proposed Postgres tables so a
// real backend could swap in later with minimal surface change:
//
//   Personas / Gems table   -> Persona
//   Prompt Templates table  -> PromptTemplate
//
// Variables ({{location}}, {{timeframe}}, …) are parsed from systemInstructions
// and templateText so the UI can prompt the user to fill them on invocation.

/** Model parameters stored per persona (mocked — not sent anywhere). */
export interface PersonaParameters {
  /** 0–1 creativity. */
  temperature: number;
  /** Model version label, e.g. "dtn-weather-pro". */
  model: string;
  /** Max output tokens. */
  maxTokens: number;
}

/** A saved persona / "Gem": a reusable system-instruction set + parameters. */
export interface Persona {
  id: string;
  /** Owner reference (mocked single-user — kept for schema parity). */
  ownerId: string;
  /** Display name, e.g. "Virtual Meteorologist", "Technical Writer". */
  title: string;
  /** Short description shown in the launcher/manager. */
  description: string;
  /** Base instructions: behavior, output format, tone, constraints, variables. */
  systemInstructions: string;
  /** Default model parameters applied when a chat starts with this persona. */
  defaultParameters: PersonaParameters;
  /** Visibility flags for (mocked) team sharing. */
  isPublic: boolean;
  isShared: boolean;
  /** Featured/default pre-built personas available out of the box. */
  isFeatured: boolean;
  /** The default persona a fresh session starts with. */
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

/** A reusable prompt snippet, optionally scoped to a persona. */
export interface PromptTemplate {
  id: string;
  /** Optional link to a specific persona. */
  personaId?: string;
  /** Name of the snippet, e.g. "7-Day Weather Forecast Brief". */
  title: string;
  /** Text with {{variable}} placeholders. */
  templateText: string;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_PARAMETERS: PersonaParameters = {
  temperature: 0.4,
  model: "dtn-weather-pro",
  maxTokens: 1024,
};

export const MODEL_OPTIONS = [
  "dtn-weather-pro",
  "dtn-weather-lite",
  "dtn-reasoning-xl",
] as const;

// ---------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------

const VARIABLE_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Return the unique variable names used in a text, in first-seen order. */
export function parseVariables(text: string): string[] {
  const seen = new Set<string>();
  for (const m of text.matchAll(VARIABLE_RE)) {
    if (m[1]) seen.add(m[1]);
  }
  return [...seen];
}

/** Replace {{var}} placeholders with provided values (unfilled left as-is). */
export function applyVariables(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(VARIABLE_RE, (full, name: string) => {
    const v = values[name];
    return v != null && v !== "" ? v : full;
  });
}

/** Turn a raw variable name into a friendly label, e.g. "timeframe" -> "Timeframe". */
export function humanizeVariable(name: string): string {
  return name
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ---------------------------------------------------------------------------
// Seeded / featured personas (the Migration Plan)
// ---------------------------------------------------------------------------

/**
 * The Virtual Meteorologist, migrated into a pre-built featured persona so it
 * is available to every user out of the box and is the default on first load.
 * Fixed id/timestamps keep it stable (and idempotent) across seedings.
 */
export const METEOROLOGIST_PERSONA: Persona = {
  id: "persona-virtual-meteorologist",
  ownerId: "system",
  title: "Virtual Meteorologist",
  description:
    "AI-powered weather consultant for forecasts, current conditions, and asset-specific alerts.",
  systemInstructions: [
    "You are the DTN Virtual Meteorologist, an expert weather consultant for operational decision-making.",
    "",
    "Behavior:",
    "- Answer questions about forecasts, current conditions, and alerts for the user's assets and locations.",
    "- Lead with the operational bottom line, then the supporting detail.",
    "- Call out any threat windows explicitly (time range, metric, and threshold crossed).",
    "",
    "Output format:",
    "- Start with a one-line summary (good news / watch item / warning).",
    "- Follow with a short 'Key watch period' when a threat exists: day, time range, metric, values.",
    "- Use plain units the operator expects (km/h or mph per locale).",
    "",
    "Tone: professional, concise, reassuring but precise. Never overstate certainty.",
    "",
    "Dynamic variables you may receive: {{location}}, {{asset}}, {{timeframe}}, {{units}}.",
  ].join("\n"),
  defaultParameters: { temperature: 0.3, model: "dtn-weather-pro", maxTokens: 1024 },
  isPublic: true,
  isShared: true,
  isFeatured: true,
  isDefault: true,
  createdAt: 0,
  updatedAt: 0,
};

/** Additional pre-built personas to show the framework is reusable. */
export const FEATURED_PERSONAS: Persona[] = [
  METEOROLOGIST_PERSONA,
  {
    id: "persona-aviation-brief",
    ownerId: "system",
    title: "Aviation Weather Briefer",
    description:
      "Flight-planning weather briefings: ceilings, visibility, winds aloft, and hazards.",
    systemInstructions: [
      "You are an aviation weather briefer. Produce concise pre-flight weather briefings.",
      "Cover: ceilings & visibility, surface and winds aloft, precipitation, icing, turbulence, and any SIGMET/AIRMET-style hazards.",
      "Format as a structured briefing with clear section headers. Flag go/no-go considerations.",
      "Variables: {{departure}}, {{destination}}, {{altitude}}, {{timeframe}}.",
    ].join("\n"),
    defaultParameters: { temperature: 0.2, model: "dtn-weather-pro", maxTokens: 1200 },
    isPublic: true,
    isShared: true,
    isFeatured: true,
    isDefault: false,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: "persona-field-ops",
    ownerId: "system",
    title: "Field Operations Advisor",
    description:
      "Plain-language go/no-go guidance for outdoor crews based on the weather window.",
    systemInstructions: [
      "You are a field operations advisor. Translate the weather into clear crew guidance.",
      "Always give a go / caution / no-go call first, then the reasoning and the safe working window.",
      "Keep it short enough to read on a phone in the field.",
      "Variables: {{crew}}, {{site}}, {{activity}}, {{timeframe}}.",
    ].join("\n"),
    defaultParameters: { temperature: 0.4, model: "dtn-weather-lite", maxTokens: 800 },
    isPublic: true,
    isShared: false,
    isFeatured: true,
    isDefault: false,
    createdAt: 0,
    updatedAt: 0,
  },
];

/** Pre-built prompt templates (snippets) linked to the Meteorologist. */
export const FEATURED_TEMPLATES: PromptTemplate[] = [
  {
    id: "template-7day-brief",
    personaId: "persona-virtual-meteorologist",
    title: "7-Day Weather Forecast Brief",
    templateText:
      "Give me a 7-day forecast brief for {{location}} in {{units}}, highlighting any days with operational risk.",
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: "template-threat-scan",
    personaId: "persona-virtual-meteorologist",
    title: "Asset Threat Scan",
    templateText:
      "Scan {{asset}} for weather threats over the next {{timeframe}} and list each threat window.",
    createdAt: 0,
    updatedAt: 0,
  },
];

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const PERSONA_KEY = "vm_personas";
const TEMPLATE_KEY = "vm_prompt_templates";

export function loadPersonas(): Persona[] {
  if (typeof window === "undefined") return seedPersonas([]);
  try {
    const data = localStorage.getItem(PERSONA_KEY);
    const stored = data ? (JSON.parse(data) as Persona[]) : [];
    return seedPersonas(stored);
  } catch {
    return seedPersonas([]);
  }
}

export function savePersonas(personas: Persona[]) {
  // Persist only non-seed personas plus any user edits to seeds; simplest is to
  // store everything and re-merge seeds on load (seeds win on identity).
  localStorage.setItem(PERSONA_KEY, JSON.stringify(personas));
}

export function loadTemplates(): PromptTemplate[] {
  if (typeof window === "undefined") return seedTemplates([]);
  try {
    const data = localStorage.getItem(TEMPLATE_KEY);
    const stored = data ? (JSON.parse(data) as PromptTemplate[]) : [];
    return seedTemplates(stored);
  } catch {
    return seedTemplates([]);
  }
}

export function saveTemplates(templates: PromptTemplate[]) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
}

/** Ensure featured personas exist; stored copies (user edits) take precedence. */
function seedPersonas(stored: Persona[]): Persona[] {
  const byId = new Map(stored.map((p) => [p.id, p]));
  const result = [...stored];
  for (const seed of FEATURED_PERSONAS) {
    if (!byId.has(seed.id)) result.push(seed);
  }
  return result;
}

function seedTemplates(stored: PromptTemplate[]): PromptTemplate[] {
  const byId = new Map(stored.map((t) => [t.id, t]));
  const result = [...stored];
  for (const seed of FEATURED_TEMPLATES) {
    if (!byId.has(seed.id)) result.push(seed);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

export function createPersona(input: {
  title: string;
  description?: string;
  systemInstructions: string;
  defaultParameters?: Partial<PersonaParameters>;
  isPublic?: boolean;
  isShared?: boolean;
}): Persona {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    ownerId: "me",
    title: input.title.trim(),
    description: (input.description ?? "").trim(),
    systemInstructions: input.systemInstructions.trim(),
    defaultParameters: { ...DEFAULT_PARAMETERS, ...input.defaultParameters },
    isPublic: input.isPublic ?? false,
    isShared: input.isShared ?? false,
    isFeatured: false,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicatePersona(p: Persona): Persona {
  const now = Date.now();
  return {
    ...p,
    id: crypto.randomUUID(),
    ownerId: "me",
    title: `${p.title} (Copy)`,
    isFeatured: false,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function createTemplate(input: {
  title: string;
  templateText: string;
  personaId?: string;
}): PromptTemplate {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    personaId: input.personaId,
    title: input.title.trim(),
    templateText: input.templateText.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

/** Featured first, then default, then most-recently-updated. */
export function sortPersonas(personas: Persona[]): Persona[] {
  return [...personas].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export function getDefaultPersona(personas: Persona[]): Persona | undefined {
  return personas.find((p) => p.isDefault) ?? personas[0];
}
