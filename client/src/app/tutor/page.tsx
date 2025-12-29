"use client";

import ChartVisualizer from "@/components/ChartVisualizer";
import {
  CodeCard,
  NoteCard,
  SlideCard,
  VideoCard,
  VisualCard,
} from "@/components/LearningCards";
import MermaidDiagram from "@/components/MermaidDiagram";
import VoiceAgent from "@/components/VoiceAgent";
import { useAuth } from "@/contexts/AuthContext";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function TutorPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [setupComplete, setSetupComplete] = useState(false);
  const [tutorType, setTutorType] = useState<"general" | "coding" | null>(null);

  const [config, setConfig] = useState({
    topic: "",
    domain: "medical",
    language: "javascript",
    experience: "beginner",
  });

  const {
    status,
    isSessionActive,
    learningStream,
    startSession,
    stopSession,
    isMuted,
    toggleMute,
    agentState,
    executionStates,
    runCode,
    sendMessage,
    updateLearningItem,
  } = useVoiceAgent();

  const [expandedItem, setExpandedItem] = useState<any>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading, router]);

  useEffect(() => {
    if (streamEndRef.current) {
      streamEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [learningStream.length]);

  const handleStartTutor = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupComplete(true);
  };

  const handleSessionStart = () => {
    startSession("tutor", config);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Type Selection Screen
  if (!tutorType) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Choose Your Learning Path
            </h1>
            <p className="text-gray-400 text-lg">
              Select the type of tutoring session you'd like to start
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* General Topics Card */}
            <button
              onClick={() => setTutorType("general")}
              className="group relative bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700 hover:border-blue-500/50 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-400"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  General Topics
                </h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Learn about medical concepts, legal principles, accounting
                  practices, business strategies, and more through interactive
                  conversations and visual explanations.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                    Medical
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                    Law
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                    Accounting
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                    Business
                  </span>
                </div>

                <div className="flex items-center text-blue-400 font-medium group-hover:gap-3 gap-2 transition-all">
                  <span>Start Learning</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Coding Topics Card */}
            <button
              onClick={() => setTutorType("coding")}
              className="group relative bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700 hover:border-purple-500/50 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-400"
                  >
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  Coding & Programming
                </h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Master programming languages, frameworks, and algorithms with
                  hands-on code examples, live execution, and real-time feedback
                  on your solutions.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20">
                    JavaScript
                  </span>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20">
                    Python
                  </span>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20">
                    Java
                  </span>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20">
                    More...
                  </span>
                </div>

                <div className="flex items-center text-purple-400 font-medium group-hover:gap-3 gap-2 transition-all">
                  <span>Start Coding</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Configuration Screen
  if (!setupComplete) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <div className="mb-8">
            <button
              onClick={() => setTutorType(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Change Learning Path
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  tutorType === "general"
                    ? "bg-blue-500/20"
                    : "bg-purple-500/20"
                }`}
              >
                {tutorType === "general" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-400"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-400"
                  >
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Configure Your{" "}
                  {tutorType === "general" ? "Learning" : "Coding"} Session
                </h1>
                <p className="text-gray-400 mt-1">
                  Tell us what you want to learn and we'll customize the
                  experience
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleStartTutor} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What topic do you want to learn?
              </label>
              <input
                type="text"
                required
                value={config.topic}
                onChange={(e) =>
                  setConfig({ ...config, topic: e.target.value })
                }
                placeholder={
                  tutorType === "general"
                    ? "e.g., Cardiovascular System, Contract Law, Financial Statements"
                    : "e.g., React Hooks, Python Decorators, Data Structures"
                }
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            </div>

            {tutorType === "general" ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject Domain
                </label>
                <select
                  value={config.domain}
                  onChange={(e) =>
                    setConfig({ ...config, domain: e.target.value })
                  }
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                >
                  <option value="medical">Medical & Healthcare</option>
                  <option value="law">Law & Legal Studies</option>
                  <option value="accounting">Accounting & Finance</option>
                  <option value="business">Business & Management</option>
                  <option value="engineering">Engineering</option>
                  <option value="science">Science & Research</option>
                  <option value="other">Other</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Programming Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "GO"].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setConfig({ ...config, language: lang })}
                      className={`px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${
                        config.language === lang
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25 border-2 border-purple-400"
                          : "bg-gray-700/50 text-gray-300 hover:bg-gray-600 border-2 border-transparent"
                      }`}
                    >
                      {lang === "CPP"
                        ? "C++"
                        : lang === "JAVASCRIPT"
                        ? "JS"
                        : lang === "TYPESCRIPT"
                        ? "TS"
                        : lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    value: "BEGINNER",
                    label: "Beginner",
                    desc: "New to this topic",
                  },
                  {
                    value: "INTERMEDIATE",
                    label: "Intermediate",
                    desc: "Some experience",
                  },
                  {
                    value: "EXPERIENCE",
                    label: "Advanced",
                    desc: "Expert level",
                  },
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() =>
                      setConfig({ ...config, experience: level.value })
                    }
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      config.experience === level.value
                        ? tutorType === "general"
                          ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/25"
                          : "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gray-700/50 border-transparent text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <div className="font-semibold mb-1">{level.label}</div>
                    <div className="text-xs opacity-80">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={`w-full font-bold py-4 px-6 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                tutorType === "general"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25"
              } text-white text-lg`}
            >
              Start Learning Session
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Main Learning Interface
  return (
    <main className="flex h-screen w-full overflow-hidden bg-gray-900">
      {/* Left Panel: Voice Agent & Info */}
      <div className="w-1/3 min-w-[380px] border-r border-gray-700 flex flex-col">
        <div className="flex-1 border-b border-gray-700">
          <VoiceAgent
            isSessionActive={isSessionActive}
            status={status}
            startSession={handleSessionStart}
            stopSession={stopSession}
            isMuted={isMuted}
            toggleMute={toggleMute}
            agentState={agentState}
            title={tutorType === "general" ? "AI Tutor" : "AI Coding Tutor"}
            buttonText="Start Learning"
          />
        </div>

        {/* Session Info Panel */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-800/30">
          <div className="flex items-center justify-between mb-6">
            <h3
              className={`text-sm font-bold uppercase tracking-wider ${
                tutorType === "general" ? "text-blue-400" : "text-purple-400"
              }`}
            >
              Session Configuration
            </h3>
            <button
              onClick={() => {
                setSetupComplete(false);
                stopSession();
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Reconfigure
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700/50">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Topic
              </div>
              <div className="text-white font-medium">{config.topic}</div>
            </div>

            {tutorType === "general" ? (
              <div className="bg-black/30 p-4 rounded-lg border border-gray-700/50">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Domain
                </div>
                <div className="text-white font-medium capitalize">
                  {config.domain.replace("_", " ")}
                </div>
              </div>
            ) : (
              <div className="bg-black/30 p-4 rounded-lg border border-gray-700/50">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Language
                </div>
                <div className="text-white font-medium capitalize">
                  {config.language === "cpp" ? "C++" : config.language}
                </div>
              </div>
            )}

            <div className="bg-black/30 p-4 rounded-lg border border-gray-700/50">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Experience Level
              </div>
              <div className="text-white font-medium capitalize">
                {config.experience}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-lg border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-2">Learning Type</div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                tutorType === "general"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              }`}
            >
              {tutorType === "general" ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  General Topics
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Coding & Programming
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Learning Workspace */}
      <div className="flex-1 h-full flex flex-col bg-[#0d1117]">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-[#161b22]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                tutorType === "general"
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-purple-500/10 text-purple-400"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <div>
              <div className="text-gray-200 font-medium">Learning Notebook</div>
              <div className="text-xs text-gray-500">
                {tutorType === "general"
                  ? "Concepts & Explanations"
                  : "Code & Examples"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                isSessionActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-gray-700/50 text-gray-400 border border-gray-600/30"
              }`}
            >
              {isSessionActive ? "● Active" : "○ Inactive"}
            </span>
          </div>
        </div>

        {/* Stream Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {learningStream.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-24 h-24 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-6 border border-gray-700/50">
                {tutorType === "general" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-600"
                  >
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-600"
                  >
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                )}
              </div>
              <p className="text-xl font-semibold text-gray-400 mb-2">
                Ready to start learning
              </p>
              <p className="text-sm text-gray-500 text-center max-w-md">
                {tutorType === "general"
                  ? "Your learning materials, diagrams, and explanations will appear here as you discuss with your AI tutor"
                  : "Code examples, explanations, and interactive exercises will appear here as you learn"}
              </p>
              <div className="mt-8 flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Interactive Learning
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  Voice Enabled
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Real-time Feedback
                </div>
              </div>
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
                    key={item.id}
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
                console.log("Top level component: ", item.code);
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
          {/* Auto-scroll anchor */}
          <div id="stream-end" ref={streamEndRef} />
        </div>
      </div>

      {/* Full Screen Modal */}
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
    </main>
  );
}
