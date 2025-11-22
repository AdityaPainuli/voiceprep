import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
    chart: string;
}

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
});

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            mermaid.contentLoaded();
            const renderDiagram = async () => {
                try {
                    const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart);
                    if (containerRef.current) {
                        containerRef.current.innerHTML = svg;
                    }
                } catch (error) {
                    console.error('Mermaid rendering failed:', error);
                    if (containerRef.current) {
                        containerRef.current.innerHTML = '<div class="text-red-500 text-sm">Failed to render diagram</div>';
                    }
                }
            };
            renderDiagram();
        }
    }, [chart]);

    return <div ref={containerRef} className="w-full flex justify-center overflow-x-auto py-4" />;
};

export default MermaidDiagram;
