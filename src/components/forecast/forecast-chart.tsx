"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { ForecastPoint, getWorkabilityWindows } from "@/lib/forecast-data";
import { Badge } from "@/components/ui/badge";

interface ForecastChartProps {
  data: ForecastPoint[];
}

export function ForecastChart({ data }: ForecastChartProps) {
  const windows = getWorkabilityWindows(data);

  // Y-axis domain
  const allValues = data.flatMap((d) => [
    d.deterministic,
    d.p90,
    d.ensembleMin,
    d.ensembleMax,
    d.alphaLimit,
    d.baseLimit,
  ]);
  const yMin = Math.floor(Math.min(...allValues) * 10) / 10 - 0.2;
  const yMax = Math.ceil(Math.max(...allValues) * 10) / 10 + 0.2;

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 16, left: 8, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />

          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(h) => `+${h}h`}
            interval={5}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={{ stroke: "#e5e7eb" }}
          />

          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(v) => v.toFixed(1)}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={{ stroke: "#e5e7eb" }}
            label={{
              value: "m",
              position: "insideTopLeft",
              offset: -5,
              style: { fontSize: 11, fill: "#6b7280" },
            }}
          />

          {/* Workable window shading */}
          {windows.map((w, i) => (
            <ReferenceArea
              key={i}
              x1={w.start}
              x2={w.end}
              fill="#10b981"
              fillOpacity={0.08}
              stroke="#10b981"
              strokeOpacity={0.2}
            />
          ))}

          {/* "Now" reference line */}
          <ReferenceLine
            x={0}
            stroke="#007bd9"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: "Now",
              position: "top",
              fill: "#007bd9",
              fontSize: 11,
            }}
          />

          {/* Ensemble spread area */}
          <Area
            type="monotone"
            dataKey="ensembleMax"
            stroke="none"
            fill="#8b5cf6"
            fillOpacity={0.12}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="ensembleMin"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            isAnimationActive={false}
          />

          {/* Base Limit - dashed red */}
          <Line
            type="stepAfter"
            dataKey="baseLimit"
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />

          {/* Alpha Limit - solid red stepped */}
          <Line
            type="stepAfter"
            dataKey="alphaLimit"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />

          {/* P90 - dashed orange */}
          <Line
            type="monotone"
            dataKey="p90"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            isAnimationActive={false}
          />

          {/* Deterministic - solid blue with dots */}
          <Line
            type="monotone"
            dataKey="deterministic"
            stroke="#007bd9"
            strokeWidth={2}
            dot={{ r: 3, fill: "#007bd9", stroke: "#fff", strokeWidth: 1.5 }}
            isAnimationActive={false}
          />

          <Tooltip content={<CustomTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; payload: ForecastPoint }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const isWorkable = point.deterministic < point.alphaLimit;

  return (
    <div className="bg-card border border-border rounded-md shadow-lg p-3 text-sm min-w-[180px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-foreground">+{label}h</span>
        <Badge
          variant="outline"
          className={`text-[10px] font-semibold px-1.5 py-0 ${
            isWorkable
              ? "text-green-700 border-green-300 bg-green-50"
              : "text-red-700 border-red-300 bg-red-50"
          }`}
        >
          {isWorkable ? "WORKABLE" : "NOT WORKABLE"}
        </Badge>
      </div>

      {/* Values */}
      <div className="space-y-1">
        <TooltipRow
          label="Deterministic"
          value={point.deterministic.toFixed(1)}
          color="#007bd9"
        />
        <TooltipRow
          label="P90"
          value={point.p90.toFixed(1)}
          color="#f59e0b"
        />
        <TooltipRow
          label="Ensemble Range"
          value={`${point.ensembleMin.toFixed(1)} – ${point.ensembleMax.toFixed(1)}`}
          color="#8b5cf6"
        />
      </div>

      <div className="border-t border-border mt-2 pt-2">
        <TooltipRow
          label="Alpha Limit"
          value={point.alphaLimit.toFixed(1)}
          color="#ef4444"
        />
      </div>
    </div>
  );
}

function TooltipRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs" style={{ color }}>
        {label}:
      </span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
