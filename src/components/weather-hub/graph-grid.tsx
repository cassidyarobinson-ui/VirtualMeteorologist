"use client";

import { useState } from "react";
import { Line, Area, Bar, Tooltip, ReferenceArea } from "recharts";
import {
  WeatherHubPoint,
  ShadeBand,
  TREATMENT_BLOCKS,
  DominantPrecip,
} from "@/lib/weather-hub";
import {
  GraphCard,
  SyncedChart,
  GraphTooltip,
  LayerToggle,
} from "./chart-primitives";
import { TreatmentTimeline } from "./treatment-timeline";
import {
  Snowflake,
  CloudRain,
  CloudSnow,
  CloudHail,
  Wind,
} from "lucide-react";

interface GraphGridProps {
  data: WeatherHubPoint[];
  bands: ShadeBand[];
  domain: [number, number];
  isModeled: boolean;
}

/** Small hook: per-graph layer visibility keyed by series key. */
function useLayers(initial: Record<string, boolean>) {
  const [vis, setVis] = useState(initial);
  const toggle = (key: string) => setVis((v) => ({ ...v, [key]: !v[key] }));
  return { vis, toggle };
}

export function GraphGrid({ data, bands, domain, isModeled }: GraphGridProps) {
  return (
    <div className="space-y-3">
      <TempGraph data={data} bands={bands} domain={domain} />
      <PrecipProbGraph data={data} bands={bands} domain={domain} />
      <PrecipRateGraph data={data} bands={bands} domain={domain} />
      <WindGraph data={data} bands={bands} domain={domain} />
      <RadiationGraph data={data} bands={bands} domain={domain} />
      <VisibilityGraph data={data} bands={bands} domain={domain} />
      <FrostGraph data={data} bands={bands} domain={domain} />
      <IceChemGraph data={data} bands={bands} domain={domain} />
      <DepthsGraph
        data={data}
        bands={bands}
        domain={domain}
        isModeled={isModeled}
      />
      <TreatmentGraph domain={domain} isModeled={isModeled} />
    </div>
  );
}

type GraphProps = {
  data: WeatherHubPoint[];
  bands: ShadeBand[];
  domain: [number, number];
};

// --- Graph 1: Weather & Surface Temperatures --------------------------------

const TEMP_LAYERS: { key: string; label: string; color: string }[] = [
  { key: "airTemp", label: "Air Temp", color: "#007bd9" },
  { key: "dewPoint", label: "Dew Point", color: "#10b981" },
  { key: "windChill", label: "Wind Chill", color: "#8b5cf6" },
  { key: "surfaceTemp", label: "Surface Temp", color: "#f59e0b" },
  { key: "bridgeSurfaceTemp", label: "Bridge Surface", color: "#ef4444" },
  { key: "cyclePathTemp", label: "Cycle Path", color: "#ec4899" },
];

