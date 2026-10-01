"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";
import {
  composeAriaDescribedBy,
  useField,
} from "@/components/ui/field";

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

function Checkbox({
  className,
  // Accessible props — explicit values always win; context fills gaps.
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  required,
  disabled,
  ...props
}: CheckboxProps) {
  const field = useField();

  const resolvedId = id ?? field?.controlId;
  const resolvedDescribedBy = composeAriaDescribedBy(ariaDescribedBy, field);
  const resolvedInvalid =
    ariaInvalid !== undefined ? ariaInvalid : field?.invalid ? true : undefined;
  const resolvedRequired = required !== undefined ? required : field?.required;
  const resolvedDisabled = disabled !== undefined ? disabled : field?.disabled;

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      id={resolvedId}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid}
      required={resolvedRequired}
      disabled={resolvedDisabled}
      className={cn(
        // Visual size stays compact (16px) on all viewports.
        // On coarse-pointer (touch) devices the hit area expands to the
        // --control-touch-target token (40px) via a transparent pseudo-element
        // centred on the checkbox, so it is easy to tap without disturbing
        // desktop density.
        "group/checkbox peer relative size-4 shrink-0 rounded-sm border border-interactive bg-component-default outline-none transition-shadow",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        "dark:bg-component-default dark:data-[state=checked]:bg-primary dark:data-[state=indeterminate]:bg-primary",
        // Touch target expansion: transparent pseudo-element on coarse-pointer only.
        "after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
        "touch:after:size-[var(--control-touch-target,2.5rem)]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5 group-data-[state=indeterminate]/checkbox:hidden" />
        <MinusIcon className="hidden size-3.5 group-data-[state=indeterminate]/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
