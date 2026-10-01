"use client";

import { useMemo } from "react";
import { ForecastWidget } from "@/components/forecast/forecast-widget";
import { generateForecastData } from "@/lib/forecast-data";

export default function ForecastPage() {
  const data = useMemo(() => generateForecastData(), []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <ForecastWidget data={data} assetName="Platform Alpha" />
      </div>
    </div>
  );
}