function TempGraph({ data, bands, domain }: GraphProps) {
  const { vis, toggle } = useLayers({
    airTemp: true,
    dewPoint: true,
    windChill: false,
    surfaceTemp: true,
    bridgeSurfaceTemp: true,
    cyclePathTemp: false,
  });
  const toggles: LayerToggle[] = TEMP_LAYERS.map((l) => ({
    ...l,
    enabled: vis[l.key],
  }));

  return (
    <GraphCard
      title="Weather & Surface Temperatures"
      subtitle="°F"
      index={1}
      toggles={toggles}
      onToggle={toggle}
    >
      <SyncedChart
        data={data}
        bands={bands}
        domain={domain}
        yLabel="°F"
        tooltip={<Tooltip content={<GraphTooltip unit="°F" />} />}
      >
        <ReferenceArea y1={32} y2={32} />
        {TEMP_LAYERS.filter((l) => vis[l.key]).map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </SyncedChart>
    </GraphCard>
  );
}

// --- Graph 2: Precipitation Probability (stacked, forecast only) -------------

const PRECIP_PROB_LAYERS = [
  { key: "probLiquid", label: "Liquid", color: "#38bdf8" },
  { key: "probSnow", label: "Snow", color: "#cbd5e1" },
  { key: "probFreezing", label: "Freezing Rain", color: "#a855f7" },
  { key: "probSleet", label: "Sleet", color: "#6366f1" },
  { key: "probMix", label: "Mix", color: "#f472b6" },
];

const DOMINANT_ICON: Record<DominantPrecip, typeof CloudRain | null> = {
  none: null,
  liquid: CloudRain,
  snow: CloudSnow,
  freezing: CloudHail,
  sleet: CloudHail,
  mix: Snowflake,
};

function PrecipProbGraph({ data, bands, domain }: GraphProps) {
  // Forecast-only: zero out past hours so the stack shows forecast horizon.
  const fc = data.map((d) =>
    d.forecast
      ? d
      : {
          ...d,
          probLiquid: 0,
          probSnow: 0,
          probFreezing: 0,
          probSleet: 0,
          probMix: 0,
        },
  );

  // Dominant-condition icons along the top, every 3h within the window.
  const iconPoints = data.filter(
    (d) =>
      d.forecast &&
      d.dominant !== "none" &&
      d.offset % 3 === 0 &&
      d.offset >= domain[0] &&
      d.offset <= domain[1],
  );

  return (
    <GraphCard
      title="Precipitation Probability"
      subtitle="forecast only · %"
      index={2}
    >
      {/* dominant-condition icon strip */}
      <div className="mb-1 flex items-center gap-1 px-10 text-muted-foreground">
        {iconPoints.map((p) => {
          const Icon = DOMINANT_ICON[p.dominant];
          return Icon ? (
            <span key={p.offset} title={`${p.dominant} @ ${p.offset}h`}>
              <Icon className="size-3.5" />
            </span>
          ) : null;
        })}
      </div>
      <SyncedChart
        data={fc}
        bands={bands}
        domain={domain}
        yDomain={[0, 100]}
        yLabel="%"
        tooltip={<Tooltip content={<GraphTooltip unit="%" />} />}
      >
        {PRECIP_PROB_LAYERS.map((l) => (
          <Bar
            key={l.key}
            dataKey={l.key}
            name={l.label}
            stackId="prob"
            fill={l.color}
            isAnimationActive={false}
          />
        ))}
      </SyncedChart>
    </GraphCard>
  );
}

// --- Graph 3: Precipitation Rate & Accumulation ------------------------------

const PRECIP_RATE_LAYERS = [
  { key: "rateLiquid", label: "Liquid Rate", color: "#38bdf8" },
  { key: "rateSnow", label: "Snow Rate", color: "#94a3b8" },
  { key: "rateIce", label: "Ice Rate", color: "#a855f7" },
  { key: "accLiquid", label: "Liquid Accum", color: "#0284c7" },
  { key: "accSnow", label: "Snow Accum", color: "#475569" },
  { key: "accIce", label: "Ice Accum", color: "#7c3aed" },
];

function PrecipRateGraph({ data, bands, domain }: GraphProps) {
  // Default: liquid rate + liquid accum ON, everything else OFF.
  const { vis, toggle } = useLayers({
    rateLiquid: true,
    rateSnow: false,
    rateIce: false,
    accLiquid: true,
    accSnow: false,
    accIce: false,
  });
  const toggles: LayerToggle[] = PRECIP_RATE_LAYERS.map((l) => ({
    ...l,
    enabled: vis[l.key],
  }));
  const isAccum = (k: string) => k.startsWith("acc");

  return (
    <GraphCard
      title="Precipitation Rate & Accumulation"
      subtitle="mm/hr · mm"
      index={3}
      toggles={toggles}
      onToggle={toggle}
    >
      <SyncedChart
        data={data}
        bands={bands}
        domain={domain}
        tooltip={<Tooltip content={<GraphTooltip unit="mm" />} />}
      >
        {PRECIP_RATE_LAYERS.filter((l) => vis[l.key]).map((l) =>
          isAccum(l.key) ? (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={l.color}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              isAnimationActive={false}
            />
          ) : (
            <Bar
              key={l.key}
              dataKey={l.key}
              name={l.label}
              fill={l.color}
              isAnimationActive={false}
            />
          ),
        )}
      </SyncedChart>
    </GraphCard>
  );
}

// --- Graph 4: Winds ----------------------------------------------------------

function WindGraph({ data, bands, domain }: GraphProps) {
  const { vis, toggle } = useLayers({
    windSpeed: true,
    windGust: true,
    windDir: false,
  });
  const toggles: LayerToggle[] = [
    { key: "windSpeed", label: "Wind Speed", color: "#0ea5e9", enabled: vis.windSpeed },
    { key: "windGust", label: "Wind Gust", color: "#f59e0b", enabled: vis.windGust },
    { key: "windDir", label: "Direction", color: "#64748b", enabled: vis.windDir },
  ];

  return (
    <GraphCard title="Winds" subtitle="mph · severity bands" index={4} toggles={toggles} onToggle={toggle}>
      <SyncedChart
        data={data}
        bands={bands}
        domain={domain}
        yDomain={[0, 50]}
        yLabel="mph"
        tooltip={<Tooltip content={<GraphTooltip unit="mph" />} />}
      >
        {/* severity threshold bands: Low / Medium / High */}
        <ReferenceArea y1={0} y2={15} fill="#10b981" fillOpacity={0.06} />
        <ReferenceArea y1={15} y2={30} fill="#f59e0b" fillOpacity={0.07} />
        <ReferenceArea y1={30} y2={50} fill="#ef4444" fillOpacity={0.07} />
        {vis.windSpeed && (
          <Line type="monotone" dataKey="windSpeed" name="Wind Speed" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
        )}
        {vis.windGust && (
          <Line type="monotone" dataKey="windGust" name="Wind Gust" stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
        )}
        {vis.windDir && (
          <Line type="monotone" dataKey="windDir" name="Direction (°)" stroke="#64748b" strokeWidth={1} dot={false} isAnimationActive={false} />
        )}
      </SyncedChart>
    </GraphCard>
  );
}

// --- Graph 5: Radiation ------------------------------------------------------

function RadiationGraph({ data, bands, domain }: GraphProps) {
  const { vis, toggle } = useLayers({ shortwave: true, longwave: true });
  const toggles: LayerToggle[] = [
    { key: "shortwave", label: "Shortwave (solar)", color: "#f59e0b", enabled: vis.shortwave },
    { key: "longwave", label: "Longwave (terrestrial)", color: "#ef4444", enabled: vis.longwave },
  ];
  return (
    <GraphCard title="Radiation" subtitle="W/m²" index={5} toggles={toggles} onToggle={toggle}>
      <SyncedChart
        data={data}
        bands={bands}
        domain={domain}
        yLabel="W/m²"
        tooltip={<Tooltip content={<GraphTooltip unit="W/m²" />} />}
      >
        {vis.shortwave && (
          <Area type="monotone" dataKey="shortwave" name="Shortwave" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={1.8} isAnimationActive={false} />
        )}
        {vis.longwave && (
          <Line type="monotone" dataKey="longwave" name="Longwave" stroke="#ef4444" strokeWidth={1.8} dot={false} isAnimationActive={false} />
        )}
      </SyncedChart>
    </GraphCard>
  );
}

// --- Graph 6: Visibility & Blowing Snow -------------------------------------

function VisibilityGraph({ data, bands, domain }: GraphProps) {
  const riskPoints = data.filter(
    (d) => d.blowingSnowRisk !== "none" && d.offset % 2 === 0 && d.offset >= domain[0] && d.offset <= domain[1],
  );
  return (
    <GraphCard
      title="Visibility & Blowing Snow"
      subtitle="miles · US Midwest risk"
      index={6}
      extraControls={
        <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Wind className="size-3.5 text-amber-500" /> low
          <Wind className="size-3.5 text-red-500" /> high
        </span>
      }
    >
      <div className="mb-1 flex items-center gap-1 px-10">
        {riskPoints.map((p) => (
          <Wind
            key={p.offset}
            className={`size-3.5 ${p.blowingSnowRisk === "high" ? "text-red-500" : "text-amber-500"}`}
          />
        ))}
      </div>
      <SyncedChart
        data={data}
        bands={bands}
        domain={domain}
        yDomain={[0, 10]}
        yLabel="mi"
        tooltip={<Tooltip content={<GraphTooltip unit="mi" />} />}
      >
        <ReferenceArea y1={0} y2={0.25} fill="#ef4444" fillOpacity={0.08} />
        <Area type="monotone" dataKey="visibility" name="Visibility" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.12} strokeWidth={1.8} isAnimationActive={false} />
      </SyncedChart>
    </GraphCard>
  );
}

