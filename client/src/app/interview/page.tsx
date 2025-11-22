"use client";

import VoiceAgent from "@/components/VoiceAgent";
import CodeEditor from "@/components/CodeEditor";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { useState, useEffect } from "react";

export default function InterviewPage() {
    const [code, setCode] = useState("// Write your solution here...");
    const [language, setLanguage] = useState("javascript");
    const {
        isSessionActive,
        status,
        question,
        correctedCode,
        isSubmitting,
        output,
        isRunning,
        startSession,
        stopSession,
        sendCode,
        runCode,
        clearCorrection,
        isMuted,
        toggleMute,
        isError,
        testCases,
        isSolved,
        nextQuestion,
        agentState
    } = useVoiceAgent();

    const handleSubmit = () => {
        sendCode(code);
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

    return (
        <main className="flex h-screen w-full overflow-hidden bg-gray-900">
            {/* Left Panel: Voice Agent */}
            <div className="w-1/3 min-w-[350px] border-r border-gray-700 flex flex-col">
                <div className="flex-1">
                    <VoiceAgent
                        isSessionActive={isSessionActive}
                        status={status}
                        startSession={() => startSession('interview')}
                        stopSession={stopSession}
                        isMuted={isMuted}
                        toggleMute={toggleMute}
                        agentState={agentState}
                    />
                </div>

                {/* Question Panel */}
                {question && (
                    <div className="flex-1 overflow-y-auto p-6 border-t border-gray-700 bg-gray-800/50">
                        <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Current Question</h3>
                        <div className="text-white text-sm leading-relaxed font-mono bg-black/30 p-4 rounded-lg border border-gray-700/50 shadow-inner">
                            {question ? (
                                <div className="space-y-4">
                                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {question}
                                    </div>

                                    {testCases.length > 0 && (
                                        <div className="bg-black/30 rounded p-3 border border-gray-700/50">
                                            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">Test Cases</h3>
                                            <div className="space-y-2">
                                                {testCases.map((tc, i) => (
                                                    <div key={i} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm font-mono">
                                                        <span className="text-gray-500">Input:</span>
                                                        <span className="text-green-400/80">{tc.input}</span>
                                                        <span className="text-gray-500">Output:</span>
                                                        <span className="text-blue-400/80">{tc.expectedOutput}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isSolved && (
                                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
                                            <div className="flex items-center gap-2 text-green-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                <span className="font-medium">Great job! Problem solved.</span>
                                            </div>
                                            <button
                                                onClick={nextQuestion}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                Next Question
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-white text-sm leading-relaxed font-mono bg-black/30 p-4 rounded-lg border border-gray-700/50 shadow-inner">
                                    {question}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: Code Editor */}
            <div className="flex-1 h-full">
                <CodeEditor
                    language={language}
                    setLanguage={setLanguage}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    onSubmit={handleSubmit}
                    onRun={handleRun}
                    isSubmitting={isSubmitting}
                    isRunning={isRunning}
                    isDiffMode={!!correctedCode}
                    originalCode={code}
                    modifiedCode={correctedCode || ""}
                    onApply={handleApplyCorrection}
                    onCancel={clearCorrection}
                    output={output}
                    isError={isError}
                />
            </div>
        </main>
    );
}
