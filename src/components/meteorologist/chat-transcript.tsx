"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChatMessage, formatMessageTime } from "@/lib/prompts";
import { Copy, Save } from "lucide-react";

interface ChatTranscriptProps {
  messages: ChatMessage[];
  /** Save a message's text as a new prompt (opens the New Prompt dialog). */
  onSavePrompt: (text: string) => void;
  /** Copy a message's text to the clipboard. */
  onCopy: (text: string) => void;
}

export function ChatTranscript({
  messages,
  onSavePrompt,
  onCopy,
}: ChatTranscriptProps) {
  return (
    <div className="space-y-4">
      {messages.map((m) =>
        m.role === "user" ? (
          <UserBubble
            key={m.id}
            message={m}
            onSavePrompt={onSavePrompt}
            onCopy={onCopy}
          />
        ) : (
          <AssistantBubble key={m.id} message={m} />
        ),
      )}
    </div>
  );
}

function UserBubble({
  message,
  onSavePrompt,
  onCopy,
}: {
  message: ChatMessage;
  onSavePrompt: (text: string) => void;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-end">
      <div className="max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
        <p>{message.content}</p>
        {/* Copy + Save + timestamp, inside the bubble bottom-left (per DTN). */}
        <div className="mt-1.5 flex items-center gap-1 text-primary-foreground/80">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Copy prompt"
                onClick={() => onCopy(message.content)}
                className="rounded p-0.5 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
              >
                <Copy className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Copy</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Save prompt"
                onClick={() => onSavePrompt(message.content)}
                className="rounded p-0.5 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
              >
                <Save className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Save prompt</TooltipContent>
          </Tooltip>
          <span className="ml-1 text-[11px]">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className={cn(
          "max-w-[90%] rounded-lg rounded-bl-sm bg-muted/60 px-3 py-2 text-sm text-foreground",
          "whitespace-pre-wrap",
        )}
      >
        {message.content}
      </div>
      <span className="pl-0.5 text-[11px] text-muted-foreground">
        {formatMessageTime(message.createdAt)}
      </span>
    </div>
  );
}
