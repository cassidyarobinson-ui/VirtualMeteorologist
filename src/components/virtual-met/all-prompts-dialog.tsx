"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { VMPrompt } from "@/lib/virtual-met";
import { Pencil, Trash2, ArrowUp } from "lucide-react";
import { toast } from "sonner";

interface AllPromptsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: VMPrompt[];
  onRun: (prompt: VMPrompt) => void;
  onEdit: (prompt: VMPrompt) => void;
  onDelete: (id: string) => void;
}

/**
 * "All Prompts" modal: a TITLE / ACTIONS table where each row has edit, delete,
 * and run (↑) actions. Prompts are created by saving/pinning messages from the
 * chat, so there is no "New Prompt" button here.
 */
export function AllPromptsDialog({
  open,
  onOpenChange,
  prompts,
  onRun,
  onEdit,
  onDelete,
}: AllPromptsDialogProps) {
  const [deleting, setDeleting] = useState<VMPrompt | null>(null);

  function confirmDelete() {
    if (!deleting) return;
    onDelete(deleting.id);
    toast.info(`Deleted "${deleting.title}"`);
    setDeleting(null);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>All Prompts</DialogTitle>
            <DialogDescription>
              View, favorite, edit, delete, or run your saved prompts.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-hidden rounded-md border border-border">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-border bg-muted/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>Title</span>
              <span className="pr-1">Actions</span>
            </div>

            {prompts.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                You haven&apos;t created any prompts yet.
              </p>
            ) : (
              <ul className="max-h-[46vh] divide-y divide-border overflow-y-auto">
                {prompts.map((p) => (
                  <li
                    key={p.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {p.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.prompt}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <RowAction label="Edit" onClick={() => onEdit(p)}>
                        <Pencil className="size-4" />
                      </RowAction>
                      <RowAction label="Delete" onClick={() => setDeleting(p)}>
                        <Trash2 className="size-4 text-destructive" />
                      </RowAction>
                      <RowAction
                        label="Run"
                        onClick={() => {
                          onRun(p);
                          onOpenChange(false);
                        }}
                      >
                        <ArrowUp className="size-4" />
                      </RowAction>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
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

function RowAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
