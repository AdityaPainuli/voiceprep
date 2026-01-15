"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/app");
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Navigation */}
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white">VP</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">VoicePrep</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/login")}
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => router.push("/demo")}
                            className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Try Demo
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0A0A0A] to-[#0A0A0A]" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-8">
                            Master any subject with voice-first AI tutoring
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                            Experience the future of learning. Chat naturally with an expert AI tutor
                            that adapts to your pace, explains complex topics visually, and
                            helps you practice real-world scenarios.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => router.push("/demo")}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105"
                            >
                                Start Free Demo
                            </button>
                            <button
                                onClick={() => router.push("/register")}
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={
                                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            }
                            title="Natural Voice"
                            description="Talk naturally with an AI that understands context, interruptions, and nuance just like a human tutor."
                        />
                        <FeatureCard
                            icon={
                                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                            title="Visual Learning"
                            description="Concepts come alive with real-time diagrams, charts, and animations generated on the fly as you learn."
                        />
                        <FeatureCard
                            icon={
                                <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            }
                            title="Instant Feedback"
                            description="Get immediate corrections, code reviews, and explanations to help you master topics faster."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    );
}
