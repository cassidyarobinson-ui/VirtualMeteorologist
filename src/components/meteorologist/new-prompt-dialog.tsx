"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface NewPromptValues {
  name: string;
  prompt: string;
  isFavorite: boolean;
}

interface NewPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Submit handler; dialog closes on success. */
  onSubmit: (values: NewPromptValues) => void;
  /** Pre-populated values (e.g. when saving from a message bubble). */
  initial?: Partial<NewPromptValues>;
  /** Title bar text — "New Prompt" (create) or "Edit Prompt". */
  title?: string;
  /** Submit button label. */
  submitLabel?: string;
}

/**
 * The "New Prompt" dialog from the ticket screenshot:
 * - Name* (required, inline "This field is required." error)
 * - Prompt* (textarea with helper placeholder)
 * - Favorite checkbox
 * - Footer Create Prompt button
 * Reused for both creating a prompt and saving one from a chat bubble.
 */
export function NewPromptDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
  title = "New Prompt",
  submitLabel = "Create Prompt",
}: NewPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {/* Remount the form each time the dialog opens so it re-seeds from
            `initial` without a setState-in-effect. The key changes on open. */}
        {open && (
          <NewPromptForm
            key={`${initial?.name ?? ""}:${initial?.prompt ?? ""}`}
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

function NewPromptForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<NewPromptValues>;
  submitLabel: string;
  onSubmit: (values: NewPromptValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [isFavorite, setIsFavorite] = useState(initial?.isFavorite ?? false);
  // Validation only surfaces after a submit attempt, matching the screenshot.
  const [attempted, setAttempted] = useState(false);

  const nameError = attempted && !name.trim();
  const promptError = attempted && !prompt.trim();

  function handleSubmit() {
    setAttempted(true);
    if (!name.trim() || !prompt.trim()) return;
    onSubmit({ name: name.trim(), prompt: prompt.trim(), isFavorite });
  }

  return (
    <>
        <div className="space-y-4 py-2">
          {/* Name — required */}
          <div className="grid grid-cols-[80px_1fr] items-start gap-3">
            <Label htmlFor="np-name" className="pt-2 text-right">
              Name<span className="text-destructive">*</span>
            </Label>
            <div className="space-y-1">
              <Input
                id="np-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={nameError || undefined}
                aria-describedby={nameError ? "np-name-error" : undefined}
                autoFocus
              />
              {nameError && (
                <p id="np-name-error" className="text-xs text-destructive">
                  This field is required.
                </p>
              )}
            </div>
          </div>

          {/* Prompt — required */}
          <div className="grid grid-cols-[80px_1fr] items-start gap-3">
            <Label htmlFor="np-prompt" className="pt-2 text-right">
              Prompt<span className="text-destructive">*</span>
            </Label>
            <div className="space-y-1">
              <Textarea
                id="np-prompt"
                rows={6}
                placeholder="Describe what you want the prompt to do."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                aria-invalid={promptError || undefined}
                aria-describedby={promptError ? "np-prompt-error" : undefined}
              />
              {promptError && (
                <p id="np-prompt-error" className="text-xs text-destructive">
                  This field is required.
                </p>
              )}
            </div>
          </div>

          {/* Favorite checkbox */}
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <Label htmlFor="np-fav" className="text-right">
              Favorite
            </Label>
            <Checkbox
              id="np-fav"
              checked={isFavorite}
              onCheckedChange={(c) => setIsFavorite(c === true)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>{submitLabel}</Button>
        </DialogFooter>
    </>
  );
}
