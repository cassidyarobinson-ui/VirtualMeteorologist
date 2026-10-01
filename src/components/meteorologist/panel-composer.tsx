"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptLibraryMenu } from "./prompt-library-menu";
import { SavedPrompt } from "@/lib/prompts";
import { SendHorizontal } from "lucide-react";

interface PanelComposerProps {
  onSend: (text: string) => void;
  prompts: SavedPrompt[];
  onRunSaved: (prompt: SavedPrompt) => void;
  onNewPrompt: () => void;
  onManage: () => void;
}

/**
 * Bottom composer. The Prompt Library button sits to the left of the input
 * (per the ticket: "menu from a new button next to the input"), with a Send
 * button on the right.
 */
export function PanelComposer({
  onSend,
  prompts,
  onRunSaved,
  onNewPrompt,
  onManage,
}: PanelComposerProps) {
  const [text, setText] = useState("");
  const isValid = text.trim().length > 0;

  function send() {
    if (!isValid) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div className="border-t border-border bg-card p-3">
      <div className="flex items-end gap-1.5">
        {/* Prompt Library — the "new button next to the input" */}
        <div className="pb-0.5">
          <PromptLibraryMenu
            prompts={prompts}
            onRun={onRunSaved}
            onNewPrompt={onNewPrompt}
            onManage={onManage}
          />
        </div>

        <div className="flex flex-1 items-end rounded-lg border border-border bg-background focus-within:border-border-interactive focus-within:ring-2 focus-within:ring-ring/40">
          <Textarea
            aria-label="Message the Virtual Meteorologist"
            placeholder="Type your message…"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="min-h-9 resize-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0"
          />
          <div className="p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  onClick={send}
                  disabled={!isValid}
                  aria-label="Send message"
                >
                  <SendHorizontal className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
