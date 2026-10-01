// Simulated 48-hour probabilistic forecast data for Significant Wave Height
export interface ForecastPoint {
  hour: number; // offset from now in hours
  deterministic: number;
  p90: number;
  ensembleMin: number;
  ensembleMax: number;
  alphaLimit: number;
  baseLimit: number;
}

// Generate realistic wave height data (meters)
export function generateForecastData(): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const baseAlpha = 2.5;
  const baseLimit = 2.5;

  for (let h = 0; h <= 48; h += 1) {
    // Sinusoidal wave pattern with some noise
    const phase = (h / 12) * Math.PI;
    const deterministic =
      1.8 + 0.5 * Math.sin(phase) + 0.2 * Math.sin(phase * 2.3) + (Math.random() - 0.5) * 0.1;
    const p90 = deterministic + 0.3 + Math.random() * 0.2;
    const spread = 0.4 + Math.random() * 0.2;
    const ensembleMin = deterministic - spread;
    const ensembleMax = p90 + 0.1 + Math.random() * 0.1;

    // Alpha limit steps (changes at certain hours)
    let alphaLimit = baseAlpha;
    if (h >= 12 && h < 24) alphaLimit = 1.8;
    if (h >= 30 && h < 36) alphaLimit = 1.8;

    points.push({
      hour: h,
      deterministic: Math.round(deterministic * 100) / 100,
      p90: Math.round(p90 * 100) / 100,
      ensembleMin: Math.round(ensembleMin * 100) / 100,
      ensembleMax: Math.round(ensembleMax * 100) / 100,
      alphaLimit: Math.round(alphaLimit * 100) / 100,
      baseLimit,
    });
  }

  return points;
}

export interface WorkabilityWindow {
  start: number;
  end: number;
  duration: number;
}

export function getWorkabilityWindows(data: ForecastPoint[]): WorkabilityWindow[] {
  const windows: WorkabilityWindow[] = [];
  let windowStart: number | null = null;

  for (const point of data) {
    const isWorkable = point.deterministic < point.alphaLimit;
    if (isWorkable && windowStart === null) {
      windowStart = point.hour;
    } else if (!isWorkable && windowStart !== null) {
      windows.push({
        start: windowStart,
        end: point.hour,
        duration: point.hour - windowStart,
      });
      windowStart = null;
    }
  }

  // Close final window if still open
  if (windowStart !== null) {
    const lastHour = data[data.length - 1].hour;
    windows.push({
      start: windowStart,
      end: lastHour,
      duration: lastHour - windowStart,
    });
  }

  return windows;
}

export function getCurrentStatus(data: ForecastPoint[]) {
  const current = data[0];
  const isWorkable = current.deterministic < current.alphaLimit;
  const windows = getWorkabilityWindows(data);
  const totalWorkableHours = windows.reduce((sum, w) => sum + w.duration, 0);

  return {
    isWorkable,
    currentValue: current.deterministic,
    limit: current.alphaLimit,
    totalWorkableHours,
    windows,
  };
}
