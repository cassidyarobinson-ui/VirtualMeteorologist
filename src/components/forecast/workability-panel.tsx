"use client";

import { Badge } from "@/components/ui/badge";

interface WorkabilityStatus {
  isWorkable: boolean;
  currentValue: number;
  limit: number;
  totalWorkableHours: number;
  windows: { start: number; end: number; duration: number }[];
}

interface WorkabilityPanelProps {
  status: WorkabilityStatus;
}

export function WorkabilityPanel({ status }: WorkabilityPanelProps) {
  return (
    <div className="rounded-md border border-border bg-accent/30 p-4">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Current Status */}
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              status.isWorkable
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status.isWorkable ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {status.isWorkable ? "Currently Workable" : "Not Workable"}
            </p>
            <p className="text-xs text-muted-foreground">
              {status.currentValue.toFixed(1)} m (limit:{" "}
              {status.limit.toFixed(1)} m)
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-border hidden sm:block" />

        {/* Total Workable Hours */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {status.totalWorkableHours}h
            </p>
            <p className="text-xs text-muted-foreground">
              Total workable hours (48h window)
            </p>
          </div>
        </div>
      </div>

      {/* Workability Windows */}
      {status.windows.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Workability Windows
          </p>
          <div className="flex flex-wrap gap-2">
            {status.windows.map((window, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs font-mono text-green-700 border-green-200 bg-green-50 px-2.5 py-1"
              >
                +{window.start}h to +{window.end}h ({window.duration}h)
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
