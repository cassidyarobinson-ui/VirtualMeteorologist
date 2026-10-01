"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// ─── Normalization helpers ────────────────────────────────────────────────────

/**
 * Normalizes a data-* attribute value to a boolean.
 *
 * JSX bare attributes (`<Field data-invalid>`) compile to `true` (boolean).
 * Explicit false values (`false` boolean or "false" string) → false.
 * Everything else (true, "", "true", any other string) → true.
 */
function normalizeBoolAttr(value: boolean | string | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (value === false || value === "false") return false;
  return true;
}

// ─── Field Context ────────────────────────────────────────────────────────────
//
// Design rules for consumers:
//
//  1. Explicit props on a control ALWAYS win over context values.
//  2. aria-describedby composition: explicit value is prepended; context IDs
//     are ONLY included when the corresponding FieldDescription/FieldError
//     elements are actually rendered (registered). Missing IDs are never
//     included — no phantom references.
//  3. FieldDescription and FieldError register their *effective* IDs
//     (explicit override or generated) via useEffect on mount.
//  4. FieldContextValue is null when a control is outside any Field.

export interface FieldContextValue {
  /** id for the primary form control. FieldLabel htmlFor points here. */
  controlId: string;
  /**
   * The auto-generated label id (`${controlId}-label`).
   * aria-labelledby consumers fall back to this when FieldLabel has not yet
   * registered (first render) or is not present.
   */
  labelId: string;
  /**
   * The auto-generated ID that FieldDescription should adopt when no
   * explicit id prop is provided.
   */
  generatedDescriptionId: string;
  /**
   * The auto-generated ID that FieldError should adopt when no
   * explicit id prop is provided.
   */
  generatedErrorId: string;
  /**
   * The effective label ID that aria-labelledby consumers (e.g. Slider)
   * must reference. ONLY defined after FieldLabel has registered.
   *
   * When FieldLabel has an explicit `id` prop (e.g. id="custom-label"), this
   * will be "custom-label" rather than the generated labelId — ensuring
   * aria-labelledby always points at the element that is actually in the DOM.
   *
   * Falls back to `labelId` (generated) when undefined (first render or
   * no FieldLabel present).
   */
  activeLabelId: string | undefined;
  /** Called by FieldLabel on mount to register its effective ID. */
  registerLabel: (id: string) => void;
  /** Called by FieldLabel on unmount to deregister. */
  unregisterLabel: () => void;
  /**
   * The effective description ID that controls must reference in
   * aria-describedby. ONLY defined when a FieldDescription is actually
   * rendered in the tree. Controls must not add this ID when undefined.
   */
  activeDescriptionId: string | undefined;
  /**
   * The effective error ID that controls must reference in aria-describedby.
   * ONLY defined when a FieldError with renderable content is in the tree.
   * Controls must not add this ID when undefined.
   */
  activeErrorId: string | undefined;
  /** Called by FieldDescription on mount to register its effective ID. */
  registerDescription: (id: string) => void;
  /** Called by FieldDescription on unmount to deregister. */
  unregisterDescription: () => void;
  /** Called by FieldError when renderable content exists. */
  registerError: (id: string) => void;
  /** Called by FieldError when content disappears or on unmount. */
  unregisterError: () => void;
  /** Whether the field is in an invalid/error state. */
  invalid: boolean;
  /** Whether the field is required. */
  required: boolean;
  /** Whether the field is disabled. */
  disabled: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

/**
 * Returns the nearest Field context value, or null when used outside a Field.
 */
export function useField(): FieldContextValue | null {
  return React.useContext(FieldContext);
}

/**
 * Composes an aria-describedby string from an explicit consumer value and the
 * active Field context IDs.
 *
 * Rules:
 *  - Only IDs that are actively registered (components rendered) are included.
 *  - Explicit value is preserved at the front.
 *  - Returns undefined when the result would be empty.
 */
export function composeAriaDescribedBy(
  explicit: string | undefined,
  field: FieldContextValue | null,
): string | undefined {
  if (!field) return explicit || undefined;
  const contextIds = [field.activeDescriptionId, field.activeErrorId]
    .filter(Boolean)
    .join(" ");
  const composed = [explicit, contextIds].filter(Boolean).join(" ");
  return composed || undefined;
}

// --- Prop Types ---

export type FieldSetProps = React.ComponentProps<"fieldset">;

export type FieldLegendProps = React.ComponentProps<"legend"> & {
  variant?: "legend" | "label";
};

export type FieldGroupProps = React.ComponentProps<"div">;

export type FieldProps = React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    /**
     * Base ID for generating the control/label/description/error IDs.
     *
     * This is NOT the wrapper div's HTML id — pass `id` for that.
     * When omitted, a stable unique ID is auto-generated via React.useId().
     *
     * Example: <Field controlId="email"> results in:
     *   controlId      = "email"
     *   labelId        = "email-label"
     *   descriptionId  = "email-description"
     *   errorId        = "email-error"
     */
    controlId?: string;
    /**
     * Marks the field as invalid. Propagates aria-invalid to the form control
     * and applies destructive colouring to label/error text.
     *
     * Legacy: also recognised via `data-invalid` attribute (any truthy value
     * including bare presence). Both forms feed the same context state.
     */
    invalid?: boolean;
    /**
     * Marks the field as required. Propagates the required attribute to the
     * form control inside the field.
     */
    required?: boolean;
    /**
     * Marks the field as disabled. Propagates disabled to the form control
     * and reduces label opacity.
     *
     * Legacy: also recognised via `data-disabled` attribute (any truthy value
     * including bare presence). Both forms feed the same context state.
     */
    disabled?: boolean;
    /**
     * Legacy attribute. Any truthy value (true, "", "true") marks the field
     * as invalid — same effect as the `invalid` prop. Preserved for backwards
     * compatibility with existing consumers.
     * @deprecated Prefer the `invalid` prop.
     */
    "data-invalid"?: boolean | string;
    /**
     * Legacy attribute. Any truthy value (true, "true") marks the field as
     * disabled — same effect as the `disabled` prop. Preserved for backwards
     * compatibility with existing consumers.
     * @deprecated Prefer the `disabled` prop.
     */
    "data-disabled"?: boolean | string;
  };

