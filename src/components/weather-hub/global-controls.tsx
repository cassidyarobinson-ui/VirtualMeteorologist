"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  LineChart,
  Table,
  RotateCcw,
} from "lucide-react";

export type ViewMode = "graph" | "table";

interface GlobalControlsProps {
  onShift: (hours: number) => void;
  onZoom: (factor: number) => void;
  onReset: () => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  windowLabel: string;
}

/**
 * Global navigation + view controls shared across all graphs: time shifting
 * (-6h / -1h / +1h / +6h), zoom in/out, reset, and a Graph/Table view toggle.
 * All of these drive the shared x-domain window so every graph moves together.
 */
export function GlobalControls({
  onShift,
  onZoom,
  onReset,
  view,
  onViewChange,
  windowLabel,
}: GlobalControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
      {/* Time navigation */}
      <div className="flex items-center gap-1">
        <NavBtn label="Back 6 hours" onClick={() => onShift(-6)}>
          <ChevronsLeft className="size-4" />
          <span className="text-xs">6h</span>
        </NavBtn>
        <NavBtn label="Back 1 hour" onClick={() => onShift(-1)}>
          <ChevronLeft className="size-4" />
          <span className="text-xs">1h</span>
        </NavBtn>
        <NavBtn label="Forward 1 hour" onClick={() => onShift(1)}>
          <span className="text-xs">1h</span>
          <ChevronRight className="size-4" />
        </NavBtn>
        <NavBtn label="Forward 6 hours" onClick={() => onShift(6)}>
          <span className="text-xs">6h</span>
          <ChevronsRight className="size-4" />
        </NavBtn>

        <span className="mx-2 h-5 w-px bg-border" />

        <NavBtn label="Zoom in" onClick={() => onZoom(0.75)}>
          <ZoomIn className="size-4" />
        </NavBtn>
        <NavBtn label="Zoom out" onClick={() => onZoom(1.33)}>
          <ZoomOut className="size-4" />
        </NavBtn>
        <NavBtn label="Reset view" onClick={onReset}>
          <RotateCcw className="size-4" />
        </NavBtn>

        <span className="ml-2 text-xs text-muted-foreground">{windowLabel}</span>
      </div>

      {/* View toggle */}
      <div className="flex items-center rounded-md border border-border p-0.5">
        <button
          type="button"
          onClick={() => onViewChange("graph")}
          aria-pressed={view === "graph"}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            view === "graph"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LineChart className="size-3.5" />
          Graph View
        </button>
        <button
          type="button"
          onClick={() => onViewChange("table")}
          aria-pressed={view === "table"}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            view === "table"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Table className="size-3.5" />
          Table View
        </button>
      </div>
    </div>
  );
}

function NavBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={onClick}
          aria-label={label}
          className="h-7 gap-0.5 px-2"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
