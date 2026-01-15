import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

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

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute bottom-4 right-4 flex gap-2 z-10 bg-gray-800/80 p-1.5 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl">
      <button
        onClick={() => zoomIn()}
        className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
        title="Zoom In"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button
        onClick={() => zoomOut()}
        className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
        title="Zoom Out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <div className="w-px bg-gray-700 mx-0.5"></div>
      <button
        onClick={() => resetTransform()}
        className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
        title="Reset View"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
      </button>
    </div>
  );
};

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    setIsRendered(false);

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
          setIsRendered(true);
        }
      })
      .catch((err) => {
        console.error("Mermaid render error:", err);
        console.error("Code: ", chart);
      });
  }, [chart]);

  return (
    <div className="w-full h-full min-h-[inherit] relative bg-[#0d1117] rounded-lg overflow-hidden border border-gray-800/50">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        limitToBounds={false}
      >
        <Controls />
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full flex items-center justify-center p-4"
        >
          <div
            ref={containerRef}
            className={`transition-opacity duration-300 ${isRendered ? "opacity-100" : "opacity-0"
              }`}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
