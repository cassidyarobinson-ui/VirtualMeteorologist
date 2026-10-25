// Mock data for the Weather Hub Route & Site widget. Client-only, deterministic
// (seeded) so the 10 synchronized graphs share one stable hourly timeline.
//
// A real implementation would pull this from DTN's thermal/pavement modeling
// service; here everything is generated from plausible curves so the UI — the
// deliverable — is faithful and interactive.

export const TOTAL_HOURS = 72; // hours in the timeline
export const ZERO_HOUR = 24; // index of "now" (so we have 24h past + 48h future)

/** Hours relative to now: -24 .. +47 */
export function hourOffsets(): number[] {
  return Array.from({ length: TOTAL_HOURS }, (_, i) => i - ZERO_HOUR);
}

// --- deterministic pseudo-random so curves are stable across renders ---
function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Local hour-of-day (0–23) for a given offset, assuming "now" = 14:00. */
export function hourOfDay(offset: number): number {
  return ((14 + offset) % 24 + 24) % 24;
}

/** Is a given offset during daylight (roughly 7:00–19:00)? */
export function isDaylight(offset: number): boolean {
  const h = hourOfDay(offset);
  return h >= 7 && h < 19;
}

/**
 * Day/night band segments for background shading. Each segment spans a run of
 * same-daylight hours; graphs render these as ReferenceAreas.
 */
export interface ShadeBand {
  x1: number;
  x2: number;
  day: boolean;
}

export function dayNightBands(): ShadeBand[] {
  const offsets = hourOffsets();
  const bands: ShadeBand[] = [];
  let start = offsets[0];
  let day = isDaylight(start);
  for (let i = 1; i < offsets.length; i++) {
    const d = isDaylight(offsets[i]);
    if (d !== day) {
      bands.push({ x1: start, x2: offsets[i], day });
      start = offsets[i];
      day = d;
    }
  }
  bands.push({ x1: start, x2: offsets[offsets.length - 1], day });
  return bands;
}

// ---------------------------------------------------------------------------
// Row model: one object per hour holding every series (so charts stay synced).
// ---------------------------------------------------------------------------

export type DominantPrecip = "none" | "liquid" | "snow" | "freezing" | "sleet" | "mix";

export interface WeatherHubPoint {
  offset: number; // x key, hours from now
  hourOfDay: number;
  day: boolean;
  forecast: boolean; // offset >= 0

  // Graph 1 — temperatures (°F)
  airTemp: number;
  dewPoint: number;
  windChill: number;
  surfaceTemp: number;
  bridgeSurfaceTemp: number;
  cyclePathTemp: number;

  // Graph 2 — precip probability breakdown (0–100, components sum to total)
  probLiquid: number;
  probSnow: number;
  probFreezing: number;
  probSleet: number;
  probMix: number;
  dominant: DominantPrecip;

  // Graph 3 — precip rate (mm/hr) + running accumulation (mm)
  rateLiquid: number;
  rateSnow: number;
  rateIce: number;
  accLiquid: number;
  accSnow: number;
  accIce: number;

  // Graph 4 — winds
  windSpeed: number; // mph
  windGust: number; // mph
  windDir: number; // degrees

  // Graph 5 — radiation (W/m²)
  shortwave: number;
  longwave: number;

  // Graph 6 — visibility (miles) + blowing snow risk
  visibility: number;
  blowingSnowRisk: "none" | "low" | "high";

  // Graph 7 — frost probability (0–100)
  frostProb: number;

  // Graph 8 — ice & chemical points
  percentIce: number; // 0–100
  freezePoint: number; // °F
  meltPoint: number; // °F

