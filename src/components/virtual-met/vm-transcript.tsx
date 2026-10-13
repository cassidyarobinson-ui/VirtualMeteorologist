"use client";

import { Fragment, useState } from "react";
import { toast } from "sonner";
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
import { VMMessage, formatClock } from "@/lib/virtual-met";
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Bookmark,
} from "lucide-react";

interface VMTranscriptProps {
  messages: VMMessage[];
  onCopy: (text: string) => void;
  /** Load a user message back into the composer for editing. */
  onEditUser: (text: string) => void;
  /** Save a user message as a pinned prompt. */
  onPinUser: (text: string) => void;
  /** Whether a given message text is already saved as a prompt. */
  isPinned: (text: string) => boolean;
  onDeleteChat: () => void;
}

export function VMTranscript({
  messages,
  onCopy,
  onEditUser,
  onPinUser,
  isPinned,
  onDeleteChat,
}: VMTranscriptProps) {
  return (
    <div className="space-y-4">
      {messages.map((m) =>
        m.role === "user" ? (
          <UserBubble
            key={m.id}
            message={m}
            onCopy={() => onCopy(m.content)}
            onEdit={() => onEditUser(m.content)}
            onPin={() => onPinUser(m.content)}
            isPinned={isPinned(m.content)}
          />
        ) : (
          <AssistantBlock
            key={m.id}
            message={m}
            onCopy={() => onCopy(m.content)}
            onDeleteChat={onDeleteChat}
          />
        ),
      )}
    </div>
  );
}

function UserBubble({
  message,
  onCopy,
  onEdit,
  onPin,
  isPinned,
}: {
  message: VMMessage;
  onCopy: () => void;
  onEdit: () => void;
  onPin: () => void;
  isPinned: boolean;
}) {
  return (
    <div className="flex flex-col items-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-muted px-3 py-2 text-sm text-foreground">
        {message.content}
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
        <span className="mr-0.5">{formatClock(message.createdAt)}</span>
        <ActionIcon label="Edit" onClick={onEdit}>
          <Pencil className="size-3" />
        </ActionIcon>
        <ActionIcon label="Copy" onClick={onCopy}>
          <Copy className="size-3" />
        </ActionIcon>
        <ActionIcon
          label={isPinned ? "Saved to prompts" : "Save & pin as prompt"}
          onClick={onPin}
          active={isPinned}
        >
          <Bookmark
            className={`size-3 ${isPinned ? "fill-current" : ""}`}
          />
        </ActionIcon>
      </div>
    </div>
  );
}

function AssistantBlock({
  message,
  onCopy,
  onDeleteChat,
}: {
  message: VMMessage;
  onCopy: () => void;
  onDeleteChat: () => void;
}) {
  // Local feedback state: thumbs are mutually exclusive; retry briefly spins.
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [retrying, setRetrying] = useState(false);

  function handleRetry() {
    setRetrying(true);
    // Reset after the spin so it can replay on the next click.
    window.setTimeout(() => setRetrying(false), 600);
  }

  return (
    <div className="space-y-1.5">
      <div className="text-sm leading-relaxed text-foreground">
        <Markdown text={message.content} />
      </div>
      {/* Per-message action row */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <ActionIcon label="Copy" onClick={onCopy}>
          <Copy className="size-3.5" />
        </ActionIcon>
        <ActionIcon
          label="Good response"
          active={vote === "up"}
          onClick={() => {
            const next = vote === "up" ? null : "up";
            setVote(next);
            if (next === "up") toast.info("Good response noted");
          }}
        >
          <ThumbsUp
            className={`size-3.5 transition-transform duration-200 ${
              vote === "up" ? "scale-110 fill-current" : ""
            }`}
          />
        </ActionIcon>
        <ActionIcon
          label="Bad response"
          active={vote === "down"}
          onClick={() => {
            const next = vote === "down" ? null : "down";
            setVote(next);
            if (next === "down") toast.info("Bad response noted");
          }}
        >
          <ThumbsDown
            className={`size-3.5 transition-transform duration-200 ${
              vote === "down" ? "scale-110 fill-current" : ""
            }`}
          />
        </ActionIcon>
        <ActionIcon label="Retry" onClick={handleRetry}>
          <RefreshCw
            className={`size-3.5 ${retrying ? "animate-spin" : ""}`}
          />
        </ActionIcon>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More"
              className="rounded p-0.5 hover:text-foreground"
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuItem onSelect={onDeleteChat}>
              Delete this chat
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Additional item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ActionIcon({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick?: () => void;
  /** Selected/toggled state (e.g. a chosen thumbs vote). */
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          className={`rounded p-0.5 transition-colors duration-150 hover:text-foreground active:scale-90 ${
            active ? "text-primary" : ""
          }`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Minimal markdown for assistant answers: supports **bold** and "- " bullet
 * lists with blank-line paragraph breaks. Deliberately small — the mockups only
 * use bold and bullets, and this keeps the static bundle lean (no md library).
 */
function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={key} className="my-1.5 ml-4 list-disc space-y-1">
        {listItems.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }
    flushList(`ul-${i}`);
    if (trimmed === "") return;
    blocks.push(
      <p key={`p-${i}`} className="my-1.5 first:mt-0">
        {inline(trimmed)}
      </p>,
    );
  });
  flushList("ul-end");

  return <>{blocks}</>;
}

/** Render inline **bold** segments. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
