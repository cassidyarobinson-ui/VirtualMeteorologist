"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Label typography variants — ECO contract:
 *
 * default  — Field label role: text-sm (12px/16px), regular weight.
 *            Use for input labels, FieldLabel, FieldLegend, fieldset captions.
 *
 * option   — Control option label role: text-base (13px/18px), regular weight.
 *            Use for checkbox item labels, radio item labels, and switch/toggle
 *            row labels where the label is selectable option text.
 *            Do NOT use for field group captions or input labels.
 */
const labelVariants = cva(
  "select-none text-secondary-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
  {
    variants: {
      variant: {
        /**
         * Field label: text-sm 12px/16px regular.
         * Default for all label usage.
         */
        default: "flex items-center gap-2 text-sm font-normal leading-4",
        /**
         * Control option label: text-base 13px/18px regular.
         * Use for checkbox/radio/switch inline option labels only.
         */
        option: "flex items-center gap-2 text-base font-normal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>;

function Label({ className, variant, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-variant={variant ?? "default"}
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Label, labelVariants };
