"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CREDIT_USERS,
  CREDIT_HISTORY,
  CreditUser,
} from "@/lib/virtual-met";
import { History } from "lucide-react";

interface CreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Credits modal (admin only): per-user credit totals with avatars, a total row
 * at the bottom, and a "View History" toggle. Matches the Billing & Credits
 * admin mockup.
 */
export function CreditsDialog({ open, onOpenChange }: CreditsDialogProps) {
  const [showHistory, setShowHistory] = useState(false);

  const totalUsed = CREDIT_USERS.reduce((s, u) => s + u.used, 0);
  const totalCap = CREDIT_USERS.reduce((s, u) => s + u.total, 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setShowHistory(false);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{showHistory ? "Credit History" : "Credits"}</DialogTitle>
          <DialogDescription>
            View your current cycle totals here.
          </DialogDescription>
        </DialogHeader>

        {showHistory ? (
          <div className="overflow-hidden rounded-md border border-border">
            <div className="grid grid-cols-[1fr_auto] border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span>Cycle dates</span>
              <span>Credits</span>
            </div>
            <ul className="divide-y divide-border">
              {CREDIT_HISTORY.map((h) => (
                <li
                  key={h.label}
                  className="grid grid-cols-[1fr_auto] items-center px-3 py-3 text-sm"
                >
                  <span className="text-foreground">{h.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {h.credits.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <div className="grid grid-cols-[1fr_auto] border-b border-border bg-muted/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>User</span>
              <span>Credit Total</span>
            </div>
            <ul className="divide-y divide-border">
              {CREDIT_USERS.map((u) => (
                <CreditRow key={u.name} user={u} />
              ))}
            </ul>
            {/* Total row at the bottom (per mockup note) */}
            <div className="grid grid-cols-[1fr_auto] border-t border-border bg-muted/30 px-3 py-2 text-sm font-medium">
              <span className="text-foreground">Total</span>
              <span className="tabular-nums text-foreground">
                {totalUsed.toLocaleString()}/{totalCap.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => setShowHistory((v) => !v)}>
            <History className="size-4" />
            {showHistory ? "Back to totals" : "View History"}
          </Button>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreditRow({ user }: { user: CreditUser }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
      <div className="flex items-center gap-2">
        <div
          className={`size-6 shrink-0 rounded-full bg-gradient-to-br ${user.avatar}`}
        />
        <span className="truncate text-sm text-foreground">{user.name}</span>
      </div>
      <span className="tabular-nums text-sm text-muted-foreground">
        {user.used.toLocaleString()}/{user.total.toLocaleString()}
      </span>
    </li>
  );
}
