"use client";

import { NavRail } from "./nav-rail";
import { Button } from "@/components/ui/button";
import {
  Users,
  Pencil,
  Settings,
  Share2,
  ChevronDown,
  Menu,
  Volume2,
  Info,
  MoreHorizontal,
  Share,
} from "lucide-react";

const ASSET_TABS = [
  "Weather Hub",
  "Newport Team",
  "Newport Coaches",
  "Malibu",
  "Thousand Oaks",
];

/**
 * Faithful (static) WeatherHub dashboard chrome: left nav rail, top asset tab
 * bar + asset selector + action icons, and a 2x2 widget grid of placeholders.
 * The interactive Virtual Meteorologist panel is passed as `panel` and docked
 * on the right, exactly as it appears in the product.
 */
interface DashboardShellProps {
  panel: React.ReactNode;
  /** Whether the side panel is open (single source of truth lives in the page). */
  panelOpen: boolean;
  /** Reopen the side panel from the header control. */
  onReopenPanel: () => void;
}

export function DashboardShell({
  panel,
  panelOpen,
  onReopenPanel,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-medium">
      <NavRail />

      {/* Main dashboard column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top tab bar */}
        <header className="flex items-center gap-2 border-b border-border bg-card px-3 py-1.5">
          <div className="flex items-center gap-1 overflow-x-auto">
            {ASSET_TABS.map((tab, i) => (
              <div
                key={tab}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs ${
                  i === 0
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {i === 1 && <Users className="size-3" />}
                {i === 2 && <Users className="size-3" />}
                {tab}
              </div>
            ))}
          </div>

          <Menu className="ml-1 size-4 shrink-0 text-muted-foreground" />

          {/* Asset selector */}
          <div className="ml-2 flex items-center gap-2">
            <div className="flex h-7 w-44 items-center justify-between rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground">
              Select asset
              <ChevronDown className="size-3.5" />
            </div>
            <IconBtn><Pencil className="size-3.5" /></IconBtn>
            <IconBtn><Settings className="size-3.5" /></IconBtn>
            <IconBtn><Share2 className="size-3.5" /></IconBtn>
          </div>

          {/* Persistent reopen control — top-right, Gemini-style text button.
              Shown only when the panel is closed so it never duplicates the
              open panel's own header. */}
          {!panelOpen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReopenPanel}
              aria-label="Open side panel"
              className="ml-auto shrink-0"
            >
              Virtual Meteorologist
            </Button>
          )}
        </header>

        {/* Widget grid */}
        <main className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2 overflow-auto p-2">
          {[0, 1, 2, 3].map((i) => (
            <WidgetCard key={i} muted={i === 1} />
          ))}
        </main>
      </div>

      {/* Virtual Meteorologist panel. The outer track animates between a fixed
          width and zero so the dashboard reclaims space smoothly; the inner
          container keeps a fixed width so the panel's contents slide as one
          piece (like a normal side panel) instead of reflowing/squishing. The
          panel stays mounted so its state and scroll position persist. */}
      <div
        className={`h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          panelOpen ? "w-[360px]" : "w-0"
        }`}
        aria-hidden={!panelOpen}
      >
        <div className="h-full w-[360px]">{panel}</div>
      </div>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
      {children}
    </div>
  );
}

function WidgetCard({ muted }: { muted?: boolean }) {
  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            Widget Name
          </span>
          <span className="text-[10px] text-muted-foreground">
            Updated 0m ago
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Share className="size-3" />
          {muted ? (
            <Volume2 className="size-3 opacity-40" />
          ) : (
            <Volume2 className="size-3 text-sky-500" />
          )}
          <Info className="size-3" />
          <MoreHorizontal className="size-3" />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-muted-foreground">Widget Contents</span>
      </div>
    </section>
  );
}
