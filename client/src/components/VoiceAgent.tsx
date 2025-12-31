"use client";

import React from "react";

interface VoiceAgentProps {
  isSessionActive: boolean;
  status: string;
  startSession: () => void;
  stopSession: () => void;
  pastSession?: boolean;
  isMuted?: boolean;
  toggleMute?: () => void;
  agentState?: "idle" | "listening" | "thinking" | "speaking";
  title?: string;
  buttonText?: string;
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({
  isSessionActive,
  status,
  startSession,
  pastSession = false,
  stopSession,
  isMuted = false,
  toggleMute,
  agentState = "idle",
  title = "Interviewer AI",
  buttonText = "Start Interview",
}) => {
  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 10.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="font-bold text-xl tracking-tight">{title}</h1>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            status === "Connected"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : status === "Error"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-gray-800 border-gray-700 text-gray-400"
          }`}
        >
          {status}
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center min-h-[200px]">
        {/* Central Orb */}
        <div className="relative">
          {/* Outer glow rings */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-blue-500/20 transition-all duration-1000 ${
              isSessionActive ? "scale-110 opacity-100" : "scale-90 opacity-0"
            }`}
          />
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full border border-purple-500/20 transition-all duration-1000 delay-100 ${
              isSessionActive ? "scale-110 opacity-100" : "scale-90 opacity-0"
            }`}
          />

          {/* Core Circle */}
          <div
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
              isSessionActive
                ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-[0_0_50px_rgba(59,130,246,0.5)]"
                : "bg-gray-800 shadow-none"
            }`}
          >
            {isSessionActive ? (
              <div className="w-full h-full rounded-full animate-pulse flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white/90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </div>
        </div>

        <p className="mt-8 text-gray-400 text-sm font-medium text-center max-w-[200px] animate-pulse">
          {isSessionActive
            ? isMuted
              ? "Microphone Muted"
              : agentState === "listening"
              ? "Listening..."
              : agentState === "thinking"
              ? "Thinking..."
              : agentState === "speaking"
              ? "Speaking..."
              : "Listening..."
            : "Ready to start"}
        </p>
      </div>

      {/* Controls */}
      <div className="relative z-10 mt-auto flex flex-col gap-3">
        {isSessionActive && toggleMute && (
          <button
            onClick={toggleMute}
            className={`w-full py-3 px-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${
              isMuted
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            {isMuted ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12.732a1 1 0 01-1.707.707L4.586 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.586l3.707-3.439a1 1 0 011.09-.485zM16 10a6 6 0 00-3.815-5.586 1 1 0 011.176-1.628A8 8 0 0116 10zM12 10a2 2 0 00-1.815-1.992 1 1 0 01.362-1.966A4 4 0 0112 10z"
                    clipRule="evenodd"
                  />
                </svg>
                Unmute Microphone
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12.732a1 1 0 01-1.707.707L4.586 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.586l3.707-3.439a1 1 0 011.09-.485zM16 10a6 6 0 00-3.815-5.586 1 1 0 011.176-1.628A8 8 0 0116 10zM12 10a2 2 0 00-1.815-1.992 1 1 0 01.362-1.966A4 4 0 0112 10z"
                    clipRule="evenodd"
                  />
                </svg>
                Mute Microphone
              </>
            )}
          </button>
        )}

        <button
          disabled={pastSession}
          onClick={isSessionActive ? stopSession : startSession}
          className={`w-full py-4 px-6 rounded-xl font-bold shadow-lg transition-all transform
    ${
      pastSession
        ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70 shadow-none"
        : isSessionActive
        ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]"
        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
    }
  `}
        >
          {isSessionActive ? "End Session" : buttonText}
        </button>
      </div>
    </div>
  );
};

export default VoiceAgent;