// --- Graph 7: Frost Probability ---------------------------------------------

function FrostGraph({ data, bands, domain }: GraphProps) {
  return (
    <GraphCard
      title="Frost Probability"
      subtitle="hoarfrost / road moisture · %"
      index={7}
      extraControls={<Snowflake className="size-4 text-sky-400" />}
    >
      <SyncedChart
        data={data}
        bands={bands}
        domain={domain}
        yDomain={[0, 100]}
        yLabel="%"
        tooltip={<Tooltip content={<GraphTooltip unit="%" />} />}
      >
        <Area type="monotone" dataKey="frostProb" name="Frost Probability" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.18} strokeWidth={1.8} isAnimationActive={false} />
      </SyncedChart>
    </GraphCard>
  );
}

// --- Graph 8: Ice & Chemical Points -----------------------------------------

function IceChemGraph({ data, bands, domain }: GraphProps) {
  const { vis, toggle } = useLayers({ percentIce: true, freezePoint: true, meltPoint: true });
  const toggles: LayerToggle[] = [
    { key: "percentIce", label: "Percent Ice (%)", color: "#a855f7", enabled: vis.percentIce },
    { key: "freezePoint", label: "Chemical Freeze Point (°F)", color: "#ef4444", enabled: vis.freezePoint },
    { key: "meltPoint", label: "Melt Point (°F)", color: "#10b981", enabled: vis.meltPoint },
  ];
  return (
    <GraphCard title="Ice & Chemical Points" subtitle="% · °F" index={8} toggles={toggles} onToggle={toggle}>
      <SyncedChart
        data={data}
        bands={bands}
        domain={domain}
        tooltip={<Tooltip content={<GraphTooltip />} />}
      >
        {vis.percentIce && (
          <Area type="monotone" dataKey="percentIce" name="Percent Ice" stroke="#a855f7" fill="#a855f7" fillOpacity={0.12} strokeWidth={1.6} isAnimationActive={false} />
        )}
        {vis.freezePoint && (
          <Line type="monotone" dataKey="freezePoint" name="Freeze Point" stroke="#ef4444" strokeWidth={1.8} dot={false} isAnimationActive={false} />
        )}
        {vis.meltPoint && (
          <Line type="monotone" dataKey="meltPoint" name="Melt Point" stroke="#10b981" strokeWidth={1.8} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
        )}
      </SyncedChart>
    </GraphCard>
  );
}