export type FieldContentProps = React.ComponentProps<"div">;
export type FieldLabelProps = Omit<React.ComponentProps<typeof Label>, "htmlFor"> & {
  /**
   * The HTML `for` attribute linking this label to a form control.
   *
   *  - `string`    — explicit id; takes precedence over the Field context controlId.
   *  - `undefined` — (default) auto-derived from `Field.controlId` when inside a Field.
   *  - `null`      — explicit opt-out: do not emit an `htmlFor` attribute.
   *                  Use this when the label names an aria-labelledby-only widget
   *                  (e.g. Slider) where there is no focusable element with a matching
   *                  `id` — a dangling `htmlFor` misleads AT and causes ARIA validation
   *                  errors.
   */
  htmlFor?: string | null;
};
export type FieldTitleProps = React.ComponentProps<"div">;
export type FieldDescriptionProps = React.ComponentProps<"p">;

export type FieldSeparatorProps = React.ComponentProps<"div"> & {
  children?: React.ReactNode;
};

export type FieldErrorProps = React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
};

// --- Variants ---

const fieldVariants = cva(
  "group/field [&[data-invalid]:not([data-invalid=false])]:text-destructive flex w-full gap-1",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px has-[>[data-slot=field-content]]:items-start",
        ],
        responsive: [
          "@md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto flex-col [&>*]:w-full [&>.sr-only]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

// --- Components ---

function FieldSet({ className, ...props }: FieldSetProps) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: FieldLegendProps) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-2 text-sm font-normal leading-4",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: FieldGroupProps) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

