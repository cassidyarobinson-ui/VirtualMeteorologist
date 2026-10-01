"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SavedPrompt } from "@/lib/prompts";
import {
  BookMarked,
  Plus,
  Settings2,
  Star,
  User,
  ChevronRight,
} from "lucide-react";

interface PromptLibraryMenuProps {
  /** Personal = all prompts; Favorites = subset where isFavorite. */
  prompts: SavedPrompt[];
  onRun: (prompt: SavedPrompt) => void;
  onNewPrompt: () => void;
  onManage: () => void;
}

/**
 * The "Prompt Library" button + dropdown that sits next to the composer input.
 * Matches the DTN screenshot: PROMPTS label, Favorites ▸ / Personal ▸ submenus,
 * ＋ New prompt, Manage Prompts. Organization is reserved for later and shown
 * disabled so the IA is visible without implying it works yet.
 */
export function PromptLibraryMenu({
  prompts,
  onRun,
  onNewPrompt,
  onManage,
}: PromptLibraryMenuProps) {
  const favorites = prompts.filter((p) => p.isFavorite);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open prompt library"
            >
              <BookMarked className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Prompt library</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" side="top" className="min-w-56">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          Prompts
        </DropdownMenuLabel>

        {/* Favorites submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Star />
            Favorites
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-56">
            {favorites.length > 0 ? (
              favorites.map((p) => (
                <DropdownMenuItem key={p.id} onSelect={() => onRun(p)}>
                  <Star className="fill-intent-warning-base text-intent-warning-base" />
                  <span className="truncate">{p.title}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No favorites yet</DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Personal submenu = all saved prompts */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <User />
            Personal
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-56">
            {prompts.length > 0 ? (
              prompts.map((p) => (
                <DropdownMenuItem key={p.id} onSelect={() => onRun(p)}>
                  <span className="truncate">{p.title}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No saved prompts</DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Organization — future (share prompts). Shown disabled. */}
        <DropdownMenuItem disabled>
          <ChevronRight className="opacity-0" />
          Organization
          <span className="ml-auto text-[11px] text-muted-foreground">
            Soon
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={onNewPrompt}>
          <Plus />
          New prompt
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onManage}>
          <Settings2 />
          Manage Prompts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
