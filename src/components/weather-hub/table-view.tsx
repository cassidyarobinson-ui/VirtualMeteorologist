"use client";

import { WeatherHubPoint } from "@/lib/weather-hub";
import { formatOffsetTick } from "./chart-primitives";

interface TableViewProps {
  data: WeatherHubPoint[];
  domain: [number, number];
  isModeled: boolean;
}

interface Column {
  key: keyof WeatherHubPoint;
  label: string;
  unit?: string;
  /** Requires thermal model (hidden/placeholder when asset unmodeled). */
  modeled?: boolean;
}

// The synchronized series as columns. Mirrors the graphs; depth columns are
// flagged `modeled` so they show "—" when the asset has no thermal output.
const COLUMNS: Column[] = [
  { key: "airTemp", label: "Air", unit: "°F" },
  { key: "surfaceTemp", label: "Surface", unit: "°F" },
  { key: "bridgeSurfaceTemp", label: "Bridge", unit: "°F" },
  { key: "dewPoint", label: "Dew Pt", unit: "°F" },
  { key: "windSpeed", label: "Wind", unit: "mph" },
  { key: "windGust", label: "Gust", unit: "mph" },
  { key: "shortwave", label: "SW Rad", unit: "W/m²" },
  { key: "visibility", label: "Vis", unit: "mi" },
  { key: "frostProb", label: "Frost", unit: "%" },
  { key: "percentIce", label: "Ice", unit: "%" },
  { key: "freezePoint", label: "Freeze Pt", unit: "°F" },
  { key: "depthSnow", label: "Snow Depth", unit: "mm", modeled: true },
  { key: "depthIce", label: "Ice Depth", unit: "mm", modeled: true },
];

export function TableView({ data, domain, isModeled }: TableViewProps) {
  const rows = data.filter((d) => d.offset >= domain[0] && d.offset <= domain[1]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              <th className="sticky left-0 z-20 bg-muted px-2 py-2 text-left font-semibold text-foreground">
                Time
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className="whitespace-nowrap px-2 py-2 text-right font-semibold text-foreground"
                >
                  {c.label}
                  {c.unit && (
                    <span className="ml-0.5 font-normal text-muted-foreground">
                      {c.unit}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isNow = r.offset === 0;
              return (
                <tr
                  key={r.offset}
                  className={`border-t border-border ${
                    isNow ? "bg-primary/5" : r.day ? "" : "bg-muted/30"
                  }`}
                >
                  <td
                    className={`sticky left-0 z-10 whitespace-nowrap px-2 py-1.5 font-medium ${
                      isNow ? "bg-primary/10 text-primary" : "bg-card text-foreground"
                    }`}
                  >
                    {formatOffsetTick(r.offset)}
                    <span className="ml-1 font-normal text-muted-foreground">
                      ({r.offset >= 0 ? `+${r.offset}` : r.offset}h)
                    </span>
                    {isNow && <span className="ml-1 text-[10px]">● now</span>}
                  </td>
                  {COLUMNS.map((c) => {
                    const guarded = c.modeled && !isModeled;
                    const val = r[c.key];
                    return (
                      <td
                        key={c.key}
                        className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums text-foreground"
                      >
                        {guarded ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!isModeled && (
        <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          Depth and pavement columns show “—” because this asset has no thermal
          model output.
        </p>
      )}
    </div>
  );
}
