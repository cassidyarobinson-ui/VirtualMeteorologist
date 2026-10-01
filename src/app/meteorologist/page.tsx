"use client";

import { MeteorologistPanel } from "@/components/meteorologist/meteorologist-panel";
import { Toaster } from "@/components/ui/sonner";

export default function MeteorologistPage() {
  return (
    <div className="flex h-screen bg-surface-medium">
      <Toaster position="top-center" richColors />

      {/* Placeholder dashboard area — stands in for the WeatherHub dashboard
          so the panel is shown docked on the right, as it will appear in situ. */}
      <main className="hidden flex-1 items-center justify-center p-6 md:flex">
        <p className="text-sm text-muted-foreground">
          WeatherHub dashboard area
        </p>
      </main>

      <MeteorologistPanel />
    </div>
  );
}
