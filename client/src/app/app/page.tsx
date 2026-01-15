"use client";

import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/authFetch";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UsageSummary {
  lessonPlans: number;
  creditBalance: number;
  name: string;
  plan: string;
  usage_summary: {
    diagram_used: number;
    realtimeMinutes: number;
    videos_used: number;
  };
}

interface LessonsInterface {
  id: string;
  topic: string;
  type: string;
  gradeLevel: string;
  programmingLanguage: string;
  domain: string;
  slides: any[];
}

export default function Home() {
  const { loading, user } = useAuth();
  const [usageSummary, setUsageSummary] = useState<UsageSummary>();
  const [lessons, setLessons] = useState<LessonsInterface[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }
    const fetchData = async () => {
      try {
        setPageLoading(true);
        const [usageRes, lessonRes] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/usage-summary`),
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/lessons`),
        ]);

        setUsageSummary(await usageRes.json());
        setLessons(await lessonRes.json());
      } catch (e) {
        console.error("Auth fetch failed", e);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [loading, user]);

  if (loading || pageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">VP</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Voice Prep</h1>
          </div>

          {!loading && !user && (
            <div className="flex gap-3">
              <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                Login
              </button>
              <button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                Sign Up
              </button>
            </div>
          )}

          {!loading && user && (
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={(e) => router.push("/dashboard")}
            >
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {user.name}
                </div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">
            Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
          </h2>
          <p className="text-gray-400 text-lg">
            Choose a tool to start your learning journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">
                Total Sessions
              </span>
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">
              {usageSummary?.lessonPlans}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">
                Real-time minutes used
              </span>
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">
              {usageSummary?.usage_summary.realtimeMinutes}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">
                Current Plan
              </span>
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">
              {usageSummary?.plan}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Your Tools</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Interview Prep - Coming Soon */}
            <div className="relative group cursor-not-allowed">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl" />
              <div className="relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 opacity-60">
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-semibold">
                    COMING SOON
                  </span>
                </div>

                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-400"
                  >
                    <path d="M20 7h-9"></path>
                    <path d="M14 17H5"></path>
                    <circle cx="17" cy="17" r="3"></circle>
                    <circle cx="7" cy="7" r="3"></circle>
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  AI Interview Prep
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Practice technical interviews with an AI moderator. Solve
                  coding problems, get real-time feedback, and improve your
                  communication skills.
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>30 min sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Real-time feedback</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Tutor - Active */}
            <a href="/app/tutor" className="relative group block cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl" />
              <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-all duration-300 rounded-2xl" />
              <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 group-hover:border-purple-500/50 rounded-2xl p-8 transition-all duration-300 group-hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]">
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-xs font-semibold">
                    ACTIVE
                  </span>
                </div>

                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-400"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">AI Tutor</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Learn new programming topics with a personalized AI tutor. Get
                  collaborative explanations, real-life examples, and hands-on
                  coding practice.
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
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
                    <span>Interactive lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <span>Code practice</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center text-purple-400 font-medium group-hover:gap-3 gap-2 transition-all">
                  <span>Start learning</span>
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
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-6">
            Recent Activity
          </h3>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center hover:scale-[102%] transition-all ease-in-out  hover:bg-gray-800 gap-4 p-4 bg-gray-700/30 rounded-lg"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-purple-400"
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
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{lesson.topic}</div>
                    <div className="text-gray-400 text-sm">
                      {lesson.type} | {lesson.programmingLanguage} |{" "}
                      {lesson.gradeLevel}
                    </div>
                  </div>
                  <button
                    className="text-green-400 font-semibold cursor-pointer"
                    onClick={() => router.push(`/app/tutor?lessonId=${lesson.id}`)}
                  >
                    Revise again
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