  // Graph 9 — surface depths (mm)
  depthLiquid: number;
  depthSnow: number;
  depthCompactedSnow: number;
  depthFrost: number;
  depthIce: number;
  depthUnbondedIce: number;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function generateSeries(seed = 42): WeatherHubPoint[] {
  const rand = seeded(seed);
  const offsets = hourOffsets();
  let accLiquid = 0;
  let accSnow = 0;
  let accIce = 0;

  return offsets.map((offset) => {
    const hod = hourOfDay(offset);
    const day = isDaylight(offset);
    const forecast = offset >= 0;

    // Diurnal temperature curve: peak ~15:00, trough ~05:00.
    const diurnal = Math.sin(((hod - 9) / 24) * 2 * Math.PI);
    const airTemp = 30 + diurnal * 8 + (rand() - 0.5) * 2; // around freezing
    const dewPoint = airTemp - (4 + rand() * 3);
    const windSpeedBase = 8 + Math.abs(diurnal) * 6 + (rand() - 0.5) * 3;
    const windSpeed = clamp(windSpeedBase, 1, 40);
    const windGust = windSpeed + 4 + rand() * 8;
    const windChill =
      airTemp - clamp((windSpeed - 3) * 0.6, 0, 15); // simple chill
    const surfaceTemp = airTemp + (day ? 3 : -2) + (rand() - 0.5) * 1.5;
    const bridgeSurfaceTemp = surfaceTemp - 2.5; // bridges cool faster
    const cyclePathTemp = surfaceTemp - 1;

    // A frozen-precip event in the near future (offsets ~6–22).
    const inEvent = offset >= 6 && offset <= 22;
    const eventIntensity = inEvent
      ? Math.sin(((offset - 6) / 16) * Math.PI) // 0..1..0
      : 0;

    const totalProb = inEvent ? clamp(20 + eventIntensity * 75, 0, 100) : clamp(rand() * 15, 0, 100);
    // Distribute by temperature: colder -> more snow/ice.
    const cold = airTemp < 30;
    const probSnow = cold ? totalProb * 0.5 : totalProb * 0.15;
    const probFreezing = cold ? totalProb * 0.2 : totalProb * 0.05;
    const probSleet = cold ? totalProb * 0.15 : totalProb * 0.05;
    const probMix = totalProb * 0.1;
    const probLiquid = clamp(totalProb - probSnow - probFreezing - probSleet - probMix, 0, 100);

    const comps: [DominantPrecip, number][] = [
      ["liquid", probLiquid],
      ["snow", probSnow],
      ["freezing", probFreezing],
      ["sleet", probSleet],
      ["mix", probMix],
    ];
    const top = comps.reduce((a, b) => (b[1] > a[1] ? b : a));
    const dominant: DominantPrecip = totalProb < 10 ? "none" : top[0];

    // Rates track the event + dominant type.
    const rateLiquid = forecast && !cold ? eventIntensity * 1.8 * rand() : 0;
    const rateSnow = forecast && cold ? eventIntensity * 2.4 * rand() : 0;
    const rateIce = forecast && cold ? eventIntensity * 0.5 * rand() : 0;
    accLiquid += rateLiquid;
    accSnow += rateSnow;
    accIce += rateIce;

    const windDir = (200 + offset * 4 + (rand() - 0.5) * 30) % 360;

    // Radiation: shortwave only in daylight, peaks midday; longwave always on.
    const solar = day ? clamp(Math.sin(((hod - 7) / 12) * Math.PI), 0, 1) : 0;
    const shortwave = Math.round(solar * 620);
    const longwave = Math.round(260 + diurnal * 40 + rand() * 15);

    const visibility = clamp(
      10 - eventIntensity * 8 - (windSpeed > 20 ? 2 : 0) + (rand() - 0.5),
      0.1,
      10,
    );
    const blowingSnowRisk: WeatherHubPoint["blowingSnowRisk"] =
      cold && windSpeed > 22 && (accSnow > 2 || rateSnow > 0.5)
        ? "high"
        : cold && windSpeed > 16
          ? "low"
          : "none";

    const frostProb = clamp(
      (!day ? 35 : 5) + (surfaceTemp < 33 ? 40 : 0) + (dewPoint > surfaceTemp - 2 ? 20 : 0) + (rand() - 0.5) * 10,
      0,
      100,
    );

    const percentIce = clamp(accIce * 20 + (surfaceTemp < 30 ? eventIntensity * 40 : 0), 0, 100);
    const freezePoint = 32 - clamp(accIce * 3 + eventIntensity * 6, 0, 18); // chemicals depress it
    const meltPoint = freezePoint + 2;

    // Surface depths (mm) accumulate during the event, melt after.
    const melt = offset > 22 ? clamp((offset - 22) * 0.08, 0, 1) : 0;
    const depthLiquid = clamp(accLiquid * (1 - melt) * 0.4, 0, 20);
    const depthSnow = clamp(accSnow * (1 - melt) * 0.8, 0, 40);
    const depthCompactedSnow = clamp(accSnow * (1 - melt) * 0.3, 0, 20);
    const depthFrost = clamp(frostProb / 100 * 0.6, 0, 1);
    const depthIce = clamp(accIce * (1 - melt) * 1.5, 0, 10);
    const depthUnbondedIce = clamp(accIce * (1 - melt) * 0.6, 0, 6);

    return {
      offset,
      hourOfDay: hod,
      day,
      forecast,
      airTemp: round1(airTemp),
      dewPoint: round1(dewPoint),
      windChill: round1(windChill),
      surfaceTemp: round1(surfaceTemp),
      bridgeSurfaceTemp: round1(bridgeSurfaceTemp),
      cyclePathTemp: round1(cyclePathTemp),
      probLiquid: round1(probLiquid),
      probSnow: round1(probSnow),
      probFreezing: round1(probFreezing),
      probSleet: round1(probSleet),
      probMix: round1(probMix),
      dominant,
      rateLiquid: round2(rateLiquid),
      rateSnow: round2(rateSnow),
      rateIce: round2(rateIce),
      accLiquid: round1(accLiquid),
      accSnow: round1(accSnow),
      accIce: round1(accIce),
      windSpeed: round1(windSpeed),
      windGust: round1(windGust),
      windDir: Math.round(windDir),
      shortwave,
      longwave,
      visibility: round1(visibility),
      blowingSnowRisk,
      frostProb: Math.round(frostProb),
      percentIce: Math.round(percentIce),
      freezePoint: round1(freezePoint),
      meltPoint: round1(meltPoint),
      depthLiquid: round2(depthLiquid),
      depthSnow: round2(depthSnow),
      depthCompactedSnow: round2(depthCompactedSnow),
      depthFrost: round2(depthFrost),
      depthIce: round2(depthIce),
      depthUnbondedIce: round2(depthUnbondedIce),
    };
  });
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// Graph 10 — treatment / maintenance recommendation blocks
// ---------------------------------------------------------------------------

export type TreatmentKind = "chemical" | "patrol";

export interface TreatmentBlock {
  id: string;
  kind: TreatmentKind; // chemical = orange, patrol = yellow
  label: string;
  startOffset: number;
  endOffset: number;
  material: string;
  dosage: string;
  plowBlade: string;
}

export const TREATMENT_BLOCKS: TreatmentBlock[] = [
  {
    id: "t1",
    kind: "chemical",
    label: "Chemical Salting / De-icing",
    startOffset: 4,
    endOffset: 10,
    material: "Rock salt (NaCl) + brine pre-wet",
    dosage: "120 lb/lane-mile",
    plowBlade: "Up (spreading only)",
  },
  {
    id: "t2",
    kind: "patrol",
    label: "Patrol & Plow",
    startOffset: 10,
    endOffset: 18,
    material: "—",
    dosage: "—",
    plowBlade: "Down (full plow)",
  },
  {
    id: "t3",
    kind: "chemical",
    label: "Chemical Salting / De-icing",
    startOffset: 18,
    endOffset: 24,
    material: "Magnesium chloride (MgCl₂)",
    dosage: "80 lb/lane-mile",
    plowBlade: "Up (spreading only)",
  },
  {
    id: "t4",
    kind: "patrol",
    label: "Patrol & Plow",
    startOffset: 24,
    endOffset: 30,
    material: "—",
    dosage: "—",
    plowBlade: "Down (full plow)",
  },
];

// ---------------------------------------------------------------------------
// Assets (with thermal-modeling validation flag)
// ---------------------------------------------------------------------------

export interface WeatherHubAsset {
  id: string;
  name: string;
  type: "route" | "site";
  /** Whether backend thermal / pavement modeling has run for this asset. */
  isModeled: boolean;
}

export const ASSETS: WeatherHubAsset[] = [
  { id: "rt-i90", name: "I-90 Corridor — MP 12–48", type: "route", isModeled: true },
  { id: "rt-us2", name: "US-2 Mountain Pass", type: "route", isModeled: true },
  { id: "site-depot", name: "North Depot Yard", type: "site", isModeled: true },
  { id: "rt-sr520", name: "SR-520 Floating Bridge", type: "route", isModeled: false },
  { id: "site-airport", name: "Regional Airport Apron", type: "site", isModeled: false },
];

export function getAsset(id: string): WeatherHubAsset | undefined {
  return ASSETS.find((a) => a.id === id);
}

/** Human label for the visible window, e.g. "−6h → +24h (30h)". */
export function formatOffsetWindow(lo: number, hi: number): string {
  const fmt = (n: number) => (n >= 0 ? `+${n}h` : `−${Math.abs(n)}h`);
  return `${fmt(lo)} → ${fmt(hi)} (${hi - lo}h window)`;
}
