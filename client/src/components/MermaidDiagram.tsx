import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
    chart: string;
}

// Initialize mermaid once
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
});

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const elementId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`).current;

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                // Clear previous error
                setError(null);

                // Validate chart content
                if (!chart) {
                    return;
                }

                // Render the diagram
                // We use a unique ID for each component instance to avoid collisions
                const { svg } = await mermaid.render(elementId, chart);
                setSvg(svg);
            } catch (err) {
                console.error('Mermaid rendering failed:', err);
                setError('Failed to render diagram');
                // Keep the old SVG or clear it? Clearing it is safer to avoid misleading info
                setSvg('');
            }
        };

        renderDiagram();
    }, [chart, elementId]);

    return (
        <div className="w-full flex justify-center overflow-x-auto py-4">
            {error ? (
                <div className="text-red-500 text-sm p-4 border border-red-500/20 rounded bg-red-500/10">
                    {error}
                </div>
            ) : (
                <div
                    dangerouslySetInnerHTML={{ __html: svg }}
                    className="mermaid-container"
                />
            )}
        </div>
    );
};

export default MermaidDiagram;
