"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Persona } from "@/lib/personas";
import { Sparkles, Settings2, Plus, Check } from "lucide-react";

interface GemsMenuProps {
  personas: Persona[];
  activePersonaId?: string;
  /** 1-click launch: start a fresh chat configured with this persona. */
  onLaunch: (persona: Persona) => void;
  onNewPersona: () => void;
  onManage: () => void;
}

/**
 * "Gems" launcher next to the composer. Lists personas (featured first) so the
 * user can start a new chat configured with one in a single click, matching the
 * sidebar "Gems / Prompt Library" quick-launch requirement — surfaced here in
 * the panel since this app has no left sidebar.
 */
export function GemsMenu({
  personas,
  activePersonaId,
  onLaunch,
  onNewPersona,
  onManage,
}: GemsMenuProps) {
  const featured = personas.filter((p) => p.isFeatured);
  const mine = personas.filter((p) => !p.isFeatured);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Gems — launch a persona">
              <Sparkles className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Gems</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" side="top" className="min-w-64">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          Featured
        </DropdownMenuLabel>
        {featured.map((p) => (
          <PersonaRow
            key={p.id}
            persona={p}
            active={p.id === activePersonaId}
            onSelect={() => onLaunch(p)}
          />
        ))}

        {mine.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
              My Personas
            </DropdownMenuLabel>
            {mine.map((p) => (
              <PersonaRow
                key={p.id}
                persona={p}
                active={p.id === activePersonaId}
                onSelect={() => onLaunch(p)}
              />
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onNewPersona}>
          <Plus />
          New persona
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onManage}>
          <Settings2 />
          Manage personas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PersonaRow({
  persona,
  active,
  onSelect,
}: {
  persona: Persona;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem onSelect={onSelect} className="items-start gap-2">
      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm">{persona.title}</span>
          {active && <Check className="size-3.5 text-primary" />}
        </div>
        {persona.description && (
          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            {persona.description}
          </p>
        )}
      </div>
      {active && (
        <Badge className="text-[10px]">Active</Badge>
      )}
    </DropdownMenuItem>
  );
}
