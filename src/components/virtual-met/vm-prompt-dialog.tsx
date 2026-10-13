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

export interface VMPromptValues {
  name: string;
  prompt: string;
  isPinned: boolean;
}

interface VMPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: VMPromptValues) => void;
  initial?: Partial<VMPromptValues>;
  /** "New Prompt" or "Edit Prompt". */
  title?: string;
  /** "Save" (new/edit) per the mockup. */
  submitLabel?: string;
}

/**
 * Save / Edit Prompt modal from the mockups: Name, Prompt, "Pin at top"
 * checkbox, Cancel + Save. Shows the required-field error state after a submit
 * attempt ("This field is required." with red fields).
 */
export function VMPromptDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
  title = "New Prompt",
  submitLabel = "Save",
}: VMPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {open && (
          <VMPromptForm
            key={`${initial?.name ?? ""}:${initial?.prompt ?? ""}`}
            initial={initial}
            submitLabel={submitLabel}
            onCancel={() => onOpenChange(false)}
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

function VMPromptForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: Partial<VMPromptValues>;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: VMPromptValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [isPinned, setIsPinned] = useState(initial?.isPinned ?? false);
  const [attempted, setAttempted] = useState(false);

  const nameError = attempted && !name.trim();
  const promptError = attempted && !prompt.trim();

  function handleSubmit() {
    setAttempted(true);
    if (!name.trim() || !prompt.trim()) return;
    onSubmit({ name: name.trim(), prompt: prompt.trim(), isPinned });
  }

  return (
    <>
      <div className="space-y-4 py-1">
        {/* Name */}
        <div className="grid grid-cols-[72px_1fr] items-start gap-3">
          <Label htmlFor="vm-name" className="pt-2">
            Name
          </Label>
          <div className="space-y-1">
            <Input
              id="vm-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={nameError || undefined}
              autoFocus
            />
            {nameError && (
              <p className="text-xs text-destructive">This field is required.</p>
            )}
          </div>
        </div>

        {/* Prompt */}
        <div className="grid grid-cols-[72px_1fr] items-start gap-3">
          <Label htmlFor="vm-prompt" className="pt-2">
            Prompt
          </Label>
          <div className="space-y-1">
            <Textarea
              id="vm-prompt"
              rows={4}
              placeholder="Describe what you want the prompt to do."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-invalid={promptError || undefined}
            />
            {promptError && (
              <p className="text-xs text-destructive">This field is required.</p>
            )}
          </div>
        </div>

        {/* Pin at top */}
        <div className="grid grid-cols-[72px_1fr] items-center gap-3">
          <Label htmlFor="vm-pin">Pin at top</Label>
          <Checkbox
            id="vm-pin"
            checked={isPinned}
            onCheckedChange={(c) => setIsPinned(c === true)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>{submitLabel}</Button>
      </DialogFooter>
    </>
  );
}
