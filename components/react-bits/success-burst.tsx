"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SuccessBurstProps = {
  active?: boolean;
};

export function SuccessBurst({ active }: SuccessBurstProps) {
  return (
    <div
      className={cn(
        "relative flex h-16 w-16 items-center justify-center rounded-full border bg-background/90 text-primary transition",
        active ? "shadow-[0_0_30px_rgba(24,144,121,0.35)]" : "opacity-70"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full border border-primary/30",
          active ? "animate-pulse-ring" : ""
        )}
      />
      <Check className="relative h-7 w-7" />
    </div>
  );
}
