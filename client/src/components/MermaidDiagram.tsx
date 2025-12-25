import { useEffect, useRef } from "react";
import mermaid, { MermaidConfig } from "mermaid";

interface MermaidDiagramProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
});

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    containerRef.current.innerHTML = chart;

    requestAnimationFrame(() => {
      try {
        mermaid.run({
          nodes: [containerRef.current!],
        });

        // Make SVG responsive
        const svg = containerRef?.current?.querySelector("svg");
        if (svg) {
          svg.style.maxWidth = "100%";
          svg.style.height = "auto";
        }
      } catch (e) {
        console.error("Mermaid render error:", e);
      }
    });
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="mermaid w-full overflow-visible padding-[8em]"
    />
  );
}
