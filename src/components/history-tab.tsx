"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Message } from "@/lib/messages";

interface HistoryTabProps {
  sent: Message[];
  cancelled: Message[];
}

export function HistoryTab({ sent, cancelled }: HistoryTabProps) {
  const sortedSent = [...sent].sort((a, b) => b.sendAt - a.sendAt);
  const sortedCancelled = [...cancelled].sort((a, b) => b.sendAt - a.sendAt);

  if (sortedSent.length === 0 && sortedCancelled.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-muted-foreground"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/></svg>
          </div>
          <h3 className="font-semibold text-foreground">No Messages Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
            Messages will appear here after they&apos;ve been delivered or cancelled.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sent Messages */}
      {sortedSent.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Delivered
            </h3>
            <Badge variant="secondary" className="text-xs">
              {sortedSent.length}
            </Badge>
          </div>
          {sortedSent.map((msg) => (
            <Card key={msg.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {msg.recipient}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {msg.body}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs text-green-700 border-green-200 bg-green-50 shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><path d="M20 6 9 17l-5-5"/></svg>
                    Sent
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Delivered{" "}
                  {new Date(msg.sendAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {sortedSent.length > 0 && sortedCancelled.length > 0 && <Separator />}

      {/* Cancelled Messages */}
      {sortedCancelled.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Cancelled
            </h3>
            <Badge variant="secondary" className="text-xs">
              {sortedCancelled.length}
            </Badge>
          </div>
          {sortedCancelled.map((msg) => (
            <Card key={msg.id} className="opacity-60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-muted-foreground line-through">
                      {msg.recipient}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {msg.body}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs text-red-700 border-red-200 bg-red-50 shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    Cancelled
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Was scheduled for{" "}
                  {new Date(msg.sendAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
