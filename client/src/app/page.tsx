"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 pb-2">
          AI Developer Assistant
        </h1>

        {!loading && !user && (
          <div className="flex gap-4">
            <Link href="/login" className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors">
              Register
            </Link>
          </div>
        )}

        {!loading && user && (
          <div className="flex gap-4 items-center">
            <span className="text-gray-400">Welcome, {user.email}</span>
            <Link href="/dashboard" className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
              Go to Dashboard
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Interview Prep Card */}
          <Link
            href="/interview"
            className="group relative block p-8 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Interview Prep</h2>
              <p className="text-gray-400">
                Practice technical interviews with an AI moderator. Solve coding problems, get real-time feedback, and improve your communication skills.
              </p>
            </div>
          </Link>

          {/* AI Tutor Card */}
          <Link
            href="/tutor"
            className="group relative block p-8 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Tutor</h2>
              <p className="text-gray-400">
                Learn new programming topics with a personalized AI tutor. Get collaborative explanations, real-life examples, and hands-on coding practice.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
