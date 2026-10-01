"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Message, formatCountdown } from "@/lib/messages";

interface QueueTabProps {
  messages: Message[];
  onCancel: (id: string) => void;
  onEdit: (id: string, newBody: string) => void;
}

export function QueueTab({ messages, onCancel, onEdit }: QueueTabProps) {
  const [, setTick] = useState(0);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...messages].sort((a, b) => a.sendAt - b.sendAt);

  function openEdit(msg: Message) {
    setEditingMessage(msg);
    setEditBody(msg.body);
  }

  function saveEdit() {
    if (editingMessage && editBody.trim()) {
      onEdit(editingMessage.id, editBody.trim());
      setEditingMessage(null);
    }
  }

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-muted-foreground"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <h3 className="font-semibold text-foreground">No Pending Messages</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
            Messages you schedule will appear here until they&apos;re delivered.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sorted.map((msg) => {
          const remaining = Math.max(0, msg.sendAt - Date.now());
          const isUrgent = remaining < 60000;
          const isWarning = remaining < 300000 && !isUrgent;

          return (
            <Card key={msg.id} className={isUrgent ? "border-destructive/50" : isWarning ? "border-orange-300" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {msg.recipient}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {msg.body}
                    </p>
                  </div>
                  <Badge
                    variant={isUrgent ? "destructive" : "secondary"}
                    className={`font-mono text-xs shrink-0 ${
                      isWarning ? "bg-orange-100 text-orange-700 border-orange-200" : ""
                    }`}
                  >
                    {formatCountdown(remaining)}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                  <span>
                    Sends{" "}
                    {new Date(msg.sendAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => openEdit(msg)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => onCancel(msg.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingMessage}
        onOpenChange={(open) => !open && setEditingMessage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
            <DialogDescription>
              Update the message content before it&apos;s delivered.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Recipient
              </Label>
              <p className="font-medium text-sm">{editingMessage?.recipient}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-body">Message</Label>
              <Textarea
                id="edit-body"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMessage(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={!editBody.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