// --- Graph 9: Roadway Surface Depths (guarded) ------------------------------

const DEPTH_LAYERS = [
  { key: "depthLiquid", label: "Liquid", color: "#38bdf8" },
  { key: "depthSnow", label: "Snow", color: "#cbd5e1" },
  { key: "depthCompactedSnow", label: "Compacted Snow", color: "#94a3b8" },
  { key: "depthFrost", label: "Frost", color: "#a5f3fc" },
  { key: "depthIce", label: "Ice", color: "#a855f7" },
  { key: "depthUnbondedIce", label: "Unbonded Ice", color: "#6366f1" },
];

function DepthsGraph({
  data,
  bands,
  domain,
  isModeled,
}: GraphProps & { isModeled: boolean }) {
  const { vis, toggle } = useLayers({
    depthLiquid: true,
    depthSnow: true,
    depthCompactedSnow: true,
    depthFrost: false,
    depthIce: true,
    depthUnbondedIce: false,
  });
  const toggles: LayerToggle[] = DEPTH_LAYERS.map((l) => ({ ...l, enabled: vis[l.key] }));
  return (
    <GraphCard
      title="Roadway Surface Depths"
      subtitle="mm · stacked layers"
      index={9}
      toggles={isModeled ? toggles : undefined}
      onToggle={toggle}
      disabled={!isModeled}
      disabledNote="Requires thermal model — select a modeled asset to view surface depths."
    >
      <SyncedChart
        data={data}
        bands={bands}
        domain={domain}
        yLabel="mm"
        tooltip={<Tooltip content={<GraphTooltip unit="mm" />} />}
      >
        {DEPTH_LAYERS.filter((l) => vis[l.key]).map((l) => (
          <Area
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stackId="depth"
            stroke={l.color}
            fill={l.color}
            fillOpacity={0.5}
            strokeWidth={1}
            isAnimationActive={false}
          />
        ))}
      </SyncedChart>
    </GraphCard>
  );
}

// --- Graph 10: Pavement Condition & Treatment Recommendations (guarded) -----

function TreatmentGraph({
  domain,
  isModeled,
}: {
  domain: [number, number];
  isModeled: boolean;
}) {
  return (
    <GraphCard
      title="Pavement Condition & Treatment Recommendations"
      subtitle="maintenance timeline"
      index={10}
      disabled={!isModeled}
      disabledNote="Requires thermal model — select a modeled asset to view treatment recommendations."
    >
      <TreatmentTimeline blocks={TREATMENT_BLOCKS} domain={domain} />
    </GraphCard>
  );
}
