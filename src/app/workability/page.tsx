"use client";

import { MockupA, MockupB, MockupC, MockupD, MockupE, MockupF } from "@/components/forecast/workability-mockups";

export default function WorkabilityMockupsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Offshore Workability Widget — Design Explorations
          </h1>
          <p className="text-sm text-muted-foreground">
            Six layout variations using the eco v2 design system. All share the same
            &quot;Status-First, Data-Second&quot; paradigm with a Master Timeline + Parameter Lanes.
          </p>
        </div>

        {/* Mockup E - NEW: Graph + Cards */}
        <section className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">E</span>
            <h2 className="text-base font-medium text-foreground">Graph + Cards Combo</h2>
            <span className="text-xs text-muted-foreground">— Full probabilistic chart with status cards, workability windows, and parameter selector</span>
          </div>
          <MockupE />
        </section>

        {/* Mockup F - NEW: Multi-Parameter Cards with Sparklines */}
        <section className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">F</span>
            <h2 className="text-base font-medium text-foreground">Alert-First Cards with Sparklines</h2>
            <span className="text-xs text-muted-foreground">— &quot;No alerts&quot; banner + per-parameter cards with embedded mini-charts</span>
          </div>
          <MockupF />
        </section>

        {/* Mockup A */}
        <section className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">A</span>
            <h2 className="text-base font-medium text-foreground">Dense Heatmap</h2>
            <span className="text-xs text-muted-foreground">— Maximum information density, minimal vertical space</span>
          </div>
          <MockupA />
        </section>

        {/* Mockup B */}
        <section className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">B</span>
            <h2 className="text-base font-medium text-foreground">Segmented Blocks</h2>
            <span className="text-xs text-muted-foreground">— Grouped status segments with inline labels for quick scanning</span>
          </div>
          <MockupB />
        </section>

        {/* Mockup C */}
        <section className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">C</span>
            <h2 className="text-base font-medium text-foreground">Expandable Lanes</h2>
            <span className="text-xs text-muted-foreground">— Progressive disclosure: compact status → expand for probabilistic curves</span>
          </div>
          <MockupC />
        </section>

        {/* Mockup D */}
        <section className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">D</span>
            <h2 className="text-base font-medium text-foreground">Dashboard Cards</h2>
            <span className="text-xs text-muted-foreground">— Summary metrics + parameter cards with embedded mini-timelines</span>
          </div>
          <MockupD />
        </section>

        {/* Comparison notes */}
        <div className="rounded-lg border border-border bg-accent/30 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Design Trade-offs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">E: Graph + Cards Combo</p>
              <p>✓ Closest to traditional probabilistic forecast view</p>
              <p>✓ Full chart with ensemble spread, P90, alpha limit</p>
              <p>✓ Status cards + workability window chips above chart</p>
              <p>✗ More vertical space; one parameter at a time</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">F: Alert-First Cards</p>
              <p>✓ &quot;No alerts&quot; banner emphasizes absence of danger</p>
              <p>✓ Per-parameter sparkline cards show trends at a glance</p>
              <p>✓ Good for multi-parameter overview without expanding</p>
              <p>✗ Less chart detail than E; no ensemble spread visible</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">A: Dense Heatmap</p>
              <p>✓ Minimal vertical space — fits in a sidebar or dashboard tile</p>
              <p>✓ All 48 hours visible at once per parameter</p>
              <p>✗ No inline text labels — relies on color + tooltip</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">B: Segmented Blocks</p>
              <p>✓ Inline GO/MARGINAL/NO-GO labels in each segment</p>
              <p>✓ Clear duration perception (wider = longer)</p>
              <p>✗ Slightly more vertical space than A</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">C: Expandable Lanes</p>
              <p>✓ Progressive disclosure matches the user journey</p>
              <p>✓ Full probabilistic chart on demand</p>
              <p>✗ Requires interaction to see detail</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">D: Dashboard Cards</p>
              <p>✓ Strong summary metrics (hours workable/marginal/no-go)</p>
              <p>✓ Current P90 values prominent per parameter</p>
              <p>✗ More vertical space; less timeline resolution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
