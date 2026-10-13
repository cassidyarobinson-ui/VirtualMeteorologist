"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getUsage,
  percentRemaining,
  percentUsed,
  formatTimeToReset,
} from "@/lib/usage";
import { CircleHelp } from "lucide-react";

/** Circular progress ring (SVG) showing percent remaining, like the screenshot. */
function UsageRing({ percent }: { percent: number }) {
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);
  // Green when healthy, warning/danger as it depletes.
  const color =
    percent > 25
      ? "var(--color-intent-success-base)"
      : percent > 10
        ? "var(--color-intent-warning-base)"
        : "var(--color-intent-danger-base)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
        {percent}%
      </span>
    </div>
  );
}

export function UsageView() {
  const usage = getUsage();
  const remaining = percentRemaining(usage);
  const used = percentUsed(usage);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5">
          <h4 className="text-foreground">Usage</h4>
          <CircleHelp className="size-3.5 text-muted-foreground" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your Virtual Meteorologist credits for this period.
        </p>
      </div>

      {/* Weekly limit remaining — ring + copy + time to reset */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-4">
          <UsageRing percent={remaining} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              Weekly limit remaining
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              You have used some of your weekly limit. It fully refreshes soon.
            </p>
          </div>
        </div>
        {/* Time to reset lives with the weekly limit */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">Time to reset</span>
          <span className="font-medium text-foreground">
            {formatTimeToReset(usage.resetAt)}
          </span>
        </div>
      </div>

      {/* Monthly credits used — bar + figures */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Monthly credits used
          </span>
          <Badge variant="secondary" className="text-[11px]">
            {usage.planName}
          </Badge>
        </div>
        <Progress value={used} aria-label="Monthly credits used" />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">
              {usage.creditsUsed.toLocaleString()}
            </span>{" "}
            used this month
          </span>
          <span>{usage.creditsTotal.toLocaleString()} covered monthly</span>
        </div>
      </div>

      <Separator />

      {/* Upgrade guidance */}
      <div className="rounded-lg bg-muted/40 p-4 text-sm">
        <p className="font-medium text-foreground">Need more credits?</p>
        <p className={cn("mt-1 text-muted-foreground")}>
          To raise your limit, talk to your account manager about upgrading your
          plan.
        </p>
      </div>
    </div>
  );
}
