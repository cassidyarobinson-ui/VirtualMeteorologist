// Mock data for the Offshore Workability Widget mockups
// Simulates a 48-hour rolling forecast with multiple parameters

export type WorkabilityStatus = "workable" | "caution" | "non-workable" | "unknown";

export interface TimeSlot {
  hour: number;
  timestamp: string;
  status: WorkabilityStatus;
  p90: number;
  mean: number;
}

export interface ParameterData {
  id: string;
  name: string;
  unit: string;
  alphaLimit: number;
  cautionMarginPercent: number;
  slots: TimeSlot[];
}

export interface MasterSlot {
  hour: number;
  timestamp: string;
  status: WorkabilityStatus;
}

function generateTimestamp(hourOffset: number): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + hourOffset);
  return now.toISOString();
}

function computeStatus(p90: number, alphaLimit: number, cautionMargin: number): WorkabilityStatus {
  const cautionThreshold = alphaLimit * (1 - cautionMargin / 100);
  if (p90 >= alphaLimit) return "non-workable";
  if (p90 >= cautionThreshold) return "caution";
  return "workable";
}

export function generateWaveHeightData(): ParameterData {
  const alphaLimit = 2.5;
  const cautionMarginPercent = 10;
  const slots: TimeSlot[] = [];

  for (let h = 0; h <= 47; h++) {
    const phase = (h / 12) * Math.PI;
    const mean = 1.6 + 0.6 * Math.sin(phase) + 0.15 * Math.sin(phase * 2.1);
    const p90 = mean + 0.35 + 0.1 * Math.sin(phase * 0.7);
    const status = computeStatus(p90, alphaLimit, cautionMarginPercent);

    slots.push({
      hour: h,
      timestamp: generateTimestamp(h),
      status,
      p90: Math.round(p90 * 100) / 100,
      mean: Math.round(mean * 100) / 100,
    });
  }

  return { id: "wave-height", name: "Wave Height", unit: "m", alphaLimit, cautionMarginPercent, slots };
}

export function generateWindSpeedData(): ParameterData {
  const alphaLimit = 25;
  const cautionMarginPercent = 12;
  const slots: TimeSlot[] = [];

  for (let h = 0; h <= 47; h++) {
    const phase = (h / 10) * Math.PI;
    const mean = 15 + 8 * Math.sin(phase + 1) + 3 * Math.sin(phase * 1.8);
    const p90 = mean + 4 + 1.5 * Math.sin(phase * 0.5);
    const status = computeStatus(p90, alphaLimit, cautionMarginPercent);

    slots.push({
      hour: h,
      timestamp: generateTimestamp(h),
      status,
      p90: Math.round(p90 * 10) / 10,
      mean: Math.round(mean * 10) / 10,
    });
  }

  return { id: "wind-speed", name: "Wind Speed", unit: "kn", alphaLimit, cautionMarginPercent, slots };
}

export function generateWBGTData(): ParameterData {
  const alphaLimit = 28;
  const cautionMarginPercent = 8;
  const slots: TimeSlot[] = [];

  for (let h = 0; h <= 47; h++) {
    // WBGT follows a diurnal pattern
    const diurnal = Math.sin(((h % 24) - 6) / 24 * Math.PI * 2);
    const mean = 24 + 4 * Math.max(0, diurnal) + 0.5 * Math.sin(h * 0.3);
    const p90 = mean + 2 + 0.5 * Math.max(0, diurnal);
    const status = computeStatus(p90, alphaLimit, cautionMarginPercent);

    slots.push({
      hour: h,
      timestamp: generateTimestamp(h),
      status,
      p90: Math.round(p90 * 10) / 10,
      mean: Math.round(mean * 10) / 10,
    });
  }

  return { id: "wbgt", name: "WBGT", unit: "°C", alphaLimit, cautionMarginPercent, slots };
}

export function computeMasterTimeline(parameters: ParameterData[]): MasterSlot[] {
  const slotCount = parameters[0]?.slots.length ?? 0;
  const master: MasterSlot[] = [];

  for (let i = 0; i < slotCount; i++) {
    const statuses = parameters.map((p) => p.slots[i]?.status ?? "unknown");
    let worstStatus: WorkabilityStatus = "workable";
    for (const s of statuses) {
      if (s === "non-workable") { worstStatus = "non-workable"; break; }
      if (s === "caution") worstStatus = "caution";
      if (s === "unknown" && worstStatus === "workable") worstStatus = "unknown";
    }

    master.push({
      hour: parameters[0]?.slots[i]?.hour ?? i,
      timestamp: parameters[0]?.slots[i]?.timestamp ?? generateTimestamp(i),
      status: worstStatus,
    });
  }

  return master;
}

export function generateAllMockData() {
  const waveHeight = generateWaveHeightData();
  const windSpeed = generateWindSpeedData();
  const wbgt = generateWBGTData();
  const parameters = [waveHeight, windSpeed, wbgt];
  const masterTimeline = computeMasterTimeline(parameters);

  return { parameters, masterTimeline };
}
