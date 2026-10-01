"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ComposeTab } from "@/components/compose-tab";
import { QueueTab } from "@/components/queue-tab";
import { HistoryTab } from "@/components/history-tab";
import { useMessages } from "@/hooks/use-messages";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const {
    pending,
    sent,
    cancelled,
    addMessage,
    cancelMessage,
    editMessage,
  } = useMessages();

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      {/* Header - Eco v2 style */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary-foreground"
              >
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                DTN Meteorologist
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered weather consulting for your assets
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-6">
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="compose" className="gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
              Compose
            </TabsTrigger>
            <TabsTrigger value="queue" className="relative gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
              Queue
              {pending.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1.5 -right-1 h-5 min-w-5 text-[10px] px-1.5 rounded-full"
                >
                  {pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/></svg>
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <ComposeTab onSchedule={addMessage} />
          </TabsContent>

          <TabsContent value="queue">
            <QueueTab
              messages={pending}
              onCancel={cancelMessage}
              onEdit={editMessage}
            />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab sent={sent} cancelled={cancelled} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
