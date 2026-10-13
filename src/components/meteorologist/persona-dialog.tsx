"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  PersonaParameters,
  DEFAULT_PARAMETERS,
  MODEL_OPTIONS,
  parseVariables,
} from "@/lib/personas";

export interface PersonaFormValues {
  title: string;
  description: string;
  systemInstructions: string;
  defaultParameters: PersonaParameters;
  isPublic: boolean;
  isShared: boolean;
}

interface PersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PersonaFormValues) => void;
  initial?: Partial<PersonaFormValues>;
  /** "New Persona" (create) or "Edit Persona". */
  title?: string;
  submitLabel?: string;
}

/**
 * Create/Edit a persona (a "Gem"): the setup panel from the ticket —
 * Name, Description, System Instructions (with live variable detection), and
 * default model parameters (temperature / model / max tokens), plus the
 * team-sharing visibility flags.
 */
export function PersonaDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
  title = "New Persona",
  submitLabel = "Create Persona",
}: PersonaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Define a reusable persona with system instructions and default model
            settings. Use {"{{variables}}"} for inputs you want filled on each run.
          </DialogDescription>
        </DialogHeader>
        {/* Remount per open so fields re-seed from `initial` without a
            setState-in-effect (lint rule). */}
        {open && (
          <PersonaForm
            key={initial?.title ?? "new"}
            initial={initial}
            submitLabel={submitLabel}
            onSubmit={(v) => {
              onSubmit(v);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PersonaForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<PersonaFormValues>;
  submitLabel: string;
  onSubmit: (values: PersonaFormValues) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [systemInstructions, setSystemInstructions] = useState(
    initial?.systemInstructions ?? "",
  );
  const params = initial?.defaultParameters ?? DEFAULT_PARAMETERS;
  const [temperature, setTemperature] = useState(String(params.temperature));
  const [model, setModel] = useState(params.model);
  const [maxTokens, setMaxTokens] = useState(String(params.maxTokens));
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [isShared, setIsShared] = useState(initial?.isShared ?? false);
  const [attempted, setAttempted] = useState(false);

  const titleError = attempted && !title.trim();
  const instructionsError = attempted && !systemInstructions.trim();

  const variables = parseVariables(systemInstructions);

  function handleSubmit() {
    setAttempted(true);
    if (!title.trim() || !systemInstructions.trim()) return;
    const temp = clamp(parseFloat(temperature), 0, 1, DEFAULT_PARAMETERS.temperature);
    const tokens = clampInt(parseInt(maxTokens, 10), 1, 8192, DEFAULT_PARAMETERS.maxTokens);
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      systemInstructions: systemInstructions.trim(),
      defaultParameters: { temperature: temp, model, maxTokens: tokens },
      isPublic,
      isShared,
    });
  }

  return (
    <>
      <div className="max-h-[65vh] space-y-4 overflow-y-auto py-1 pr-1">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="persona-name">
            Name<span className="text-destructive">*</span>
          </Label>
          <Input
            id="persona-name"
            value={title}
            placeholder="e.g. Technical Writer"
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={titleError || undefined}
            autoFocus
          />
          {titleError && (
            <p className="text-xs text-destructive">This field is required.</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="persona-desc">Description</Label>
          <Input
            id="persona-desc"
            value={description}
            placeholder="One line describing what this persona is for."
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* System instructions */}
        <div className="space-y-1.5">
          <Label htmlFor="persona-sys">
            System Instructions<span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="persona-sys"
            rows={8}
            value={systemInstructions}
            placeholder={
              "Define behavior, output format, tone, and constraints.\nUse {{variables}} like {{location}} or {{timeframe}} for runtime inputs."
            }
            onChange={(e) => setSystemInstructions(e.target.value)}
            aria-invalid={instructionsError || undefined}
            className="font-mono text-xs leading-relaxed"
          />
          {instructionsError && (
            <p className="text-xs text-destructive">This field is required.</p>
          )}
          {variables.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Variables detected:{" "}
              {variables.map((v) => (
                <code
                  key={v}
                  className="mr-1 rounded bg-muted px-1 py-0.5 text-[11px] text-foreground"
                >
                  {`{{${v}}}`}
                </code>
              ))}
            </p>
          )}
        </div>

        {/* Default parameters */}
        <fieldset className="space-y-3 rounded-lg border border-border p-3">
          <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Default model parameters
          </legend>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="persona-temp" className="text-xs">
                Temperature
              </Label>
              <Input
                id="persona-temp"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="persona-tokens" className="text-xs">
                Max tokens
              </Label>
              <Input
                id="persona-tokens"
                type="number"
                step="64"
                min="1"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Model</Label>
              <Select value={model} onValueChange={(v) => setModel(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </fieldset>

        {/* Visibility */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Visibility
          </Label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isShared}
              onCheckedChange={(c) => setIsShared(c === true)}
            />
            Share with my team
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isPublic}
              onCheckedChange={(c) => setIsPublic(c === true)}
            />
            Make public (anyone in the org can use)
          </label>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit}>{submitLabel}</Button>
      </DialogFooter>
    </>
  );
}

function clamp(n: number, min: number, max: number, fallback: number): number {
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function clampInt(n: number, min: number, max: number, fallback: number): number {
  if (Number.isNaN(n)) return fallback;
  return Math.round(Math.min(max, Math.max(min, n)));
}
