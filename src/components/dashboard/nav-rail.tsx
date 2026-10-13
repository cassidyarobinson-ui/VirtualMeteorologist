"use client";

import {
  LayoutDashboard,
  Map,
  Bell,
  Calendar,
  FileText,
  Settings,
  Users,
  Grid3x3,
  HelpCircle,
  PanelLeft,
} from "lucide-react";

/**
 * The dark left navigation rail from the WeatherHub mockup. Static chrome —
 * the Virtual Meteorologist panel is the interactive feature; these nav items
 * are presentational context so the panel is shown in its real surroundings.
 */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Map, label: "Map" },
  { icon: Bell, label: "Assets & Alerts" },
  { icon: Calendar, label: "Events" },
  { icon: FileText, label: "Reports" },
  { icon: Settings, label: "Admin" },
  { icon: Users, label: "User Management" },
];

export function NavRail() {
  return (
    <nav
      aria-label="WeatherHub navigation"
      className="flex w-16 shrink-0 flex-col items-center justify-between bg-neutral-900 py-3 text-neutral-400"
    >
      <div className="flex flex-col items-center gap-1">
        {/* Brand mark */}
        <div className="mb-3 flex size-9 items-center justify-center">
          <div className="size-6 rounded-full bg-gradient-to-br from-sky-400 via-emerald-400 to-amber-400" />
        </div>

        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            className={`flex w-14 flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[9px] leading-tight ${
              active
                ? "bg-neutral-800 text-white"
                : "hover:bg-neutral-800/60 hover:text-neutral-200"
            }`}
            title={label}
          >
            <Icon className="size-4" />
            <span className="text-center">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Grid3x3 className="size-4" />
        <div className="flex size-6 items-center justify-center rounded-full bg-sky-500 text-white">
          <HelpCircle className="size-4" />
        </div>
        <div className="size-7 overflow-hidden rounded-full bg-neutral-700">
          {/* avatar placeholder */}
          <div className="size-full bg-gradient-to-br from-rose-300 to-amber-200" />
        </div>
        <PanelLeft className="size-4" />
      </div>
    </nav>
  );
}
