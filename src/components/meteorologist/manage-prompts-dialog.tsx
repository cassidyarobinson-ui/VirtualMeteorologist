"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { NewPromptDialog } from "./new-prompt-dialog";
import { SavedPrompt } from "@/lib/prompts";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManagePromptsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: SavedPrompt[];
  onRun: (prompt: SavedPrompt) => void;
  onEdit: (id: string, changes: { title?: string; prompt?: string; isFavorite?: boolean }) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onNewPrompt: () => void;
}

/**
 * Manage Prompts: a list of every saved prompt with Title, a Favorite
 * checkbox, Edit (opens the New/Edit dialog), Delete (trash + confirm), and a
 * blue Run button that runs the prompt in the Virtual Meteorologist.
 */
export function ManagePromptsDialog({
  open,
  onOpenChange,
  prompts,
  onRun,
  onEdit,
  onDelete,
  onToggleFavorite,
  onNewPrompt,
}: ManagePromptsDialogProps) {
  const [editing, setEditing] = useState<SavedPrompt | null>(null);
  const [deleting, setDeleting] = useState<SavedPrompt | null>(null);

  function confirmDelete() {
    if (!deleting) return;
    onDelete(deleting.id);
    toast.success(`Deleted "${deleting.title}"`);
    setDeleting(null);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage Prompts</DialogTitle>
            <DialogDescription>
              View, favorite, edit, delete, or run your saved prompts.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {prompts.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                You haven&apos;t saved any prompts yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Title</span>
                  <span className="pr-1">Actions</span>
                </div>
                <ul className="max-h-[50vh] divide-y divide-border overflow-y-auto">
                  {prompts.map((p) => (
                    <li
                      key={p.id}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2"
                    >
                      {/* Favorite checkbox */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center">
                            <Checkbox
                              checked={p.isFavorite}
                              onCheckedChange={() => onToggleFavorite(p.id)}
                              aria-label={
                                p.isFavorite
                                  ? `Unfavorite ${p.title}`
                                  : `Favorite ${p.title}`
                              }
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {p.isFavorite ? "Favorited" : "Mark favorite"}
                        </TooltipContent>
                      </Tooltip>

                      {/* Title + prompt preview */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {p.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.prompt}
                        </p>
                      </div>

                      {/* Actions: Edit, Delete, Run */}
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Edit ${p.title}`}
                              onClick={() => setEditing(p)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${p.title}`}
                              onClick={() => setDeleting(p)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                        <Button
                          size="sm"
                          onClick={() => {
                            onRun(p);
                            onOpenChange(false);
                          }}
                        >
                          Run
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={onNewPrompt}>
              <Plus className="size-4" />
              New prompt
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit via the shared New/Edit dialog */}
      <NewPromptDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit Prompt"
        submitLabel="Save changes"
        initial={
          editing
            ? {
                name: editing.title,
                prompt: editing.prompt,
                isFavorite: editing.isFavorite,
              }
            : undefined
        }
        onSubmit={(v) => {
          if (!editing) return;
          onEdit(editing.id, {
            title: v.name,
            prompt: v.prompt,
            isFavorite: v.isFavorite,
          });
          toast.success("Prompt updated");
          setEditing(null);
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `"${deleting.title}" will be removed from your library. This can't be undone.`
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
