"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VMTranscript } from "./vm-transcript";
import { VMComposer } from "./vm-composer";
import { VMPromptDialog, VMPromptValues } from "./vm-prompt-dialog";
import { AllPromptsDialog } from "./all-prompts-dialog";
import { CreditsDialog } from "./credits-dialog";
import { useVMPrompts } from "@/hooks/use-vm-prompts";
import {
  VMPrompt,
  VMMessage,
  createVMMessage,
  deriveVMTitle,
  SEED_MESSAGES,
} from "@/lib/virtual-met";
import { Sparkles, Info, X } from "lucide-react";
import { toast } from "sonner";

/**
 * The new Virtual Meteorologist panel. Fully interactive: chat transcript with
 * markdown + per-message actions, a composer with prompts dropdown + credits
 * meter + settings menu, and the Save/Edit/All-Prompts and Credits modals.
 */
export function VirtualMetPanel({ onClose }: { onClose?: () => void }) {
  const { prompts, addPrompt, editPrompt, deletePrompt, togglePin } =
    useVMPrompts();

  const [messages, setMessages] = useState<VMMessage[]>(SEED_MESSAGES);
  const [composerText, setComposerText] = useState("");

  // Dialog state
  const [promptDialog, setPromptDialog] = useState<{
    open: boolean;
    mode: "new" | "edit";
    editing?: VMPrompt;
    draft?: Partial<VMPromptValues>;
  }>({ open: false, mode: "new" });
  const [allPromptsOpen, setAllPromptsOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);

  function sendUser(text: string) {
    setMessages((prev) => [
      ...prev,
      createVMMessage("user", text),
      createVMMessage(
        "assistant",
        "Here's what I found for your question. (This is a mock response — wire the Virtual Meteorologist model here.)",
      ),
    ]);
  }

  function loadIntoComposer(text: string) {
    setComposerText(text);
  }

  // Save a sent message as a pinned prompt (one-click, from the message
  // bubble). This is now the primary way users create prompts — from things
  // they've already asked — rather than authoring a blank one.
  function pinMessage(text: string) {
    if (isMessagePinned(text)) {
      toast.info("Already saved to prompts");
      return;
    }
    addPrompt(deriveVMTitle(text), text, true);
    toast.info("Pinned to prompts");
  }

  function isMessagePinned(text: string): boolean {
    const needle = text.trim();
    return prompts.some((p) => p.prompt.trim() === needle);
  }

  function openEditPrompt(p: VMPrompt) {
    setAllPromptsOpen(false);
    setPromptDialog({
      open: true,
      mode: "edit",
      editing: p,
      draft: { name: p.title, prompt: p.prompt, isPinned: p.isPinned },
    });
  }

  function handlePromptSubmit(values: VMPromptValues) {
    if (promptDialog.mode === "edit" && promptDialog.editing) {
      editPrompt(promptDialog.editing.id, {
        title: values.name,
        prompt: values.prompt,
        isPinned: values.isPinned,
      });
      toast.info("Prompt updated");
    } else {
      addPrompt(values.name, values.prompt, values.isPinned);
      toast.info(`Saved "${values.name}"`);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.info("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function clearHistory() {
    setMessages([]);
    toast.info("Chat history deleted");
  }

  const isEmpty = messages.length === 0;

  return (
    <aside
      aria-label="Virtual Meteorologist"
      className="flex h-full w-full max-w-[360px] flex-col border-l border-border bg-card"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Virtual Meteorologist
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="About">
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-pretty">
              DTN Met&rsquo;s AI virtual meteorologist interprets weather data,
              explains forecasts, and delivers actionable insights to support
              informed decisions.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close side panel"
                onClick={onClose}
              >
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close side panel</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto scroll-fade-y px-3 py-4">
        {/* Intro — vertically centered when empty, left-aligned content;
            a header above the transcript otherwise. */}
        <div
          className={
            isEmpty
              ? "flex h-full flex-col justify-center text-left"
              : "mb-5 text-left"
          }
        >
          <div
            className={`mb-3 flex items-center justify-center rounded-full bg-primary/10 text-primary ${
              isEmpty ? "size-10" : "size-8"
            }`}
          >
            <Sparkles className={isEmpty ? "size-5" : "size-4"} />
          </div>
          <h4 className="text-foreground">Virtual Meteorologist</h4>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your AI-powered weather consultant. Ask about{" "}
            <span className="text-primary">forecasts</span>,{" "}
            <span className="text-primary">current conditions</span>, and{" "}
            <span className="text-primary">alerts for your assets</span>.
          </p>
        </div>

        {!isEmpty && (
          <VMTranscript
            messages={messages}
            onCopy={copyText}
            onEditUser={loadIntoComposer}
            onPinUser={pinMessage}
            isPinned={isMessagePinned}
            onDeleteChat={clearHistory}
          />
        )}
      </div>

      <VMComposer
        value={composerText}
        onChange={setComposerText}
        onSend={sendUser}
        prompts={prompts}
        onSelectPrompt={(p) => loadIntoComposer(p.prompt)}
        onTogglePin={togglePin}
        onAllPrompts={() => setAllPromptsOpen(true)}
        onClearHistory={clearHistory}
        onOpenCredits={() => setCreditsOpen(true)}
      />

      {/* Save / Edit Prompt */}
      <VMPromptDialog
        open={promptDialog.open}
        onOpenChange={(o) =>
          setPromptDialog((s) => ({ ...s, open: o }))
        }
        title={promptDialog.mode === "edit" ? "Edit Prompt" : "New Prompt"}
        submitLabel="Save"
        initial={promptDialog.draft}
        onSubmit={handlePromptSubmit}
      />

      {/* All Prompts */}
      <AllPromptsDialog
        open={allPromptsOpen}
        onOpenChange={setAllPromptsOpen}
        prompts={prompts}
        onRun={(p) => {
          loadIntoComposer(p.prompt);
        }}
        onEdit={openEditPrompt}
        onDelete={deletePrompt}
      />

      {/* Credits (admin) */}
      <CreditsDialog open={creditsOpen} onOpenChange={setCreditsOpen} />
    </aside>
  );
}
