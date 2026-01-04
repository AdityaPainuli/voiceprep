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

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "dark",
    });

    const id = `mermaid-${Math.random().toString(36).slice(2)}`;

    // 🔑 clear previous render
    containerRef.current.innerHTML = "";
    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch((err) => {
        console.error("Mermaid render error:", err);
        console.error("Code: ", chart);
      });
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto flex justify-center"
    />
  );
}
