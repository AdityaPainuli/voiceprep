"use client";

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale
);

interface ChartVisualizerProps {
    type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
    data: any;
    title?: string;
    description?: string;
}

const ChartVisualizer: React.FC<ChartVisualizerProps> = ({ type, data, title, description }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                }
            },
            title: {
                display: !!title,
                text: title,
                color: 'rgba(255, 255, 255, 0.9)',
                font: {
                    size: 16
                }
            },
        },
        scales: type === 'bar' || type === 'line' ? {
            x: {
                ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        } : type === 'radar' ? {
            r: {
                ticks: { display: false },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: { color: 'rgba(255, 255, 255, 0.6)' }
            }
        } : undefined,
    };

    const renderChart = () => {
        if (!data || !data.datasets || !Array.isArray(data.datasets)) {
            return <div className="text-red-400 p-4">Invalid chart data: Missing datasets</div>;
        }

        switch (type) {
            case 'bar':
                return <Bar data={data} options={options} />;
            case 'line':
                return <Line data={data} options={options} />;
            case 'pie':
                return <Pie data={data} options={options} />;
            case 'doughnut':
                return <Doughnut data={data} options={options} />;
            case 'radar':
                return <Radar data={data} options={options} />;
            default:
                return <div className="text-red-400">Unsupported chart type: {type}</div>;
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-800/50 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
            {description && (
                <div className="mb-4 text-gray-300 text-sm leading-relaxed bg-black/20 p-3 rounded-lg border border-gray-700/50">
                    {description}
                </div>
            )}
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
                {renderChart()}
            </div>
        </div>
    );
};

export default ChartVisualizer;
