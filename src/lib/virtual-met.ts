// Domain model for the new Virtual Met flow. Separate from lib/prompts.ts so
// the original /meteorologist flow is untouched. Client-only mock: localStorage
// persistence + canned responses, static-export friendly.

// ---------------------------------------------------------------------------
// Saved prompts (with pin-at-top)
// ---------------------------------------------------------------------------

export interface VMPrompt {
  id: string;
  title: string;
  prompt: string;
  /** Pinned prompts float to the top of the dropdown ("Pin at top"). */
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

const PROMPTS_KEY = "vm_v2_prompts";

export const SEED_PROMPTS: VMPrompt[] = [
  seed("p1", "Prompt 1", "Please compare the wind gusts, wind speed, and temperature between Obs and Forecast", true),
  seed("p2", "Prompt 2", "Summarize the dashboard into a few sentences", true),
  seed("p3", "Prompt 3", "Show me the next storm window", true),
  seed("p4", "Rain and WBGT", "Summarize the rain and WBGT", false),
  seed("p5", "WBGT", "What is the WBGT right now and for the rest of the day?", false),
  seed("p6", "Wind Gust", "Tell me about the wind gusts today", false),
];

function seed(id: string, title: string, prompt: string, isPinned: boolean): VMPrompt {
  return { id, title, prompt, isPinned, createdAt: 0, updatedAt: 0 };
}

export function loadVMPrompts(): VMPrompt[] {
  if (typeof window === "undefined") return SEED_PROMPTS;
  try {
    const raw = localStorage.getItem(PROMPTS_KEY);
    return raw ? (JSON.parse(raw) as VMPrompt[]) : SEED_PROMPTS;
  } catch {
    return SEED_PROMPTS;
  }
}

export function saveVMPrompts(prompts: VMPrompt[]) {
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
}

export function createVMPrompt(title: string, prompt: string, isPinned: boolean): VMPrompt {
  const now = Date.now();
  return { id: crypto.randomUUID(), title: title.trim(), prompt: prompt.trim(), isPinned, createdAt: now, updatedAt: now };
}

/** Derive a short prompt title from a message body (first clause, capped). */
export function deriveVMTitle(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Untitled prompt";
  const firstClause = trimmed.split(/[?.!\n]/)[0] || trimmed;
  const capped = firstClause.slice(0, 48).trim();
  return capped.length < firstClause.trim().length ? `${capped}…` : capped;
}

/** Pinned first, then most-recently-updated. */
export function sortVMPrompts(prompts: VMPrompt[]): VMPrompt[] {
  return [...prompts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

// ---------------------------------------------------------------------------
// Chat transcript
// ---------------------------------------------------------------------------

export interface VMMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export function createVMMessage(role: VMMessage["role"], content: string): VMMessage {
  return { id: crypto.randomUUID(), role, content, createdAt: Date.now() };
}

export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** A seeded conversation matching the mockup transcript. */
export const SEED_MESSAGES: VMMessage[] = [
  createVMMessage("user", "what's the weather in Dana Point tomorrow"),
  createVMMessage(
    "assistant",
    "Tomorrow looks pretty good for outdoor activities despite the cloud cover. Expect temperatures in the 70s and little chance of rain throughout the day. Rain becomes much more likely around 8–9 PM, so plan evening activities accordingly.",
  ),
  createVMMessage("user", "how likely is a storm this weekend?"),
  createVMMessage(
    "assistant",
    [
      "There's a high likelihood of stormy weather in Dana Point this weekend, particularly Sunday, October 11.",
      "",
      "- **Saturday:** 22% chance of daytime rain, increasing to 60% Saturday night.",
      "- **Sunday:** 91% chance of rain, with periods of potentially heavy showers.",
      "- **Thunderstorms:** Possible, but less certain than rainfall.",
      "- **Coastal conditions:** Elevated risk of dangerous surf, rip currents, and coastal flooding.",
      "",
      "The concern is Tropical Storm Rachel, which is bringing tropical moisture and rough seas to Southern California. The National Weather Service has issued a Coastal Flood Advisory through Tuesday.",
    ].join("\n"),
  ),
];

// ---------------------------------------------------------------------------
// Credits (admin view)
// ---------------------------------------------------------------------------

export interface CreditUser {
  name: string;
  used: number;
  total: number;
  /** Tailwind gradient classes for the mock avatar. */
  avatar: string;
}

export interface UsageHistoryEntry {
  label: string;
  credits: number;
}

export const CREDITS_TOTAL_PER_USER = 2000;

export const CREDIT_USERS: CreditUser[] = [
  { name: "Adam Krueger", used: 1203, total: CREDITS_TOTAL_PER_USER, avatar: "from-amber-300 to-orange-400" },
  { name: "Cassidy Robinson", used: 1093, total: CREDITS_TOTAL_PER_USER, avatar: "from-rose-300 to-pink-400" },
  { name: "Kristy Sharkey", used: 674, total: CREDITS_TOTAL_PER_USER, avatar: "from-violet-300 to-indigo-400" },
  { name: "Stan AF", used: 123, total: CREDITS_TOTAL_PER_USER, avatar: "from-emerald-300 to-teal-400" },
];

export const CREDIT_HISTORY: UsageHistoryEntry[] = [
  { label: "Sep 12 – Oct 11, 2026", credits: 3421 },
  { label: "Aug 12 – Sep 11, 2026", credits: 4625 },
  { label: "Jul 12 – Aug 11, 2026", credits: 1352 },
  { label: "Jun 12 – Jul 11, 2026", credits: 924 },
];

/** The current user's own credit usage shown in the composer meter. */
export const MY_CREDITS = { used: 115, total: 1000 };
