// Domain model + localStorage persistence for the Virtual Meteorologist
// "Saved Prompt Library". Mirrors the lib/messages.ts pattern: plain data
// types, pure load/save helpers, and a createX factory using crypto.randomUUID().

export interface SavedPrompt {
  id: string;
  /** Short human label shown as the row heading, e.g. "NYC Rain Check". */
  title: string;
  /** The full natural-language question sent to the meteorologist. */
  prompt: string;
  createdAt: number;
  updatedAt: number;
  /** Timestamp of the most recent run; undefined until first run. */
  lastRunAt?: number;
  /** Number of times this prompt has been run. */
  runCount: number;
  /** Starred prompts float to the top of the Saved Prompts list. */
  isFavorite: boolean;
}

/**
 * Built-in weather questions shown under "TRY ASKING". Mirrors the two groups
 * in the DTN panel: asset-scoped prompts and free-form location prompts.
 */
export const SUGGESTED_ASSET_PROMPTS = [
  "Are there any weather threats to my assets over the next 48 hours?",
  "Is there any lightning near any of my assets?",
  "Are there any active alerts for my assets?",
];

export const SUGGESTED_LOCATION_PROMPTS = [
  "Will there be any rain today in New York, NY?",
  "Can I get a 7-day forecast for San Francisco, CA?",
  "When will the next high winds over 30 mph occur in Chicago, IL?",
];

const STORAGE_KEY = "vm_saved_prompts";

export function loadPrompts(): SavedPrompt[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as SavedPrompt[]) : [];
  } catch {
    return [];
  }
}

export function savePrompts(prompts: SavedPrompt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export function createPrompt(title: string, prompt: string): SavedPrompt {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    prompt,
    createdAt: now,
    updatedAt: now,
    runCount: 0,
    isFavorite: false,
  };
}

/** Favorites first, then most-recently-updated. */
export function sortPrompts(prompts: SavedPrompt[]): SavedPrompt[] {
  return [...prompts].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

/** A single chat message in the Virtual Meteorologist transcript. */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  /** For assistant messages this may contain simple markdown-ish text. */
  content: string;
  createdAt: number;
}

export function createMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
  };
}

/** Format a chat timestamp like the DTN bubble meta ("12:26:13 pm"). */
export function formatMessageTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/**
 * Derive a sensible default title from a prompt body so users can save with
 * one click. Trims to the first sentence/clause and caps the length.
 */
export function deriveTitle(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Untitled prompt";
  const firstClause = trimmed.split(/[?.!\n]/)[0] || trimmed;
  const capped = firstClause.slice(0, 48).trim();
  return capped.length < firstClause.trim().length ? `${capped}…` : capped;
}

/** Relative "time ago" string for list metadata (eco list-metadata role). */
export function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
