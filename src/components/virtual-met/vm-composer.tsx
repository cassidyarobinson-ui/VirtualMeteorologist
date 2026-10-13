"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptsDropdown } from "./prompts-dropdown";
import { VMPrompt, MY_CREDITS } from "@/lib/virtual-met";
import { Settings, BarChart3, ArrowUp } from "lucide-react";

interface VMComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string) => void;
  prompts: VMPrompt[];
  onSelectPrompt: (p: VMPrompt) => void;
  onTogglePin: (id: string) => void;
  onNewPrompt: () => void;
  onAllPrompts: () => void;
  onClearHistory: () => void;
  onOpenCredits: () => void;
}

const MIN_HEIGHT = 40;
const MAX_HEIGHT = 140;

/**
 * The composer footer from the mockup: a borderless textarea wrapped in a
 * bordered CTA, with a "+" prompts button and settings gear on the left, a
 * credits meter in the footer, and a round send button. "This footer … shares
 * how many credits are used so far."
 */
export function VMComposer({
  value,
  onChange,
  onSend,
  prompts,
  onSelectPrompt,
  onTogglePin,
  onNewPrompt,
  onAllPrompts,
  onClearHistory,
  onOpenCredits,
}: VMComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const isValid = value.trim().length > 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [value]);

  function send() {
    if (!isValid) return;
    onSend(value.trim());
    onChange("");
  }

  const pct = Math.min(100, Math.round((MY_CREDITS.used / MY_CREDITS.total) * 100));

  return (
    <div className="border-t border-border bg-card p-3">
      {/* Bordered wrapper around the textarea */}
      <div className="rounded-xl border border-border bg-background px-2 pt-1.5 pb-1 focus-within:border-border-interactive focus-within:ring-2 focus-within:ring-ring/40">
        <textarea
          ref={ref}
          aria-label="Message the Virtual Meteorologist"
          placeholder="Tell me about the WBGT and Wind Gust today…"
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          style={{ height: MIN_HEIGHT }}
          className="w-full resize-none border-0 bg-transparent px-1 py-1 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />

        {/* Footer row: prompts + settings · credits meter · send */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5">
            <PromptsDropdown
              prompts={prompts}
              onSelect={onSelectPrompt}
              onTogglePin={onTogglePin}
              onNewPrompt={onNewPrompt}
              onAllPrompts={onAllPrompts}
            />

            {/* Settings gear "…" menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Settings">
                      <Settings className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" side="top" className="min-w-52">
                <DropdownMenuItem onSelect={onClearHistory}>
                  Delete all chat history
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Preferences (Future)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onOpenCredits}>
                  Credits
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Credits meter */}
            <button
              type="button"
              onClick={onOpenCredits}
              className="ml-1 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              title="View credits"
            >
              <BarChart3 className="size-3.5" />
              <span className="tabular-nums">
                {MY_CREDITS.used} / {MY_CREDITS.total.toLocaleString()} credits used
              </span>
              {/* thin usage bar */}
              <span className="ml-1 hidden h-1 w-10 overflow-hidden rounded-full bg-muted sm:block">
                <span
                  className="block h-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </span>
            </button>
          </div>

          <Button
            size="icon-sm"
            className="rounded-full"
            onClick={send}
            disabled={!isValid}
            aria-label="Send message"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
