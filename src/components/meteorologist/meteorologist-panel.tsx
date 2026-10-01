"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatTranscript } from "./chat-transcript";
import { PanelComposer } from "./panel-composer";
import { NewPromptDialog, NewPromptValues } from "./new-prompt-dialog";
import { ManagePromptsDialog } from "./manage-prompts-dialog";
import { UsageView } from "./usage-view";
import { usePrompts } from "@/hooks/use-prompts";
import {
  SavedPrompt,
  ChatMessage,
  createMessage,
  deriveTitle,
  SUGGESTED_ASSET_PROMPTS,
  SUGGESTED_LOCATION_PROMPTS,
} from "@/lib/prompts";
import { Sparkles, Info, X, Gauge, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type PanelView = "chat" | "usage";

const INITIAL_MESSAGES: ChatMessage[] = [
  createMessage(
    "user",
    "Will there be any high wind threats to my port crane operations in Sydney, NSW in the next 48 hours?",
  ),
  createMessage(
    "assistant",
    "SYDNEY ASSET — PORT CRANE OPERATIONS | Good afternoon!\n\nGood news: there are no active BOM high-wind warnings in effect for the Sydney area, and the overall wind picture for the next 48 hours is manageable — but there is one window worth watching.\n\nKey watch period: Wednesday 1:00–5:00 PM AEST, with sustained winds of 20–22 km/h and gusts reaching 41–43 km/h, which could approach operational thresholds for crane work depending on your site limits.",
  ),
];

export function MeteorologistPanel() {
  const {
    prompts,
    addPrompt,
    editPrompt,
    deletePrompt,
    toggleFavorite,
    markRun,
  } = usePrompts();

  const [view, setView] = useState<PanelView>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  // New/Save prompt dialog. `draft` seeds the dialog when saving from a bubble.
  const [newPromptOpen, setNewPromptOpen] = useState(false);
  const [draft, setDraft] = useState<NewPromptValues | undefined>();

  const [manageOpen, setManageOpen] = useState(false);

  function sendUser(text: string) {
    setMessages((prev) => [
      ...prev,
      createMessage("user", text),
      createMessage(
        "assistant",
        "Thought process (reasoning, 1 tool call)\n\nHere's what I found for your question. (This is a mock response — wire the Virtual Meteorologist model here.)",
      ),
    ]);
  }

  function runSaved(p: SavedPrompt) {
    markRun(p.id);
    setView("chat");
    sendUser(p.prompt);
    toast.success(`Running "${p.title}"`);
  }

  // Save-from-bubble: open the New Prompt dialog pre-populated.
  function openSaveFromBubble(text: string) {
    setDraft({ name: deriveTitle(text), prompt: text, isFavorite: false });
    setNewPromptOpen(true);
  }

  // New prompt from the library menu / manage dialog: empty dialog.
  function openNewPrompt() {
    setDraft(undefined);
    setManageOpen(false);
    setNewPromptOpen(true);
  }

  function handleCreate(values: NewPromptValues) {
    const created = addPrompt(values.name, values.prompt);
    if (values.isFavorite) toggleFavorite(created.id);
    toast.success(`Saved "${values.name}" to your library`);
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  return (
    <aside
      aria-label="Virtual Meteorologist"
      className="flex h-full w-full max-w-[380px] flex-col border-l border-border bg-card"
    >
      {/* Panel title bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          {view === "usage" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Back to chat"
                  onClick={() => setView("chat")}
                >
                  <ArrowLeft className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to chat</TooltipContent>
            </Tooltip>
          )}
          <Sparkles className="size-4 text-primary" />
          <span className="font-medium text-sm text-foreground">
            {view === "usage" ? "Usage" : "Virtual Meteorologist"}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="View usage"
                aria-pressed={view === "usage"}
                onClick={() => setView((v) => (v === "usage" ? "chat" : "usage"))}
              >
                <Gauge className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Usage</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="About this panel">
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>About</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close panel">
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Body */}
      {view === "usage" ? (
        <div className="min-h-0 flex-1 overflow-y-auto scroll-fade-y px-3 py-4">
          <UsageView />
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto scroll-fade-y px-3 py-4">
            {/* Intro header */}
            <div className="mb-5 flex flex-col items-center text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <h4 className="text-foreground">Virtual Meteorologist</h4>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your AI-powered weather consultant. Ask about forecasts,
                current conditions, and alerts for your assets. Hover a message
                to save it as a prompt, or open the prompt library beside the
                input.
              </p>
            </div>

            <ChatTranscript
              messages={messages}
              onSavePrompt={openSaveFromBubble}
              onCopy={copyText}
            />

            {/* Suggestions when the chat is just getting started */}
            {messages.length <= INITIAL_MESSAGES.length && (
              <div className="mt-6 space-y-4">
                <SuggestionGroup
                  label="Try asking"
                  items={SUGGESTED_ASSET_PROMPTS}
                  onPick={sendUser}
                />
                <div className="flex items-center gap-3 px-1">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground">
                    OR
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <SuggestionGroup
                  label="Try asking"
                  items={SUGGESTED_LOCATION_PROMPTS}
                  onPick={sendUser}
                />
              </div>
            )}
          </div>

          <PanelComposer
            onSend={sendUser}
            prompts={prompts}
            onRunSaved={runSaved}
            onNewPrompt={openNewPrompt}
            onManage={() => setManageOpen(true)}
          />
        </>
      )}

      {/* New / Save prompt dialog */}
      <NewPromptDialog
        open={newPromptOpen}
        onOpenChange={setNewPromptOpen}
        initial={draft}
        onSubmit={handleCreate}
      />

      {/* Manage prompts */}
      <ManagePromptsDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        prompts={prompts}
        onRun={runSaved}
        onEdit={editPrompt}
        onDelete={deletePrompt}
        onToggleFavorite={toggleFavorite}
        onNewPrompt={openNewPrompt}
      />
    </aside>
  );
}

function SuggestionGroup({
  label,
  items,
  onPick,
}: {
  label: string;
  items: readonly string[];
  onPick: (text: string) => void;
}) {
  return (
    <section className="space-y-2">
      <p className="px-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="space-y-2">
        {items.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onPick(t)}
            className="flex w-full items-start rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-border-interactive hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t}
          </button>
        ))}
      </div>
    </section>
  );
}
