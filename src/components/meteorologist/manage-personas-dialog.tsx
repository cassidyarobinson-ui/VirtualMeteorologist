"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PersonaDialog, PersonaFormValues } from "./persona-dialog";
import { Persona } from "@/lib/personas";
import { Pencil, Trash2, Copy, Plus, Sparkles, Play } from "lucide-react";
import { toast } from "sonner";

interface ManagePersonasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personas: Persona[];
  activePersonaId?: string;
  onLaunch: (persona: Persona) => void;
  onCreate: (values: PersonaFormValues) => void;
  onEdit: (id: string, values: PersonaFormValues) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Manage Personas / Gems: list every persona with its visibility, and the full
 * CRUD surface — Edit, Duplicate, Delete, plus a Launch button that starts a
 * chat configured with that persona. "New Persona" opens the setup dialog.
 */
export function ManagePersonasDialog({
  open,
  onOpenChange,
  personas,
  activePersonaId,
  onLaunch,
  onCreate,
  onEdit,
  onDuplicate,
  onDelete,
}: ManagePersonasDialogProps) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Persona | null>(null);
  const [deleting, setDeleting] = useState<Persona | null>(null);

  function confirmDelete() {
    if (!deleting) return;
    onDelete(deleting.id);
    toast.success(`Deleted "${deleting.title}"`);
    setDeleting(null);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Personas &amp; Gems</DialogTitle>
            <DialogDescription>
              Create, edit, duplicate, or delete reusable personas. Launch one to
              start a chat with its system instructions applied.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="overflow-hidden rounded-md border border-border">
              <ul className="max-h-[55vh] divide-y divide-border overflow-y-auto">
                {personas.map((p) => (
                  <li key={p.id} className="flex items-start gap-3 px-3 py-2.5">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Sparkles className="size-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {p.title}
                        </span>
                        {p.id === activePersonaId && (
                          <Badge className="text-[10px]">Active</Badge>
                        )}
                        {p.isFeatured && (
                          <Badge variant="secondary" className="text-[10px]">
                            Featured
                          </Badge>
                        )}
                        {p.isPublic ? (
                          <Badge variant="outline" className="text-[10px]">
                            Public
                          </Badge>
                        ) : p.isShared ? (
                          <Badge variant="outline" className="text-[10px]">
                            Team
                          </Badge>
                        ) : null}
                      </div>
                      {p.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {p.description}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {p.defaultParameters.model} · temp{" "}
                        {p.defaultParameters.temperature} ·{" "}
                        {p.defaultParameters.maxTokens} tokens
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5">
                      <IconAction
                        label={`Edit ${p.title}`}
                        onClick={() => setEditing(p)}
                      >
                        <Pencil className="size-4" />
                      </IconAction>
                      <IconAction
                        label={`Duplicate ${p.title}`}
                        onClick={() => {
                          onDuplicate(p.id);
                          toast.success(`Duplicated "${p.title}"`);
                        }}
                      >
                        <Copy className="size-4" />
                      </IconAction>
                      <IconAction
                        label={`Delete ${p.title}`}
                        onClick={() => setDeleting(p)}
                        disabled={p.isFeatured}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </IconAction>
                      <Button
                        size="sm"
                        onClick={() => {
                          onLaunch(p);
                          onOpenChange(false);
                        }}
                      >
                        <Play className="size-3.5" />
                        Launch
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              New Persona
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create */}
      <PersonaDialog
        open={creating}
        onOpenChange={setCreating}
        onSubmit={(v) => {
          onCreate(v);
          toast.success(`Created "${v.title}"`);
        }}
      />

      {/* Edit */}
      <PersonaDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit Persona"
        submitLabel="Save changes"
        initial={
          editing
            ? {
                title: editing.title,
                description: editing.description,
                systemInstructions: editing.systemInstructions,
                defaultParameters: editing.defaultParameters,
                isPublic: editing.isPublic,
                isShared: editing.isShared,
              }
            : undefined
        }
        onSubmit={(v) => {
          if (!editing) return;
          onEdit(editing.id, v);
          toast.success("Persona updated");
          setEditing(null);
        }}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this persona?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `"${deleting.title}" will be removed. This can't be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label.split(" ")[0]}</TooltipContent>
    </Tooltip>
  );
}
