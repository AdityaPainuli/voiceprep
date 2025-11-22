"use client";

import { useState, useRef, useEffect } from "react";
import VoiceAgent from "@/components/VoiceAgent";
import CodeEditor from "@/components/CodeEditor";
import ChartVisualizer from "@/components/ChartVisualizer";
import { NoteCard, VisualCard, CodeCard, SlideCard } from "@/components/LearningCards";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";

export default function TutorPage() {
    const [setupComplete, setSetupComplete] = useState(false);
    const [config, setConfig] = useState({
        topic: "",
        language: "javascript",
        experience: "beginner"
    });

    const [code, setCode] = useState("// Code examples will appear here...");

    const {
        isSessionActive,
        status,
        correctedCode,
        isSubmitting,
        output,
        isRunning,
        executionStates,
        startSession,
        stopSession,
        sendCode,
        runCode,
        clearCorrection,
        isMuted,
        toggleMute,
        isError,
        agentState,
        visualization,
        setVisualization,
        learningStream,
        sendMessage,
        updateLearningItem
    } = useVoiceAgent();

    // Auto-scroll to bottom when learningStream changes
    const streamEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (streamEndRef.current) {
            streamEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [learningStream.length]); // Scroll when new items are added

    const handleStartTutor = (e: React.FormEvent) => {
        e.preventDefault();
        setSetupComplete(true);
        // We'll start the session immediately after setup, or let the user click start
        // For now, let's just show the interface
    };

    const handleSessionStart = () => {
        startSession('tutor', config);
    };

    const handleRun = () => {
        runCode(code);
    };

    const handleApplyCorrection = () => {
        if (correctedCode) {
            setCode(correctedCode);
            clearCorrection();
        }
    };

    if (!setupComplete) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
                <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-sm">
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Configure Your AI Tutor</h1>
                        <p className="text-gray-400 mt-2">Tell us what you want to learn</p>
                    </div>

                    <form onSubmit={handleStartTutor} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Topic to Learn</label>
                            <input
                                type="text"
                                required
                                value={config.topic}
                                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                                placeholder="e.g., React Hooks, Python Decorators, Rust Ownership"
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Language</label>
                            <select
                                value={config.language}
                                onChange={(e) => setConfig({ ...config, language: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all appearance-none"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="rust">Rust</option>
                                <option value="go">Go</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['beginner', 'intermediate', 'advanced'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setConfig({ ...config, experience: level })}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${config.experience === level
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Start Learning Session
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="flex h-screen w-full overflow-hidden bg-gray-900">
            {/* Left Panel: Voice Agent */}
            <div className="w-1/3 min-w-[350px] border-r border-gray-700 flex flex-col">
                <div className="flex-1">
                    <VoiceAgent
                        isSessionActive={isSessionActive}
                        status={status}
                        startSession={handleSessionStart}
                        stopSession={stopSession}
                        isMuted={isMuted}
                        toggleMute={toggleMute}
                        agentState={agentState}
                        title="AI Tutor"
                        buttonText="Start Learning"
                    />
                </div>

                {/* Info Panel */}
                <div className="flex-1 overflow-y-auto p-6 border-t border-gray-700 bg-gray-800/50">
                    <h3 className="text-sm font-bold text-purple-400 mb-2 uppercase tracking-wider">Session Info</h3>
                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-700/50">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Topic</div>
                            <div className="text-white font-medium">{config.topic}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/30 p-4 rounded-lg border border-gray-700/50">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Language</div>
                                <div className="text-white font-medium capitalize">{config.language}</div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg border border-gray-700/50">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Level</div>
                                <div className="text-white font-medium capitalize">{config.experience}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Learning Workspace */}
            <div className="flex-1 h-full flex flex-col bg-[#0d1117]">
                {/* Header for Content Area */}
                <div className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-[#161b22]">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        </div>
                        <div className="text-gray-200 font-medium">
                            Learning Notebook
                        </div>
                    </div>
                </div>

                {/* Stream Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {learningStream.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            </div>
                            <p className="text-lg font-medium">Your learning notes will appear here</p>
                            <p className="text-sm">Start talking to the tutor to generate content</p>
                        </div>
                    ) : (
                        learningStream.map((item) => {
                            if (item.type === 'note') {
                                return (
                                    <NoteCard
                                        key={item.id}
                                        title={item.title}
                                        content={item.content}
                                        tags={item.tags}
                                        onSave={item.title.toLowerCase().includes('plan') ? (newContent) => {
                                            // Update local state immediately
                                            updateLearningItem(item.id, { content: newContent });
                                            // Notify AI
                                            sendMessage(`I have updated the lesson plan. Here is the new version:\n\n${newContent}\n\nPlease confirm and let's start.`);
                                        } : undefined}
                                    />
                                );
                            } else if (item.type === 'visual') {
                                return (
                                    <VisualCard
                                        key={item.id}
                                        type={item.chartType}
                                        data={item.data}
                                        title={item.title}
                                        description={item.description}
                                    />
                                );
                            } else if (item.type === 'code') {
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
                            } else if (item.type === 'slide') {
                                return (
                                    <SlideCard
                                        key={item.id}
                                        title={item.title}
                                        bulletPoints={item.bulletPoints}
                                    />
                                );
                            }
                            return null;
                        })
                    )}
                    {/* Auto-scroll anchor */}
                    <div id="stream-end" ref={streamEndRef} />
                </div>
            </div>
        </main>
    )
}


