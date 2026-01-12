"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GlowCard } from "@/components/react-bits/glow-card";

type ChecklistItem = {
  title: string;
  steps: string[];
};

type DemoChecklistPanelProps = {
  items: ChecklistItem[];
};

export function DemoChecklistPanel({ items }: DemoChecklistPanelProps) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <div className="fixed bottom-6 right-6 z-40 w-[240px]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="w-full text-left"
        >
          <GlowCard
            title="Demo checklist"
            subtitle="Tap to expand"
            accent="bg-emerald-200/60"
            className="cursor-pointer bg-background/90"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{items.length} tasks</span>
              <ChevronUp className="h-4 w-4" />
            </div>
          </GlowCard>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[320px] max-h-[80vh] overflow-y-auto">
      <GlowCard
        title="Demo checklist"
        subtitle="Milestone 3 + 4"
        accent="bg-emerald-200/60"
        className="bg-background/90"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-expanded={open}
          className="absolute right-4 top-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Minimize
          <ChevronDown className="h-3 w-3" />
        </button>
        <p className="text-xs text-muted-foreground">
          Expand each item to see how to validate the task.
        </p>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <details key={item.title} className="rounded-xl border bg-background/70 p-3">
              <summary className="cursor-pointer text-sm font-medium">
                {item.title}
              </summary>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {item.steps.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
