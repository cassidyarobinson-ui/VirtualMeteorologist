"use client";

import { ReactNode } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { WeatherHubPoint, ShadeBand, hourOfDay } from "@/lib/weather-hub";
import { Checkbox } from "@/components/ui/checkbox";

// Shared building blocks so all 10 graphs stay visually + behaviorally synced:
// same x-domain window, same day/night shading, same zero-hour marker.

export interface LayerToggle {
  key: string;
  label: string;
  color: string;
  enabled: boolean;
}

/** Format an hour offset as a clock-ish axis label, e.g. "14:00" / "+6h". */
export function formatOffsetTick(offset: number): string {
  const h = hourOfDay(offset);
  return `${String(h).padStart(2, "0")}:00`;
}

/** Card frame + title + optional layer toggle checkboxes shared by every graph. */
export function GraphCard({
  title,
  subtitle,
  index,
  toggles,
  onToggle,
  disabled,
  disabledNote,
  children,
  extraControls,
}: {
  title: string;
  subtitle?: string;
  index: number;
  toggles?: LayerToggle[];
  onToggle?: (key: string) => void;
  disabled?: boolean;
  disabledNote?: string;
  children: ReactNode;
  extraControls?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-baseline gap-2">
          <span className="flex size-5 items-center justify-center rounded bg-muted text-[11px] font-semibold text-muted-foreground">
            {index}
          </span>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
        {extraControls}
      </div>

      {disabled ? (
        <div className="flex h-[200px] items-center justify-center px-6 text-center">
          <p className="text-sm text-muted-foreground">
            {disabledNote ??
              "Unavailable — this asset has no thermal model output."}
          </p>
        </div>
      ) : (
        <>
          {toggles && toggles.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-3 py-2">
              {toggles.map((t) => (
                <label
                  key={t.key}
                  className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
                >
                  <Checkbox
                    checked={t.enabled}
                    onCheckedChange={() => onToggle?.(t.key)}
                    aria-label={t.label}
                  />
                  <span
                    className="inline-block size-2.5 rounded-sm"
                    style={{ backgroundColor: t.color }}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          )}
          <div className="px-1 pb-2 pt-1">{children}</div>
        </>
      )}
    </section>
  );
}

/** Day/night shading — one ReferenceArea per band. Night = subtle dark fill. */
export function ShadingAreas({ bands }: { bands: ShadeBand[] }) {
  return (
    <>
      {bands.map((b, i) => (
        <ReferenceArea
          key={i}
          x1={b.x1}
          x2={b.x2}
          fill={b.day ? "#fbbf24" : "#1e293b"}
          fillOpacity={b.day ? 0.05 : 0.08}
          ifOverflow="extendDomain"
        />
      ))}
    </>
  );
}

/** The locked vertical "now" marker at offset 0, shared across all graphs. */
export function ZeroHourMarker() {
  return (
    <ReferenceLine
      x={0}
      stroke="#007bd9"
      strokeWidth={1.5}
      strokeDasharray="4 3"
      label={{ value: "Now", position: "top", fill: "#007bd9", fontSize: 10 }}
      ifOverflow="extendDomain"
    />
  );
}

/**
 * A synced chart body. Callers supply the series elements (Lines/Areas/Bars)
 * as children; this wraps them with the shared grid, axes, shading, and
 * zero-hour marker, all constrained to the shared x-domain window.
 */
export function SyncedChart({
  data,
  bands,
  domain,
  yDomain,
  yLabel,
  height = 200,
  tooltip,
  children,
}: {
  data: WeatherHubPoint[];
  bands: ShadeBand[];
  domain: [number, number];
  yDomain?: [number, number] | ["auto", "auto"];
  yLabel?: string;
  height?: number;
  tooltip?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <ShadingAreas bands={bands} />
          <XAxis
            dataKey="offset"
            type="number"
            domain={domain}
            allowDataOverflow
            ticks={xTicks(domain)}
            tickFormatter={formatOffsetTick}
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            domain={yDomain ?? ["auto", "auto"]}
            width={40}
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={{ stroke: "var(--color-border)" }}
            label={
              yLabel
                ? {
                    value: yLabel,
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: "var(--color-muted-foreground)" },
                  }
                : undefined
            }
          />
          <ZeroHourMarker />
          {children}
          {tooltip ?? <Tooltip />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Evenly spaced integer ticks across the visible window (~every 6h). */
function xTicks([lo, hi]: [number, number]): number[] {
  const step = 6;
  const start = Math.ceil(lo / step) * step;
  const out: number[] = [];
  for (let x = start; x <= hi; x += step) out.push(x);
  return out;
}

// --- shared tooltip for the line/area graphs ---------------------------------

import { formatOffsetWindow } from "@/lib/weather-hub";

export function GraphTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; dataKey?: string; value?: number; color?: string }>;
  label?: number;
  unit?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const off = typeof label === "number" ? label : 0;
  return (
    <div className="rounded-md border border-border bg-card p-2 text-xs shadow-lg">
      <div className="mb-1 font-semibold text-foreground">
        {formatOffsetTick(off)}{" "}
        <span className="font-normal text-muted-foreground">
          ({off >= 0 ? `+${off}` : off}h)
        </span>
      </div>
      <div className="space-y-0.5">
        {payload
          .filter((p) => p.value != null)
          .map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="inline-block size-2 rounded-sm"
                  style={{ backgroundColor: p.color }}
                />
                {p.name ?? p.dataKey}
              </span>
              <span className="font-medium text-foreground">
                {typeof p.value === "number" ? p.value : "—"}
                {unit ? ` ${unit}` : ""}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

// Re-export so graph-grid can build the window label if needed.
export { formatOffsetWindow };
