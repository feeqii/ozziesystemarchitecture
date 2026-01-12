import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlowCardProps = {
  title: string;
  subtitle: string;
  accent?: string;
  children?: ReactNode;
  className?: string;
};

export function GlowCard({
  title,
  subtitle,
  accent = "bg-primary/20",
  children,
  className,
}: GlowCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-background/80 p-5 shadow-sm backdrop-blur",
        className
      )}
    >
      <div className={cn("absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl", accent)} />
      <div className="relative space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {subtitle}
        </p>
        <h3 className="font-display text-xl text-foreground">{title}</h3>
        {children}
      </div>
    </div>
  );
}
