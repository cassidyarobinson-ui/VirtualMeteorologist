"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { humanizeVariable } from "@/lib/personas";

export interface VariableFillRequest {
  /** Title of the template/persona being filled. */
  title: string;
  /** Raw text containing {{variables}}. */
  text: string;
  /** Variable names to collect. */
  variables: string[];
}

interface VariableFillDialogProps {
  request: VariableFillRequest | null;
  onOpenChange: (open: boolean) => void;
  /** Called with the collected values when the user confirms. */
  onSubmit: (values: Record<string, string>) => void;
}

/**
 * When a template or persona-seeded prompt contains {{variables}}, prompt the
 * user to fill them before the text is loaded into the composer. Mirrors how a
 * Gemini-style template collects placeholder inputs on invocation.
 */
export function VariableFillDialog({
  request,
  onOpenChange,
  onSubmit,
}: VariableFillDialogProps) {
  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fill in details</DialogTitle>
          <DialogDescription>
            {request
              ? `"${request.title}" needs a few inputs before it runs.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        {request && (
          <VariableFillForm
            key={request.text}
            request={request}
            onSubmit={(values) => {
              onSubmit(values);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function VariableFillForm({
  request,
  onSubmit,
}: {
  request: VariableFillRequest;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(request.variables.map((v) => [v, ""])),
  );

  function handleSubmit() {
    onSubmit(values);
  }

  return (
    <>
      <div className="space-y-3 py-1">
        {request.variables.map((v, i) => (
          <div key={v} className="space-y-1.5">
            <Label htmlFor={`var-${v}`}>{humanizeVariable(v)}</Label>
            <Input
              id={`var-${v}`}
              value={values[v]}
              placeholder={`Enter ${humanizeVariable(v).toLowerCase()}`}
              autoFocus={i === 0}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [v]: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Insert</Button>
      </DialogFooter>
    </>
  );
}
