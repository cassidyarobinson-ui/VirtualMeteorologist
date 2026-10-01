"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ForecastPoint, getCurrentStatus } from "@/lib/forecast-data";
import { ForecastChart } from "./forecast-chart";
import { WorkabilityPanel } from "./workability-panel";

interface ForecastWidgetProps {
  data: ForecastPoint[];
  assetName: string;
}

export function ForecastWidget({ data, assetName }: ForecastWidgetProps) {
  const [parameter, setParameter] = useState("wave-height");
  const status = getCurrentStatus(data);

  const now = new Date();
  const updatedTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    .split("/")
    .pop()
    ?.replace("_", " ");

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        {/* Top row: title + controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Probabilistic Forecast
                </h2>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold text-green-700 border-green-300 bg-green-50"
                >
                  GO
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                ({assetName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Updated {updatedTime} {timezone}
            </span>

            <Select value={parameter} onValueChange={(val) => val && setParameter(val)}>
              <SelectTrigger className="w-[200px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wave-height">
                  Significant Wave Height
                </SelectItem>
                <SelectItem value="wind-speed">Wind Speed</SelectItem>
                <SelectItem value="current-speed">Current Speed</SelectItem>
                <SelectItem value="visibility">Visibility</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          48-hour forecast with ensemble spread, P90, and DNV alpha-adjusted
          limits
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Workability Status Panel */}
        <WorkabilityPanel status={status} />

        <Separator />

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <LegendItem color="#007bd9" label="Deterministic" type="solid" />
          <LegendItem color="#f59e0b" label="P90" type="dashed" />
          <LegendItem color="#8b5cf6" label="Ensemble Min/Max" type="area" />
          <LegendItem color="#ef4444" label="Alpha Limit" type="solid" />
          <LegendItem color="#ef4444" label="Base Limit" type="dashed" />
          <LegendItem color="#10b981" label="Workable Window" type="area" />
        </div>

        {/* Chart */}
        <ForecastChart data={data} />
      </CardContent>
    </Card>
  );
}

function LegendItem({
  color,
  label,
  type,
}: {
  color: string;
  label: string;
  type: "solid" | "dashed" | "area";
}) {
  return (
    <div className="flex items-center gap-1.5">
      {type === "area" ? (
        <div
          className="w-3 h-3 rounded-sm opacity-40"
          style={{ backgroundColor: color }}
        />
      ) : type === "dashed" ? (
        <div className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: color }} />
      ) : (
        <div className="w-4 h-0 border-t-2" style={{ borderColor: color }} />
      )}
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
