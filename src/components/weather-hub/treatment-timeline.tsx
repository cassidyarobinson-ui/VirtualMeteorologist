"use client";

import { TreatmentBlock } from "@/lib/weather-hub";
import { formatOffsetTick } from "./chart-primitives";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TreatmentTimelineProps {
  blocks: TreatmentBlock[];
  domain: [number, number];
}

/**
 * Graph 10 — a maintenance timeline aligned to the shared x-domain window.
 * Orange = Chemical Salting/De-icing, Yellow = Patrol & Plow. Hovering a bar
 * reveals start/end, material, dosage, and plow blade status. Two lanes keep
 * overlapping actions readable.
 */
export function TreatmentTimeline({ blocks, domain }: TreatmentTimelineProps) {
  const [lo, hi] = domain;
  const span = hi - lo || 1;
  const pct = (x: number) => ((x - lo) / span) * 100;

  const lanes: TreatmentBlock[][] = [
    blocks.filter((b) => b.kind === "chemical"),
    blocks.filter((b) => b.kind === "patrol"),
  ];

  // 6-hourly gridlines + a "Now" marker, matching the graphs' x-axis.
  const gridTicks: number[] = [];
  const step = 6;
  for (let x = Math.ceil(lo / step) * step; x <= hi; x += step) gridTicks.push(x);

  return (
    <div className="px-3 pb-3 pt-1">
      {/* legend */}
      <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 rounded-sm bg-orange-500" />
          Chemical Salting / De-icing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 rounded-sm bg-yellow-400" />
          Patrol &amp; Plow
        </span>
      </div>

      <div className="relative">
        {/* gridlines */}
        <div className="pointer-events-none absolute inset-0">
          {gridTicks.map((t) => (
            <div
              key={t}
              className="absolute top-0 bottom-5 w-px bg-border/60"
              style={{ left: `${pct(t)}%` }}
            />
          ))}
          {/* Now marker */}
          {0 >= lo && 0 <= hi && (
            <div
              className="absolute top-0 bottom-5 w-px bg-primary"
              style={{ left: `${pct(0)}%` }}
            >
              <span className="absolute -top-0 left-1 text-[10px] font-medium text-primary">
                Now
              </span>
            </div>
          )}
        </div>

        {/* lanes */}
        <div className="space-y-1.5">
          {lanes.map((lane, i) => (
            <div key={i} className="relative h-7">
              {lane.map((b) => {
                const left = Math.max(0, pct(b.startOffset));
                const right = Math.min(100, pct(b.endOffset));
                const width = right - left;
                if (width <= 0) return null;
                const isChem = b.kind === "chemical";
                return (
                  <Tooltip key={b.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={`absolute top-0 flex h-7 items-center overflow-hidden rounded px-2 text-[11px] font-medium text-white ${
                          isChem ? "bg-orange-500 hover:bg-orange-600" : "bg-yellow-400 text-yellow-950 hover:bg-yellow-500"
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <span className="truncate">{b.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-semibold">{b.label}</p>
                        <TooltipRow
                          k="Window"
                          v={`${formatOffsetTick(b.startOffset)} → ${formatOffsetTick(b.endOffset)} (${b.startOffset >= 0 ? "+" : ""}${b.startOffset}h to ${b.endOffset >= 0 ? "+" : ""}${b.endOffset}h)`}
                        />
                        <TooltipRow k="Material" v={b.material} />
                        <TooltipRow k="Dosage" v={b.dosage} />
                        <TooltipRow k="Plow blade" v={b.plowBlade} />
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>

        {/* axis labels */}
        <div className="relative mt-1 h-4">
          {gridTicks.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 text-[10px] text-muted-foreground"
              style={{ left: `${pct(t)}%` }}
            >
              {formatOffsetTick(t)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TooltipRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-neutral-300">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}
