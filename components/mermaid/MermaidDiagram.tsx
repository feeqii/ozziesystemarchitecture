"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MermaidDiagramProps = {
  diagram: string;
  className?: string;
};

export function MermaidDiagram({ diagram, className }: MermaidDiagramProps) {
  const idRef = useRef(`mermaid-${Math.random().toString(16).slice(2)}`);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div
      className={cn(
        "flex min-h-[260px] items-center justify-center overflow-x-auto rounded-xl border bg-background/60 p-4",
        className
      )}
    >
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : !svg ? (
        <p className="text-sm text-muted-foreground">Rendering diagram...</p>
      ) : (
        <div
          className="mermaid [&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}
