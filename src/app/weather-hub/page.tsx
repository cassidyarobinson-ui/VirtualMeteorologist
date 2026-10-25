"use client";

import { useMemo, useState } from "react";
import { AssetHeader } from "@/components/weather-hub/asset-header";
import { GlobalControls, ViewMode } from "@/components/weather-hub/global-controls";
import { GraphGrid } from "@/components/weather-hub/graph-grid";
import { TableView } from "@/components/weather-hub/table-view";
import { Toaster } from "@/components/ui/sonner";
import {
  ASSETS,
  getAsset,
  generateSeries,
  dayNightBands,
  formatOffsetWindow,
} from "@/lib/weather-hub";

const MIN_WINDOW = 12; // hours
const MAX_WINDOW = 72;
const FULL_DOMAIN: [number, number] = [-24, 47];

export default function WeatherHubPage() {
  const [assetId, setAssetId] = useState(ASSETS[0].id);
  const [view, setView] = useState<ViewMode>("graph");
  const [domain, setDomain] = useState<[number, number]>([-6, 24]);

  const asset = getAsset(assetId) ?? ASSETS[0];
  const data = useMemo(() => generateSeries(), []);
  const bands = useMemo(() => dayNightBands(), []);

  function shift(hours: number) {
    setDomain(([lo, hi]) => {
      let nlo = lo + hours;
      let nhi = hi + hours;
      if (nlo < FULL_DOMAIN[0]) {
        nhi += FULL_DOMAIN[0] - nlo;
        nlo = FULL_DOMAIN[0];
      }
      if (nhi > FULL_DOMAIN[1]) {
        nlo -= nhi - FULL_DOMAIN[1];
        nhi = FULL_DOMAIN[1];
      }
      return [Math.max(FULL_DOMAIN[0], nlo), Math.min(FULL_DOMAIN[1], nhi)];
    });
  }

  function zoom(factor: number) {
    setDomain(([lo, hi]) => {
      const mid = (lo + hi) / 2;
      const width = hi - lo;
      const newWidth = Math.round(
        Math.min(MAX_WINDOW, Math.max(MIN_WINDOW, width * factor)),
      );
      let nlo = Math.round(mid - newWidth / 2);
      let nhi = nlo + newWidth;
      if (nlo < FULL_DOMAIN[0]) {
        nlo = FULL_DOMAIN[0];
        nhi = nlo + newWidth;
      }
      if (nhi > FULL_DOMAIN[1]) {
        nhi = FULL_DOMAIN[1];
        nlo = nhi - newWidth;
      }
      return [Math.max(FULL_DOMAIN[0], nlo), Math.min(FULL_DOMAIN[1], nhi)];
    });
  }

  return (
    <div className="min-h-screen bg-surface-medium">
      <Toaster position="top-center" richColors />
      <div className="mx-auto max-w-6xl space-y-3 p-3 md:p-4">
        <AssetHeader asset={asset} onSelect={setAssetId} />

        <GlobalControls
          onShift={shift}
          onZoom={zoom}
          onReset={() => setDomain([-6, 24])}
          view={view}
          onViewChange={setView}
          windowLabel={formatOffsetWindow(domain[0], domain[1])}
        />

        {view === "graph" ? (
          <GraphGrid
            data={data}
            bands={bands}
            domain={domain}
            isModeled={asset.isModeled}
          />
        ) : (
          <TableView data={data} domain={domain} isModeled={asset.isModeled} />
        )}
      </div>
    </div>
  );
}