function Field({
  className,
  orientation = "vertical",
  // -- Fix 4: separate control-base ID from the wrapper div's HTML id --
  // `controlId` drives all generated sub-IDs (label, description, error).
  // `id` is the native HTML id of the wrapper div; passes through unchanged.
  controlId: controlIdProp,
  id,
  // -- Explicit state props --
  invalid: invalidProp = false,
  required = false,
  disabled: disabledProp = false,
  // -- Fix 1: legacy data-* attribute compatibility --
  // Extracted so they feed context; they are also re-applied to the div via
  // dataStateProps so existing CSS selectors continue to work.
  "data-invalid": dataInvalid,
  "data-disabled": dataDisabled,
  ...props
}: FieldProps) {
  const generatedId = React.useId();
  const baseId = controlIdProp ?? `field-${generatedId.replace(/:/g, "")}`;

  // Fix 1: normalise legacy data-* attributes alongside explicit props.
  // Truthy: true | "" | "true" | any other non-false string
  // Falsy:  undefined | false | "false"
  const isInvalid =
    invalidProp ||
    normalizeBoolAttr(dataInvalid as boolean | string | undefined);
  const isDisabled =
    disabledProp ||
    normalizeBoolAttr(dataDisabled as boolean | string | undefined);

  const controlId = baseId;
  const labelId = `${baseId}-label`;
  const generatedDescriptionId = `${baseId}-description`;
  const generatedErrorId = `${baseId}-error`;

  // Fix 2/3: registration state — only populated when child components mount.
  const [activeDescriptionId, setActiveDescriptionId] = React.useState<
    string | undefined
  >(undefined);
  const [activeErrorId, setActiveErrorId] = React.useState<
    string | undefined
  >(undefined);
  // Fix 1 (label registration): activeLabelId tracks the effective id of the
  // rendered FieldLabel so aria-labelledby consumers reference the right element.
  const [activeLabelId, setActiveLabelId] = React.useState<
    string | undefined
  >(undefined);

  // Stable callbacks so FieldDescription/FieldError can safely include them
  // in useEffect dependency arrays without infinite re-registration.
  const registerDescription = React.useCallback((registeredId: string) => {
    setActiveDescriptionId(registeredId);
  }, []);
  const unregisterDescription = React.useCallback(() => {
    setActiveDescriptionId(undefined);
  }, []);
  const registerError = React.useCallback((registeredId: string) => {
    setActiveErrorId(registeredId);
  }, []);
  const unregisterError = React.useCallback(() => {
    setActiveErrorId(undefined);
  }, []);
  const registerLabel = React.useCallback((registeredId: string) => {
    setActiveLabelId(registeredId);
  }, []);
  const unregisterLabel = React.useCallback(() => {
    setActiveLabelId(undefined);
  }, []);

  const contextValue = React.useMemo<FieldContextValue>(
    () => ({
      controlId,
      labelId,
      generatedDescriptionId,
      generatedErrorId,
      activeLabelId,
      registerLabel,
      unregisterLabel,
      activeDescriptionId,
      activeErrorId,
      registerDescription,
      unregisterDescription,
      registerError,
      unregisterError,
      invalid: isInvalid,
      required,
      disabled: isDisabled,
    }),
    [
      controlId,
      labelId,
      generatedDescriptionId,
      generatedErrorId,
      activeLabelId,
      registerLabel,
      unregisterLabel,
      activeDescriptionId,
      activeErrorId,
      registerDescription,
      unregisterDescription,
      registerError,
      unregisterError,
      isInvalid,
      required,
      isDisabled,
    ],
  );

  // Re-apply data-* CSS hooks so existing visual selectors are unaffected.
  const dataStateProps: Record<string, unknown> = {};
  if (isInvalid) dataStateProps["data-invalid"] = true;
  if (isDisabled) dataStateProps["data-disabled"] = "true";

  return (
    <FieldContext.Provider value={contextValue}>
      <div
        role="group"
        data-slot="field"
        data-orientation={orientation}
        id={id}
        className={cn(fieldVariants({ orientation }), className)}
        {...dataStateProps}
        {...props}
      />
    </FieldContext.Provider>
  );
}

function FieldContent({ className, ...props }: FieldContentProps) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-1 leading-snug",
        className,
      )}
      {...props}
    />
  );
}

/**
 * FieldLabel wraps the Radix Label and auto-wires:
 *  - `id` to the effective label id (explicit ?? context.labelId)
 *  - `htmlFor` to `context.controlId`
 *
 * The effective id is registered in context so aria-labelledby consumers
 * (e.g. Slider) always reference the element that is actually in the DOM,
 * including when the consumer has provided an explicit custom id.
 *
 * Explicit `id` / `htmlFor` props always override context values.
 */
