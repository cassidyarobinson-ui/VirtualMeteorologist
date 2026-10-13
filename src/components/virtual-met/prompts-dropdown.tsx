"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VMPrompt } from "@/lib/virtual-met";
import { Plus, Pin, List } from "lucide-react";

interface PromptsDropdownProps {
  prompts: VMPrompt[];
  /** Run a prompt (loads into composer). */
  onSelect: (prompt: VMPrompt) => void;
  /** Toggle a prompt's pinned state from the row pin icon. */
  onTogglePin: (id: string) => void;
  onNewPrompt: () => void;
  onAllPrompts: () => void;
}

/**
 * The prompt dropdown opened from the composer "+" button. Pinned prompts sit
 * at the top under "Pinned Prompts" (each with a pin toggle), followed by the
 * rest of the list, then an "All Prompts" entry. Matches the Landing Page
 * dropdown mockup.
 */
export function PromptsDropdown({
  prompts,
  onSelect,
  onTogglePin,
  onNewPrompt,
  onAllPrompts,
}: PromptsDropdownProps) {
  const pinned = prompts.filter((p) => p.isPinned);
  const rest = prompts.filter((p) => !p.isPinned);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Prompts">
              <Plus className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Prompts</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" side="top" className="min-w-56">
        {pinned.length > 0 && (
          <>
            <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Pinned Prompts
            </DropdownMenuLabel>
            {pinned.map((p) => (
              <PromptRow
                key={p.id}
                prompt={p}
                onSelect={() => onSelect(p)}
                onTogglePin={() => onTogglePin(p.id)}
              />
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        <div className="max-h-56 overflow-y-auto">
          {rest.map((p) => (
            <PromptRow
              key={p.id}
              prompt={p}
              onSelect={() => onSelect(p)}
              onTogglePin={() => onTogglePin(p.id)}
            />
          ))}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onNewPrompt}>
          <Plus />
          New prompt
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onAllPrompts}>
          <List />
          All Prompts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PromptRow({
  prompt,
  onSelect,
  onTogglePin,
}: {
  prompt: VMPrompt;
  onSelect: () => void;
  onTogglePin: () => void;
}) {
  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className="group flex items-center justify-between gap-2"
    >
      <span className="truncate">{prompt.title}</span>
      {/* Pin toggle — stop the select so toggling doesn't run the prompt. */}
      <button
        type="button"
        aria-label={prompt.isPinned ? "Unpin" : "Pin to top"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTogglePin();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Pin
          className={`size-3.5 ${prompt.isPinned ? "fill-current text-primary" : ""}`}
        />
      </button>
    </DropdownMenuItem>
  );
}
