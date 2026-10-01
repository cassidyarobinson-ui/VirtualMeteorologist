"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type * as React from "react";

import { cn } from "@/lib/utils";

// --- Prop Types ---

export type TooltipProviderProps = React.ComponentProps<
  typeof TooltipPrimitive.Provider
>;

export type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root>;

export type TooltipTriggerProps = React.ComponentProps<
  typeof TooltipPrimitive.Trigger
>;

export type TooltipContentProps = React.ComponentProps<
  typeof TooltipPrimitive.Content
>;

// --- Components ---

function TooltipProvider({
  delayDuration = 200,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          "fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[100] w-fit origin-(--radix-tooltip-content-transform-origin) animate-in text-balance rounded-md bg-neutral-black px-3 py-2 text-neutral-white text-xs data-[state=closed]:animate-out",
          // Viewport-safe: w-fit is normally tight but long tooltip text can
          // overflow narrow viewports; max-w prevents horizontal clipping.
          "max-w-[calc(100vw-1rem)]",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-[100] size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-neutral-black fill-neutral-black" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
