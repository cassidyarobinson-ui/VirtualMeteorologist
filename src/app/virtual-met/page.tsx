"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { VirtualMetPanel } from "@/components/virtual-met/virtual-met-panel";
import { Toaster } from "@/components/ui/sonner";

/**
 * New Virtual Met flow: the WeatherHub dashboard with the Virtual Meteorologist
 * panel docked on the right. Lives alongside the original /meteorologist route;
 * both deploy to the same static (GitLab Pages) site.
 *
 * The panel's open/closed visibility is owned here as the single source of
 * truth: the panel's own close control and the dashboard header's reopen
 * control both drive this one piece of state.
 */
export default function VirtualMetPage() {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <>
      <Toaster position="top-center" richColors />
      <DashboardShell
        panelOpen={panelOpen}
        onReopenPanel={() => setPanelOpen(true)}
        panel={<VirtualMetPanel onClose={() => setPanelOpen(false)} />}
      />
    </>
  );
}
