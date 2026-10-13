"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptLibraryMenu } from "./prompt-library-menu";
import { GemsMenu } from "./gems-menu";
import { SavedPrompt } from "@/lib/prompts";
import { Persona, PromptTemplate } from "@/lib/personas";
import { SendHorizontal, Sparkles, SquareSlash } from "lucide-react";

interface PanelComposerProps {
  /** Current input text (controlled by the parent so suggestions/saved
   *  prompts can be loaded into the field for editing before running). */
  value: string;
  onChange: (text: string) => void;
  onSend: (text: string) => void;

  // Saved prompt library
  prompts: SavedPrompt[];
  onLoadSaved: (prompt: SavedPrompt) => void;
  onNewPrompt: () => void;
  onManage: () => void;

  // Personas / templates for @ and / invocation
  personas: Persona[];
  templates: PromptTemplate[];
  /** Activate a persona for the thread (via @mention or Gems launcher). */
  onActivatePersona: (persona: Persona) => void;
  /** Insert a template's text into the input (prompts for variables upstream). */
  onInsertTemplate: (template: PromptTemplate) => void;
  onNewPersona: () => void;
  onManagePersonas: () => void;
}

const MIN_HEIGHT = 44;
const MAX_HEIGHT = 160;

type Trigger = { kind: "@" | "/"; query: string; start: number };

/**
 * Detect an in-progress @persona or /template mention immediately before the
 * caret. Returns null when the caret isn't in a trigger token.
 */
function detectTrigger(text: string, caret: number): Trigger | null {
  // Look back from the caret to the trigger char, stopping at whitespace.
  let i = caret - 1;
  while (i >= 0 && !/\s/.test(text[i])) {
    if (text[i] === "@" || text[i] === "/") {
      // Trigger must start the token (preceded by whitespace or start).
      if (i === 0 || /\s/.test(text[i - 1])) {
        return {
          kind: text[i] as "@" | "/",
          query: text.slice(i + 1, caret),
          start: i,
        };
      }
      return null;
    }
    i--;
  }
  return null;
}

export function PanelComposer({
  value,
  onChange,
  onSend,
  prompts,
  onLoadSaved,
  onNewPrompt,
  onManage,
  personas,
  templates,
  onActivatePersona,
  onInsertTemplate,
  onNewPersona,
  onManagePersonas,
}: PanelComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [highlight, setHighlight] = useState(0);
  const isValid = value.trim().length > 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [value]);

  // Build the suggestion list for the active trigger.
  const suggestions = (() => {
    if (!trigger) return [];
    const q = trigger.query.toLowerCase();
    if (trigger.kind === "@") {
      return personas
        .filter((p) => p.title.toLowerCase().includes(q))
        .slice(0, 6)
        .map((p) => ({ id: p.id, label: p.title, sub: p.description, persona: p }));
    }
    return templates
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((t) => ({ id: t.id, label: t.title, sub: t.templateText, template: t }));
  })();

  function syncTrigger(text: string, caret: number) {
    const t = detectTrigger(text, caret);
    setTrigger(t);
    setHighlight(0);
  }

  function removeTriggerToken(sel: Trigger) {
    const el = textareaRef.current;
    const caret = el ? el.selectionStart : value.length;
    // Remove the "@query" / "/query" token the user typed.
    const before = value.slice(0, sel.start);
    const after = value.slice(caret);
    const joiner = after.startsWith(" ") || after === "" ? "" : "";
    onChange(before + after.replace(/^\s*/, joiner));
  }

  function choose(index: number) {
    const s = suggestions[index];
    if (!s || !trigger) return;
    if ("persona" in s && s.persona) {
      removeTriggerToken(trigger);
      onActivatePersona(s.persona);
    } else if ("template" in s && s.template) {
      removeTriggerToken(trigger);
      onInsertTemplate(s.template);
    }
    setTrigger(null);
  }

  function send() {
    if (!isValid) return;
    onSend(value.trim());
    onChange("");
    setTrigger(null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (trigger && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => (h + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        choose(highlight);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setTrigger(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="relative border-t border-border bg-card p-3">
      {/* @ / autocomplete popover */}
      {trigger && suggestions.length > 0 && (
        <div className="absolute inset-x-3 bottom-full z-20 mb-1 overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {trigger.kind === "@" ? (
              <>
                <Sparkles className="size-3" /> Personas
              </>
            ) : (
              <>
                <SquareSlash className="size-3" /> Prompt templates
              </>
            )}
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {suggestions.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => {
                    e.preventDefault(); // keep focus in the textarea
                    choose(i);
                  }}
                  className={`flex w-full flex-col items-start px-3 py-1.5 text-left ${
                    i === highlight ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <span className="text-sm">{s.label}</span>
                  {s.sub && (
                    <span className="line-clamp-1 text-[11px] text-muted-foreground">
                      {s.sub}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-end gap-1">
        {/* Gems (personas) launcher */}
        <div className="pb-1">
          <GemsMenu
            personas={personas}
            onLaunch={onActivatePersona}
            onNewPersona={onNewPersona}
            onManage={onManagePersonas}
          />
        </div>
        {/* Prompt Library */}
        <div className="pb-1">
          <PromptLibraryMenu
            prompts={prompts}
            onRun={onLoadSaved}
            onNewPrompt={onNewPrompt}
            onManage={onManage}
          />
        </div>

        <div className="flex flex-1 items-end rounded-lg border border-border bg-background focus-within:border-border-interactive focus-within:ring-2 focus-within:ring-ring/40">
          <textarea
            ref={textareaRef}
            aria-label="Message the Virtual Meteorologist"
            placeholder="Message, or type @ for a persona, / for a template…"
            rows={1}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              syncTrigger(e.target.value, e.target.selectionStart ?? e.target.value.length);
            }}
            onKeyUp={(e) => {
              const el = e.currentTarget;
              syncTrigger(el.value, el.selectionStart ?? el.value.length);
            }}
            onClick={(e) => {
              const el = e.currentTarget;
              syncTrigger(el.value, el.selectionStart ?? el.value.length);
            }}
            onKeyDown={onKeyDown}
            onBlur={() => setTrigger(null)}
            style={{ height: MIN_HEIGHT }}
            className="w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
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
      <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
        Enter to send · Shift+Enter for a new line · @ persona · / template
      </p>
    </div>
  );
}
