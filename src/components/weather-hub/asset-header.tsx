"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ASSETS, WeatherHubAsset } from "@/lib/weather-hub";
import { TriangleAlert, Route, MapPin } from "lucide-react";

interface AssetHeaderProps {
  asset: WeatherHubAsset;
  onSelect: (id: string) => void;
}

/**
 * Asset selection + thermal-modeling validation header. When an unmodeled
 * asset is selected, a warning banner explains that pavement, depth, and
 * treatment graphs are disabled until modeling has run.
 */
export function AssetHeader({ asset, onSelect }: AssetHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-base font-semibold text-foreground">
            Weather Hub — Route &amp; Site
          </h1>
          <p className="text-xs text-muted-foreground">
            Synchronized road-weather forecast and treatment planning
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Asset
          </span>
          <Select
            value={asset.id}
            onValueChange={(v) => v && onSelect(v as string)}
          >
            <SelectTrigger className="h-8 w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSETS.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  <span className="flex items-center gap-2">
                    {a.type === "route" ? (
                      <Route className="size-3.5 text-muted-foreground" />
                    ) : (
                      <MapPin className="size-3.5 text-muted-foreground" />
                    )}
                    {a.name}
                    {!a.isModeled && (
                      <Badge variant="outline" className="text-[10px]">
                        Not modeled
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge
            variant={asset.isModeled ? "secondary" : "outline"}
            className="text-[11px]"
          >
            {asset.isModeled ? "Thermal model ready" : "No thermal model"}
          </Badge>
        </div>
      </div>

      {!asset.isModeled && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">
              Thermal / pavement modeling has not run for this asset.
            </p>
            <p className="text-amber-800 dark:text-amber-300/90">
              Weather and atmospheric graphs are available, but pavement
              condition, roadway surface depths, and treatment recommendations
              are disabled until modeling completes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
