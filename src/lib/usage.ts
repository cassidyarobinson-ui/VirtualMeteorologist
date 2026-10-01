// Mock usage data for the Virtual Meteorologist usage screen.
// Mirrors WIPM-24934 (usage limit visibility): credits used vs. covered,
// time to reset, and upgrade guidance. Values are static mocks — a real
// implementation would fetch these from the billing/usage service.

export interface UsageData {
  /** Credits consumed so far in the current period. */
  creditsUsed: number;
  /** Total credits covered by the plan for the period. */
  creditsTotal: number;
  /** When the current period resets (epoch ms). */
  resetAt: number;
  /** Plan label shown as a badge, e.g. "Weather Hub Pro". */
  planName: string;
}

/** Static mock. Reset is ~1 day 12 hours out to match the screenshot copy. */
export function getUsage(): UsageData {
  return {
    creditsUsed: 182.5,
    creditsTotal: 1000,
    resetAt: Date.now() + (36 * 60 + 0) * 60 * 1000, // ~1d 12h
    planName: "Weather Hub Pro",
  };
}

/** Percentage of the plan remaining (0–100), rounded. */
export function percentRemaining(u: UsageData): number {
  if (u.creditsTotal <= 0) return 0;
  const remaining = Math.max(0, u.creditsTotal - u.creditsUsed);
  return Math.round((remaining / u.creditsTotal) * 100);
}

/** Percentage of the plan used (0–100). */
export function percentUsed(u: UsageData): number {
  return 100 - percentRemaining(u);
}

/** Human "time to reset" like "1 day, 12 hours". */
export function formatTimeToReset(resetAt: number): string {
  const diff = Math.max(0, resetAt - Date.now());
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (days === 0 && hours === 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }
  return parts.join(", ");
}
