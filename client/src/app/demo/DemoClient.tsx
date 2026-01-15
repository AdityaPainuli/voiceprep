"use client";

import { ToastContainer } from "@/components/ToastContainer";
import VoiceAgent from "@/components/VoiceAgent";
import MermaidDiagram from "@/components/MermaidDiagram";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CodeCard, NoteCard, SlideCard, VideoCard, VisualCard } from "@/components/LearningCards";
import ChartVisualizer from "@/components/ChartVisualizer";

export default function DemoClient() {
    const router = useRouter();
    const [hasStarted, setHasStarted] = useState(false);

    const {
        status,
        isSessionActive,
        learningStream,
        startSession,
        stopSession,
        isMuted,
        toggleMute,
        agentState,
        completed,
        completionMeta,
        toasts,
        executionStates,
        runCode,
        sendMessage,
        updateLearningItem,

    } = useVoiceAgent();

    const streamEndRef = useRef<HTMLDivElement>(null);
    const [expandedItem, setExpandedItem] = useState<any>(null);


    useEffect(() => {
        if (streamEndRef.current) {
            streamEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [learningStream.length]);

    const handleStartDemo = () => {
        setHasStarted(true);
        startSession("demo", {
            topic: "How internet works?",
            experience: "beginner",
            type: "general"
        });
    };

    const handleEndDemo = () => {
        stopSession();
        router.push("/register");
    }

    return (
        <>
            <ToastContainer toasts={toasts} />
            <div className="flex h-screen w-full bg-[#0d1117] overflow-hidden">
                {/* Left Panel: Voice Agent */}
                <div className="w-1/3 min-w-[380px] border-r border-gray-800 flex flex-col bg-[#0d1117]">
                    {/* Header */}
                    <div className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-[#161b22]">
                        <div className="flex items-center gap-2" onClick={() => router.push("/")} style={{ cursor: 'pointer' }}>
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-white text-xs">VP</span>
                            </div>
                            <span className="font-bold text-gray-200">VoicePrep <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full ml-1">DEMO</span></span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col relative">
                        <VoiceAgent
                            isSessionActive={isSessionActive}
                            pastSession={false}
                            status={status}
                            startSession={handleStartDemo}
                            stopSession={stopSession}
                            isMuted={isMuted}
                            toggleMute={toggleMute}
                            agentState={agentState}
                            title="Demo Tutor"
                            buttonText="Start Demo Session"
                        />

                        {!isSessionActive && !hasStarted && (
                            <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 text-center">
                                <div className="max-w-md">
                                    <h2 className="text-3xl font-bold text-white mb-4">Try VoicePrep Demo</h2>
                                    <p className="text-gray-400 mb-8">
                                        Experience a 5-minute interactive session about the Solar System using our voice-to-voice AI tutor.
                                    </p>
                                    <button
                                        onClick={handleStartDemo}
                                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-indigo-500/25"
                                    >
                                        Start Demo
                                    </button>
                                </div>
                            </div>
                        )}

                        {completed && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
                                <div className="bg-[#161b22] rounded-2xl p-8 max-w-lg w-full border border-gray-800 shadow-2xl text-center">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Demo Completed!</h2>
                                    <div className="text-gray-400 mb-8">
                                        {typeof completionMeta?.summary === 'string' ? (
                                            <p>{completionMeta.summary}</p>
                                        ) : (
                                            <div className="flex flex-col gap-4 text-left bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                                                        <div className="text-3xl font-bold text-indigo-400 mb-1">
                                                            {/* @ts-ignore */}
                                                            {completionMeta?.summary?.diagramsUsed || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Diagrams</div>
                                                    </div>
                                                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                                                        <div className="text-3xl font-bold text-purple-400 mb-1">
                                                            {/* @ts-ignore */}
                                                            {completionMeta?.summary?.animationUsed || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Animations</div>
                                                    </div>
                                                </div>
                                                <div className="text-center mt-2">
                                                    <span className="text-gray-400">Interaction Rating: </span>
                                                    {/* @ts-ignore */}
                                                    <span className="text-white font-bold">{completionMeta?.summary?.confidence || "Great"}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors"
                                            onClick={() => router.push("/register")}
                                        >
                                            Create Free Account
                                        </button>
                                        <button
                                            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition-colors"
                                            onClick={() => router.push("/")}
                                        >
                                            Back to Home
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Content */}
                <div className="flex-1 bg-[#0d1117] flex flex-col relative">
                    <div className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-[#161b22]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-300">Live Workspace</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
                        {learningStream.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
                                <svg className="w-32 h-32 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                <p className="text-xl font-bold text-gray-500">Workspace Empty</p>
                                <p className="text-gray-600">Start talking to see content appear here</p>
                            </div>
                        ) : (
                            learningStream.map((item) => {
                                if (item.type === "note") {
                                    return (
                                        <NoteCard
                                            key={item.id}
                                            title={item.title}
                                            content={item.content}
                                            tags={item.tags}
                                            onSave={
                                                item.title.toLowerCase().includes("plan")
                                                    ? (newContent) => {
                                                        // Update local state immediately
                                                        updateLearningItem(item.id, {
                                                            content: newContent,
                                                        });
                                                        // Notify AI
                                                        sendMessage(
                                                            `I have updated the lesson plan. Here is the new version:\n\n${newContent}\n\nPlease confirm and let's start.`
                                                        );
                                                    }
                                                    : undefined
                                            }
                                        />
                                    );
                                } else if (item.type === "visual") {
                                    return (
                                        <VisualCard
                                            key={`${item.id}-${item.data.length}`}
                                            id={item.id}
                                            type={item.chartType}
                                            data={item.data}
                                            title={item.title}
                                            description={item.description}
                                            onExpand={() =>
                                                setExpandedItem({
                                                    type: "visual",
                                                    data: item.data,
                                                    title: item.title,
                                                    description: item.description,
                                                    chartType: item.chartType,
                                                })
                                            }
                                        />
                                    );
                                } else if (item.type === "code") {
                                    return (
                                        <CodeCard
                                            key={item.id}
                                            code={item.code}
                                            language={item.language}
                                            explanation={item.explanation}
                                            onRun={(code) => runCode(code, item.id)}
                                            isRunning={executionStates[item.id]?.isRunning}
                                            output={executionStates[item.id]?.output}
                                            isError={executionStates[item.id]?.isError}
                                        />
                                    );
                                } else if (item.type === "slide") {
                                    return (
                                        <SlideCard
                                            key={item.id}
                                            title={item.title}
                                            bulletPoints={item.bulletPoints}
                                        />
                                    );
                                } else if (item.type === "animation") {
                                    return (
                                        <VideoCard
                                            key={item.id}
                                            url={item.url}
                                            title={item.title}
                                            description={item.description}
                                            onExpand={() =>
                                                setExpandedItem({
                                                    type: "video",
                                                    url: item.url,
                                                    title: item.title,
                                                    description: item.description,
                                                })
                                            }
                                        />
                                    );
                                }
                                return null;
                            })
                        )}
                        <div ref={streamEndRef} className="h-4" />
                    </div>

                    {expandedItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-8 animate-in fade-in duration-200">
                            <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col">
                                <button
                                    onClick={() => setExpandedItem(null)}
                                    className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>

                                <div className="bg-[#161b22] rounded-xl border border-gray-800 p-8 shadow-2xl overflow-hidden flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4 flex-1">
                                        <h2 className="text-2xl font-bold text-white">
                                            {expandedItem.title}
                                        </h2>
                                        {expandedItem.type === "visual" && (
                                            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm font-medium rounded-full border border-purple-500/20 uppercase">
                                                {expandedItem.chartType === "mermaid"
                                                    ? "Diagram"
                                                    : `${expandedItem.chartType} Chart`}
                                            </span>
                                        )}
                                        {expandedItem.type === "video" && (
                                            <span className="px-3 py-1 bg-red-500/10 text-red-400 text-sm font-medium rounded-full border border-red-500/20 uppercase">
                                                Animation
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-auto min-h-0 flex items-center justify-center bg-black/20 rounded-lg border border-gray-800/50 p-4">
                                        {expandedItem.type === "visual" && expandedItem.chartType && (
                                            <div className="w-full h-full min-h-[500px]">
                                                {expandedItem.chartType === "mermaid" ? (
                                                    <div className="w-full h-full flex items-center justify-center overflow-auto">
                                                        <MermaidDiagram chart={expandedItem.data} />
                                                    </div>
                                                ) : (
                                                    <ChartVisualizer
                                                        type={expandedItem.chartType}
                                                        data={expandedItem.data}
                                                        title=""
                                                        description=""
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {expandedItem.type === "video" && expandedItem.url && (
                                            <video
                                                src={expandedItem.url}
                                                controls
                                                autoPlay
                                                className="max-w-full max-h-full rounded-lg shadow-lg"
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                    </div>

                                    {expandedItem.description && (
                                        <div className="mt-6 text-gray-300 bg-gray-800/30 p-4 rounded-lg border border-gray-800/50 text-lg">
                                            {expandedItem.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
