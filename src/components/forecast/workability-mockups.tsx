"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  generateAllMockData,
  WorkabilityStatus,
  ParameterData,
  MasterSlot,
} from "@/lib/workability-mock-data";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Tooltip,
} from "recharts";

// ============================================================================
// SHARED UTILITIES
// ============================================================================

const STATUS_COLORS: Record<WorkabilityStatus, string> = {
  workable: "#16a34a",
  caution: "#d97706",
  "non-workable": "#dc2626",
  unknown: "#6b7280",
};

const STATUS_BG: Record<WorkabilityStatus, string> = {
  workable: "bg-green-500",
  caution: "bg-amber-500",
  "non-workable": "bg-red-500",
  unknown: "bg-gray-400",
};

const STATUS_LABELS: Record<WorkabilityStatus, string> = {
  workable: "GO",
  caution: "MARGINAL",
  "non-workable": "NO-GO",
  unknown: "N/A",
};

function StatusBadge({ status }: { status: WorkabilityStatus }) {
  const variants: Record<WorkabilityStatus, string> = {
    workable: "text-green-700 border-green-300 bg-green-50",
    caution: "text-amber-700 border-amber-300 bg-amber-50",
    "non-workable": "text-red-700 border-red-300 bg-red-50",
    unknown: "text-gray-600 border-gray-300 bg-gray-50",
  };
  return (
    <Badge variant="outline" className={`text-xs font-semibold ${variants[status]}`}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function formatHour(hour: number): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + hour);
  return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// ============================================================================
// MOCKUP A: "Dense Heatmap" — Compact, information-dense timeline strips
// ============================================================================

function TimelineStrip({ slots, label, isMaster }: { slots: { status: WorkabilityStatus }[]; label: string; isMaster?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs w-24 shrink-0 ${isMaster ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
      <div className="flex-1 flex h-5 rounded-sm overflow-hidden border border-border">
        {slots.map((slot, i) => (
          <div
            key={i}
            className={`flex-1 ${STATUS_BG[slot.status]} transition-opacity hover:opacity-80`}
            title={`+${i}h: ${STATUS_LABELS[slot.status]}`}
          />
        ))}
      </div>
    </div>
  );
}

export function MockupA() {
  const { parameters, masterTimeline } = useMemo(() => generateAllMockData(), []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Workability Overview</h2>
            <StatusBadge status={masterTimeline[0]?.status ?? "unknown"} />
          </div>
          <span className="text-xs text-muted-foreground">48-hour rolling forecast</span>
        </div>
        <p className="text-sm text-muted-foreground">Platform Alpha — Dense Heatmap View</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Time axis */}
        <div className="flex items-center gap-2">
          <span className="text-xs w-24 shrink-0" />
          <div className="flex-1 flex justify-between text-[10px] text-muted-foreground px-0.5">
            <span>Now</span>
            <span>+12h</span>
            <span>+24h</span>
            <span>+36h</span>
            <span>+48h</span>
          </div>
        </div>

        {/* Master timeline */}
        <TimelineStrip slots={masterTimeline} label="ALL PARAMS" isMaster />

        <Separator className="my-1" />

        {/* Parameter lanes */}
        {parameters.map((param) => (
          <TimelineStrip key={param.id} slots={param.slots} label={param.name} />
        ))}

        {/* Legend */}
        <div className="flex items-center gap-4 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span>GO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span>MARGINAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>NO-GO</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MOCKUP B: "Segmented Blocks" — Larger status blocks with text labels
// ============================================================================

function SegmentedTimeline({ slots, label, isMaster }: { slots: { status: WorkabilityStatus; hour: number }[]; label: string; isMaster?: boolean }) {
  // Group consecutive same-status slots into segments
  const segments: { status: WorkabilityStatus; startHour: number; endHour: number; count: number }[] = [];
  let current = slots[0];
  let startIdx = 0;

  for (let i = 1; i <= slots.length; i++) {
    if (i === slots.length || slots[i].status !== current?.status) {
      segments.push({
        status: current?.status ?? "unknown",
        startHour: slots[startIdx]?.hour ?? 0,
        endHour: slots[i - 1]?.hour ?? 0,
        count: i - startIdx,
      });
      if (i < slots.length) {
        current = slots[i];
        startIdx = i;
      }
    }
  }

  return (
    <div className={`space-y-1 ${isMaster ? "pb-2" : ""}`}>
      <span className={`text-xs ${isMaster ? "font-semibold text-foreground uppercase tracking-wide" : "text-muted-foreground font-medium"}`}>
        {label}
      </span>
      <div className="flex gap-0.5 h-8 rounded-md overflow-hidden">
        {segments.map((seg, i) => {
          const widthPercent = (seg.count / slots.length) * 100;
          const bgClass = seg.status === "workable" ? "bg-green-500/90" :
            seg.status === "caution" ? "bg-amber-500/90" :
            seg.status === "non-workable" ? "bg-red-500/90" : "bg-gray-400/90";
          const textColor = seg.status === "caution" ? "text-amber-950" : "text-white";

          return (
            <div
              key={i}
              className={`${bgClass} ${textColor} flex items-center justify-center text-[10px] font-semibold relative`}
              style={{ width: `${widthPercent}%` }}
            >
              {seg.count >= 3 && STATUS_LABELS[seg.status]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MockupB() {
  const { parameters, masterTimeline } = useMemo(() => generateAllMockData(), []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Workability Status</h2>
            <StatusBadge status={masterTimeline[0]?.status ?? "unknown"} />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Updated 2 min ago
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Platform Alpha — Segmented Block View</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Time axis */}
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Now</span>
          <span>+6h</span>
          <span>+12h</span>
          <span>+18h</span>
          <span>+24h</span>
          <span>+30h</span>
          <span>+36h</span>
          <span>+42h</span>
          <span>+48h</span>
        </div>

        {/* Master */}
        <SegmentedTimeline slots={masterTimeline} label="Combined Status" isMaster />

        <Separator />

        {/* Parameters */}
        {parameters.map((param) => (
          <SegmentedTimeline key={param.id} slots={param.slots} label={`${param.name} (${param.unit})`} />
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MOCKUP C: "Expandable Lanes" — Click to expand with detail chart
// ============================================================================

function ExpandableLane({ param }: { param: ParameterData }) {
  const [expanded, setExpanded] = useState(false);
  const hasAlert = param.slots.some((s) => s.status !== "workable");

  const chartData = param.slots.map((slot) => ({
    hour: slot.hour,
    mean: slot.mean,
    p90: slot.p90,
    alphaLimit: param.alphaLimit,
    cautionLine: param.alphaLimit * (1 - param.cautionMarginPercent / 100),
  }));

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Lane header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent/50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className={`text-sm ${hasAlert ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
          {param.name}
        </span>
        <span className="text-xs text-muted-foreground">({param.unit})</span>
        <div className="flex-1" />
        {/* Mini status strip */}
        <div className="flex h-3 w-32 rounded-sm overflow-hidden border border-border">
          {param.slots.map((slot, i) => (
            <div key={i} className={`flex-1 ${STATUS_BG[slot.status]}`} />
          ))}
        </div>
        <StatusBadge status={param.slots[0]?.status ?? "unknown"} />
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-border bg-accent/20 p-4">
          <div className="flex items-center gap-4 mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0 border-t-2 border-[#007bd9]" />
              <span className="text-muted-foreground">Mean</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0 border-t-2 border-dashed border-[#f59e0b]" />
              <span className="text-muted-foreground">P90</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0 border-t-2 border-[#ef4444]" />
              <span className="text-muted-foreground">Alpha Limit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0 border-t-2 border-dashed border-[#ef4444]/50" />
              <span className="text-muted-foreground">Caution Threshold</span>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickFormatter={(h) => `+${h}h`}
                  interval={5}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickFormatter={(v) => v.toFixed(1)}
                  label={{ value: param.unit, position: "insideTopLeft", offset: -5, style: { fontSize: 10, fill: "#6b7280" } }}
                />
                <ReferenceLine x={0} stroke="#007bd9" strokeDasharray="4 4" strokeWidth={1} />
                <Line type="monotone" dataKey="alphaLimit" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="cautionLine" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="p90" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" fill="#f59e0b" fillOpacity={0.05} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="mean" stroke="#007bd9" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb" }}
                  labelFormatter={(h) => `+${h}h`}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export function MockupC() {
  const { parameters, masterTimeline } = useMemo(() => generateAllMockData(), []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Workability Timeline</h2>
            <StatusBadge status={masterTimeline[0]?.status ?? "unknown"} />
          </div>
          <span className="text-xs text-muted-foreground">Platform Alpha</span>
        </div>
        <p className="text-sm text-muted-foreground">Expandable Lanes — Click a parameter to see forecast detail</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Master timeline */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Now</span>
            <span>+12h</span>
            <span>+24h</span>
            <span>+36h</span>
            <span>+48h</span>
          </div>
          <div className="flex h-6 rounded-md overflow-hidden border border-border">
            {masterTimeline.map((slot, i) => (
              <div key={i} className={`flex-1 ${STATUS_BG[slot.status]}`} />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Master Status (worst-case all parameters)</p>
        </div>

        <Separator />

        {/* Expandable parameter lanes */}
        <div className="space-y-2">
          {parameters.map((param) => (
            <ExpandableLane key={param.id} param={param} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MOCKUP D: "Dashboard Cards" — Status cards + timeline below
// ============================================================================

// (MockupD is below, followed by E and F)

function ParameterCard({ param }: { param: ParameterData }) {
  const currentSlot = param.slots[0];
  const statusColor = currentSlot?.status === "workable" ? "border-green-300 bg-green-50" :
    currentSlot?.status === "caution" ? "border-amber-300 bg-amber-50" :
    "border-red-300 bg-red-50";

  const workableCount = param.slots.filter((s) => s.status === "workable").length;
  const workablePercent = Math.round((workableCount / param.slots.length) * 100);

  return (
    <div className={`rounded-lg border p-3 ${statusColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{param.name}</span>
        <StatusBadge status={currentSlot?.status ?? "unknown"} />
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-foreground">{currentSlot?.p90}</span>
        <span className="text-xs text-muted-foreground">{param.unit} (P90)</span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Limit: {param.alphaLimit} {param.unit}</span>
        <span>{workablePercent}% workable</span>
      </div>
      {/* Mini timeline */}
      <div className="flex h-2 rounded-full overflow-hidden mt-2">
        {param.slots.map((slot, i) => (
          <div key={i} className={`flex-1 ${STATUS_BG[slot.status]}`} />
        ))}
      </div>
    </div>
  );
}

export function MockupD() {
  const { parameters, masterTimeline } = useMemo(() => generateAllMockData(), []);
  const currentMaster = masterTimeline[0]?.status ?? "unknown";

  // Summary stats
  const workableHours = masterTimeline.filter((s) => s.status === "workable").length;
  const cautionHours = masterTimeline.filter((s) => s.status === "caution").length;
  const noGoHours = masterTimeline.filter((s) => s.status === "non-workable").length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Workability Dashboard</h2>
            <StatusBadge status={currentMaster} />
          </div>
          <span className="text-xs text-muted-foreground">Platform Alpha</span>
        </div>
        <p className="text-sm text-muted-foreground">Dashboard Cards — Status summary with parameter breakdown</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{workableHours}h</p>
            <p className="text-xs text-green-600">Workable</p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{cautionHours}h</p>
            <p className="text-xs text-amber-600">Marginal</p>
          </div>
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center">
            <p className="text-2xl font-bold text-red-700">{noGoHours}h</p>
            <p className="text-xs text-red-600">No-Go</p>
          </div>
        </div>

        <Separator />

        {/* Master timeline */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Now</span>
            <span>+12h</span>
            <span>+24h</span>
            <span>+36h</span>
            <span>+48h</span>
          </div>
          <div className="flex h-5 rounded-md overflow-hidden border border-border">
            {masterTimeline.map((slot, i) => (
              <div key={i} className={`flex-1 ${STATUS_BG[slot.status]}`} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Parameter cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {parameters.map((param) => (
            <ParameterCard key={param.id} param={param} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


// ============================================================================
// MOCKUP E: "Graph + Cards Combo" — Full probabilistic chart with status cards
// Closest to the third screenshot: status header, workability windows chips,
// and a full-size chart with ensemble spread, P90, alpha limit, and green shading
// ============================================================================

function WorkabilityWindowChip({ start, end, duration }: { start: number; end: number; duration: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1">
      <div className="h-2 w-2 rounded-full bg-green-500" />
      <span className="text-xs font-medium text-green-800">
        +{start}h to +{end}h ({duration}h)
      </span>
    </div>
  );
}

export function MockupE() {
  const { parameters, masterTimeline } = useMemo(() => generateAllMockData(), []);
  const [selectedParam, setSelectedParam] = useState(0);
  const param = parameters[selectedParam];
  const currentSlot = param.slots[0];

  // Compute workability windows for selected parameter
  const windows: { start: number; end: number; duration: number }[] = [];
  let winStart: number | null = null;
  for (let i = 0; i < param.slots.length; i++) {
    const isOk = param.slots[i].status === "workable";
    if (isOk && winStart === null) winStart = param.slots[i].hour;
    if (!isOk && winStart !== null) {
      windows.push({ start: winStart, end: param.slots[i].hour, duration: param.slots[i].hour - winStart });
      winStart = null;
    }
  }
  if (winStart !== null) {
    const last = param.slots[param.slots.length - 1].hour;
    windows.push({ start: winStart, end: last, duration: last - winStart });
  }

  const workableHours = param.slots.filter((s) => s.status === "workable").length;

  // Chart data
  const chartData = param.slots.map((slot) => ({
    hour: slot.hour,
    mean: slot.mean,
    p90: slot.p90,
    alphaLimit: param.alphaLimit,
    ensembleHigh: slot.p90 + 0.3,
    ensembleLow: Math.max(0, slot.mean - 0.3),
  }));

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Probabilistic Forecast</h2>
              <StatusBadge status={currentSlot?.status ?? "unknown"} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">(Platform Alpha)</p>
            <p className="text-xs text-muted-foreground mt-1">
              48-hour forecast with ensemble spread, P90, and DNV alpha-adjusted limits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Updated {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
            </span>
            {/* Parameter selector */}
            <div className="flex rounded-md border border-border overflow-hidden">
              {parameters.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedParam(i)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    i === selectedParam
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status + Summary Cards Row */}
        <div className="rounded-md border border-border bg-accent/30 p-4">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Current status */}
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                currentSlot?.status === "workable" ? "bg-green-100 text-green-700" :
                currentSlot?.status === "caution" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }`}>
                {currentSlot?.status === "workable" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M20 6 9 17l-5-5" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {currentSlot?.status === "workable" ? "Currently Workable" :
                   currentSlot?.status === "caution" ? "Marginal" : "Not Workable"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentSlot?.p90} {param.unit} (limit: {param.alphaLimit} {param.unit})
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-border hidden sm:block" />

            {/* Total workable hours */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{workableHours}h</p>
                <p className="text-xs text-muted-foreground">Total workable hours (48h window)</p>
              </div>
            </div>
          </div>

          {/* Workability window chips */}
          {windows.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Workability Windows
              </p>
              <div className="flex flex-wrap gap-2">
                {windows.map((w, i) => (
                  <WorkabilityWindowChip key={i} start={w.start} end={w.end} duration={w.duration} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t-2 border-[#007bd9]" />
            <span className="text-muted-foreground">Deterministic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t-2 border-dashed border-[#f59e0b]" />
            <span className="text-muted-foreground">P90</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#8b5cf6] opacity-30" />
            <span className="text-muted-foreground">Ensemble Min/Max</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t-2 border-[#ef4444]" />
            <span className="text-muted-foreground">Alpha Limit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#10b981] opacity-20" />
            <span className="text-muted-foreground">Workable Window</span>
          </div>
        </div>

        {/* Full Chart */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 8, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickFormatter={(h) => `+${h}h`}
                interval={5}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickFormatter={(v) => v.toFixed(1)}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
                label={{ value: param.unit, position: "insideTopLeft", offset: -5, style: { fontSize: 11, fill: "#6b7280" } }}
              />

              {/* Workable window shading */}
              {windows.map((w, i) => (
                <ReferenceArea key={i} x1={w.start} x2={w.end} fill="#10b981" fillOpacity={0.08} stroke="#10b981" strokeOpacity={0.2} />
              ))}

              {/* Now line */}
              <ReferenceLine x={0} stroke="#007bd9" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Now", position: "top", fill: "#007bd9", fontSize: 11 }} />

              {/* Ensemble spread */}
              <Area type="monotone" dataKey="ensembleHigh" stroke="none" fill="#8b5cf6" fillOpacity={0.12} isAnimationActive={false} />
              <Area type="monotone" dataKey="ensembleLow" stroke="none" fill="#ffffff" fillOpacity={1} isAnimationActive={false} />

              {/* Alpha limit */}
              <Line type="stepAfter" dataKey="alphaLimit" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />

              {/* P90 */}
              <Line type="monotone" dataKey="p90" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />

              {/* Deterministic / Mean */}
              <Line type="monotone" dataKey="mean" stroke="#007bd9" strokeWidth={2} dot={{ r: 2.5, fill: "#007bd9", stroke: "#fff", strokeWidth: 1 }} isAnimationActive={false} />

              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb" }}
                labelFormatter={(h) => `+${h}h`}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MOCKUP F: "Multi-Parameter Cards with Sparklines" — Each parameter gets its
// own card with a mini-chart, plus an overall alert/no-alert status header.
// Emphasizes the "absence of alerts" concept — green means safe to work.
// ============================================================================

function SparklineCard({ param }: { param: ParameterData }) {
  const currentSlot = param.slots[0];
  const workableCount = param.slots.filter((s) => s.status === "workable").length;
  const workablePercent = Math.round((workableCount / param.slots.length) * 100);

  const chartData = param.slots.map((slot) => ({
    hour: slot.hour,
    value: slot.p90,
    limit: param.alphaLimit,
  }));

  const borderColor = currentSlot?.status === "workable" ? "border-l-green-500" :
    currentSlot?.status === "caution" ? "border-l-amber-500" : "border-l-red-500";

  return (
    <div className={`rounded-lg border border-border bg-card p-4 border-l-4 ${borderColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{param.name}</span>
          <span className="text-xs text-muted-foreground">({param.unit})</span>
        </div>
        <StatusBadge status={currentSlot?.status ?? "unknown"} />
      </div>

      {/* Current values */}
      <div className="flex items-baseline gap-3 mb-3">
        <div>
          <span className="text-xs text-muted-foreground">P90: </span>
          <span className="text-lg font-bold text-foreground">{currentSlot?.p90}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Mean: </span>
          <span className="text-sm font-medium text-foreground">{currentSlot?.mean}</span>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-muted-foreground">Limit: </span>
          <span className="text-sm font-medium text-red-600">{param.alphaLimit}</span>
        </div>
      </div>

      {/* Sparkline chart */}
      <div className="h-[100px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="#007bd9"
              fillOpacity={0.06}
              isAnimationActive={false}
            />
            <Line type="monotone" dataKey="limit" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="value" stroke="#007bd9" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <XAxis dataKey="hour" hide />
            <YAxis hide domain={["dataMin - 0.5", "dataMax + 0.5"]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">{workablePercent}% workable over 48h</span>
        <div className="flex h-2 w-20 rounded-full overflow-hidden">
          {param.slots.filter((_, i) => i % 4 === 0).map((slot, i) => (
            <div key={i} className={`flex-1 ${STATUS_BG[slot.status]}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MockupF() {
  const { parameters, masterTimeline } = useMemo(() => generateAllMockData(), []);
  const currentMaster = masterTimeline[0]?.status ?? "unknown";

  const workableHours = masterTimeline.filter((s) => s.status === "workable").length;
  const hasAlerts = masterTimeline.some((s) => s.status === "non-workable");
  const cautionHours = masterTimeline.filter((s) => s.status === "caution").length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Workability Overview</h2>
            <StatusBadge status={currentMaster} />
          </div>
          <span className="text-xs text-muted-foreground">Platform Alpha — Multi-Parameter Cards</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alert / No-Alert Banner */}
        <div className={`rounded-lg p-4 flex items-center gap-4 ${
          !hasAlerts ? "bg-green-50 border border-green-200" :
          "bg-red-50 border border-red-200"
        }`}>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
            !hasAlerts ? "bg-green-100" : "bg-red-100"
          }`}>
            {!hasAlerts ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${!hasAlerts ? "text-green-800" : "text-red-800"}`}>
              {!hasAlerts ? "No Active Alerts — All Parameters Within Limits" : "Weather Alerts Active"}
            </p>
            <p className={`text-xs mt-0.5 ${!hasAlerts ? "text-green-600" : "text-red-600"}`}>
              {workableHours}h workable{cautionHours > 0 ? ` · ${cautionHours}h marginal` : ""} in the next 48 hours
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-foreground">{workableHours}h</p>
            <p className="text-xs text-muted-foreground">workable</p>
          </div>
        </div>

        {/* Master timeline */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Now</span>
            <span>+12h</span>
            <span>+24h</span>
            <span>+36h</span>
            <span>+48h</span>
          </div>
          <div className="flex h-4 rounded-md overflow-hidden border border-border">
            {masterTimeline.map((slot, i) => (
              <div key={i} className={`flex-1 ${STATUS_BG[slot.status]}`} />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">Combined status (worst-case across all parameters)</p>
        </div>

        <Separator />

        {/* Parameter sparkline cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {parameters.map((param) => (
            <SparklineCard key={param.id} param={param} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
