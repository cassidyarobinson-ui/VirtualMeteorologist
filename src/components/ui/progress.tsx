"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import type * as React from "react";

import { cn } from "@/lib/utils";

export type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root>;

function Progress({
  className,
  value,
  ...props
}: ProgressProps) {
  // Suppress default aria-label when consumer provides aria-labelledby.
  // If consumer provides aria-label, it will override "Progress" via {...props}.
  const hasLabelledBy = Boolean(props["aria-labelledby"]);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      aria-label={hasLabelledBy ? undefined : "Progress"}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
