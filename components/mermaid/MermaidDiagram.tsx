"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type MermaidDiagramProps = {
  diagram: string;
  className?: string;
};

export function MermaidDiagram({ diagram, className }: MermaidDiagramProps) {
  const idRef = useRef(`mermaid-${Math.random().toString(16).slice(2)}`);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const zoomLabel = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom]);

  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      try {
        setError(null);
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "strict",
          themeVariables: {
            primaryColor: "#f6f2e7",
            primaryTextColor: "#1f2933",
            lineColor: "#94a3b8",
            fontFamily: "var(--font-sans)",
          },
        });

        const { svg: output } = await mermaid.render(idRef.current, diagram);
        if (isMounted) {
          setSvg(output);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to render diagram.");
          setSvg("");
        }
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [diagram]);

  const clampZoom = (value: number) => Math.min(2.5, Math.max(0.6, value));

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-background/60",
        className
      )}
    >
      <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => setZoom((prev) => clampZoom(prev - 0.2))}
          aria-label="Zoom out"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="min-w-[44px] text-center">{zoomLabel}</span>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => setZoom((prev) => clampZoom(prev + 0.2))}
          aria-label="Zoom in"
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => setZoom(1)}
          aria-label="Reset zoom"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex min-h-[260px] items-center justify-center overflow-auto p-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !svg ? (
          <p className="text-sm text-muted-foreground">Rendering diagram...</p>
        ) : (
          <div
            className="origin-top-left"
            style={{ transform: `scale(${zoom})` }}
          >
            <div
              className="mermaid [&_svg]:max-w-none"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
