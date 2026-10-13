"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatTranscript } from "./chat-transcript";
import { PanelComposer } from "./panel-composer";
import { NewPromptDialog, NewPromptValues } from "./new-prompt-dialog";
import { ManagePromptsDialog } from "./manage-prompts-dialog";
import { ManagePersonasDialog } from "./manage-personas-dialog";
import { PersonaDialog, PersonaFormValues } from "./persona-dialog";
import {
  VariableFillDialog,
  VariableFillRequest,
} from "./variable-fill-dialog";
import { UsageView } from "./usage-view";
import { usePrompts } from "@/hooks/use-prompts";
import { usePersonas } from "@/hooks/use-personas";
import {
  SavedPrompt,
  ChatMessage,
  createMessage,
  deriveTitle,
  SUGGESTED_ASSET_PROMPTS,
  SUGGESTED_LOCATION_PROMPTS,
} from "@/lib/prompts";
import {
  Persona,
  PromptTemplate,
  getDefaultPersona,
  parseVariables,
  applyVariables,
  FEATURED_PERSONAS,
} from "@/lib/personas";
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

  const {
    personas,
    templates,
    addPersona,
    editPersona,
    deletePersona,
    duplicatePersona,
  } = usePersonas();

  const [view, setView] = useState<PanelView>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [composerText, setComposerText] = useState("");

  // Active persona for this thread. Seeded to the default (Virtual
  // Meteorologist) so a persona is always running out of the box — the mocked
  // equivalent of injecting system_instructions into the LLM call and keeping
  // it persistent across turns.
  const [activePersonaId, setActivePersonaId] = useState<string>(
    () => getDefaultPersona(FEATURED_PERSONAS)?.id ?? "",
  );
  const activePersona =
    personas.find((p) => p.id === activePersonaId) ??
    getDefaultPersona(personas);

  // Dialog state
  const [newPromptOpen, setNewPromptOpen] = useState(false);
  const [draft, setDraft] = useState<NewPromptValues | undefined>();
  const [manageOpen, setManageOpen] = useState(false);
  const [managePersonasOpen, setManagePersonasOpen] = useState(false);
  const [newPersonaOpen, setNewPersonaOpen] = useState(false);
  const [varRequest, setVarRequest] = useState<VariableFillRequest | null>(null);

  // --- Chat (mocked execution flow) ------------------------------------------

  function sendUser(text: string) {
    const persona = activePersona;
    // Mocked "backend": the active persona's system instructions are the
    // context the model would run under; we reflect that in the reply so the
    // persistence is visible. A real impl would inject persona.systemInstructions
    // into the system prompt and keep it across every turn in this thread.
    const sysNote = persona
      ? `Responding as ${persona.title} (temp ${persona.defaultParameters.temperature}, ${persona.defaultParameters.model}).`
      : "No persona active.";
    setMessages((prev) => [
      ...prev,
      createMessage("user", text),
      createMessage(
        "assistant",
        `${sysNote}\n\nHere's what I found for your question. (This is a mock response — the active persona's system instructions would ground the real model here.)`,
      ),
    ]);
  }

  function runSavedNow(p: SavedPrompt) {
    markRun(p.id);
    setView("chat");
    sendUser(p.prompt);
    toast.success(`Running "${p.title}"`);
  }

  function loadIntoComposer(text: string) {
    setView("chat");
    setComposerText(text);
  }

  function loadSaved(p: SavedPrompt) {
    markRun(p.id);
    loadIntoComposer(p.prompt);
  }

  // --- Personas --------------------------------------------------------------

  /** Activate a persona for the thread (via @mention or the Gems launcher). */
  function activatePersona(p: Persona) {
    setActivePersonaId(p.id);
    setView("chat");
    toast.success(`Active persona: ${p.title}`);
  }

  function handleCreatePersona(values: PersonaFormValues) {
    const created = addPersona({
      title: values.title,
      description: values.description,
      systemInstructions: values.systemInstructions,
      defaultParameters: values.defaultParameters,
      isPublic: values.isPublic,
      isShared: values.isShared,
    });
    setActivePersonaId(created.id);
  }

  function handleEditPersona(id: string, values: PersonaFormValues) {
    editPersona(id, {
      title: values.title,
      description: values.description,
      systemInstructions: values.systemInstructions,
      defaultParameters: values.defaultParameters,
      isPublic: values.isPublic,
      isShared: values.isShared,
    });
  }

  // --- Templates -------------------------------------------------------------

  /** Insert a template into the composer, prompting for {{variables}} first. */
  function insertTemplate(t: PromptTemplate) {
    const vars = parseVariables(t.templateText);
    if (vars.length > 0) {
      setVarRequest({ title: t.title, text: t.templateText, variables: vars });
      return;
    }
    loadIntoComposer(t.templateText);
  }

  function handleVariablesFilled(values: Record<string, string>) {
    if (!varRequest) return;
    loadIntoComposer(applyVariables(varRequest.text, values));
    setVarRequest(null);
  }

  // --- Saved prompts ---------------------------------------------------------

  function openSaveFromBubble(text: string) {
    setDraft({ name: deriveTitle(text), prompt: text, isFavorite: false });
    setNewPromptOpen(true);
  }

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

      {/* Active persona indicator — shows which system-instruction set is
          running for this thread. Click to manage/switch. */}
      {view === "chat" && activePersona && (
        <button
          type="button"
          onClick={() => setManagePersonasOpen(true)}
          className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-1.5 text-left transition-colors hover:bg-muted/70"
        >
          <Sparkles className="size-3.5 shrink-0 text-primary" />
          <span className="text-xs text-muted-foreground">Active persona</span>
          <Badge variant="secondary" className="text-[11px]">
            {activePersona.title}
          </Badge>
          <span className="ml-auto text-[11px] text-muted-foreground">
            Change
          </span>
        </button>
      )}

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
              <h4 className="text-foreground">
                {activePersona?.title ?? "Virtual Meteorologist"}
              </h4>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {activePersona?.description ??
                  "Your AI-powered weather consultant."}{" "}
                Type <span className="font-medium">@</span> to switch persona or{" "}
                <span className="font-medium">/</span> to insert a prompt
                template. Hover a message to save it.
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
                  onPick={loadIntoComposer}
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
                  onPick={loadIntoComposer}
                />
              </div>
            )}
          </div>

          <PanelComposer
            value={composerText}
            onChange={setComposerText}
            onSend={sendUser}
            prompts={prompts}
            onLoadSaved={loadSaved}
            onNewPrompt={openNewPrompt}
            onManage={() => setManageOpen(true)}
            personas={personas}
            templates={templates}
            onActivatePersona={activatePersona}
            onInsertTemplate={insertTemplate}
            onNewPersona={() => setNewPersonaOpen(true)}
            onManagePersonas={() => setManagePersonasOpen(true)}
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
        onRun={runSavedNow}
        onEdit={editPrompt}
        onDelete={deletePrompt}
        onToggleFavorite={toggleFavorite}
        onNewPrompt={openNewPrompt}
      />

      {/* Manage personas / Gems */}
      <ManagePersonasDialog
        open={managePersonasOpen}
        onOpenChange={setManagePersonasOpen}
        personas={personas}
        activePersonaId={activePersona?.id}
        onLaunch={activatePersona}
        onCreate={handleCreatePersona}
        onEdit={handleEditPersona}
        onDuplicate={duplicatePersona}
        onDelete={deletePersona}
      />

      {/* New persona (from composer Gems menu) */}
      <PersonaDialog
        open={newPersonaOpen}
        onOpenChange={setNewPersonaOpen}
        onSubmit={(v) => {
          handleCreatePersona(v);
          toast.success(`Created "${v.title}"`);
        }}
      />

      {/* Variable fill for templates with {{placeholders}} */}
      <VariableFillDialog
        request={varRequest}
        onOpenChange={(o) => !o && setVarRequest(null)}
        onSubmit={handleVariablesFilled}
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