function FieldLabel({ className, htmlFor, id, variant, ...props }: FieldLabelProps) {
  const field = useField();
  // Effective id: explicit prop wins, then the generated label id.
  const effectiveLabelId = id ?? field?.labelId;

  // Register effective id so aria-labelledby consumers get the right value.
  React.useEffect(() => {
    if (!field || !effectiveLabelId) return;
    field.registerLabel(effectiveLabelId);
    return () => field.unregisterLabel();
    // registerLabel and unregisterLabel are stable useCallbacks.
  }, [effectiveLabelId, field?.registerLabel, field?.unregisterLabel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Label
      data-slot="field-label"
      id={effectiveLabelId}
      variant={variant}
      // null = explicit opt-out (aria-labelledby-only widget); undefined = no htmlFor.
      htmlFor={htmlFor === null ? undefined : (htmlFor ?? field?.controlId)}
      className={cn(
        // leading-4 is correct for the default field-label role (12px/16px).
        // For variant="option" (text-base 13px/18px), omit leading-4 so the
        // token's own 18px line-height (via --text-base--line-height) is used.
        variant === "option"
          ? "group/field-label peer/field-label flex w-fit gap-2 group-[[data-disabled]:not([data-disabled=false])]/field:opacity-50"
          : "group/field-label peer/field-label flex w-fit gap-2 leading-4 group-[[data-disabled]:not([data-disabled=false])]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>[data-slot=field]]:p-4",
        "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
        className,
      )}
      {...props}
    />
  );
}

// Intentionally uses data-slot="field-label" to share label slot styling with FieldLabel
function FieldTitle({ className, ...props }: FieldTitleProps) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-normal leading-4 group-[[data-disabled]:not([data-disabled=false])]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/**
 * FieldDescription renders helper/hint text and registers its effective ID in
 * context so controls can include it in aria-describedby.
 *
 * Registration rules:
 *  - Effective ID = explicit `id` prop ?? context.generatedDescriptionId
 *  - Registers on mount via useEffect; deregisters on unmount.
 *  - Controls only reference this ID while this element is in the DOM.
 */
function FieldDescription({
  className,
  id,
  ...props
}: FieldDescriptionProps) {
  const field = useField();
  // Fix 3: explicit id prop wins over the generated one.
  const effectiveId = id ?? field?.generatedDescriptionId;

  // Fix 2/3: register the effective ID so controls reference the right value.
  React.useEffect(() => {
    if (!field || !effectiveId) return;
    field.registerDescription(effectiveId);
    return () => field.unregisterDescription();
    // registerDescription and unregisterDescription are stable useCallbacks.
  }, [effectiveId, field?.registerDescription, field?.unregisterDescription]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <p
      data-slot="field-description"
      id={effectiveId}
      className={cn(
        "text-muted-foreground text-sm font-normal leading-4 group-has-[[data-orientation=horizontal]]/field:text-balance",
        "nth-last-2:-mt-1 last:mt-0 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: FieldSeparatorProps) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

/**
 * FieldError renders validation error messages and registers its effective ID
 * in context so controls can include it in aria-describedby.
 *
 * Registration rules:
 *  - Only registers when the component has renderable content.
 *  - Effective ID = explicit `id` prop ?? context.generatedErrorId
 *  - Deregisters when content becomes null or on unmount.
 *  - role="alert" triggers live announcements when errors appear dynamically.
 */
function FieldError({
  className,
  id,
  children,
  errors,
  ...props
}: FieldErrorProps) {
  const field = useField();

  const content = useMemo(() => {
    if (children) return children;
    if (!errors) return null;
    if (errors.length === 1 && errors[0]?.message) return errors[0].message;
    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {errors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  const hasContent = content !== null;
  // Fix 3: explicit id wins over generated.
  const effectiveId = id ?? field?.generatedErrorId;

  // Fix 2/3: register only when content is present, using the effective ID.
  React.useEffect(() => {
    if (!field || !effectiveId) return;
    if (hasContent) {
      field.registerError(effectiveId);
    } else {
      field.unregisterError();
    }
    return () => field.unregisterError();
    // registerError and unregisterError are stable useCallbacks.
  }, [hasContent, effectiveId, field?.registerError, field?.unregisterError]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!content) return null;

  return (
    <div
      role="alert"
      data-slot="field-error"
      id={effectiveId}
      className={cn(
        "text-destructive text-sm font-normal leading-4",
        className,
      )}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
