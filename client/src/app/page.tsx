"use client";

import { motion } from "framer-motion";
import { DemoVideoPlayer } from "@/components/DemoVideoPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";

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
                        <ScrollReveal>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-8">
                                Master any subject with voice-first AI tutoring
                            </h1>
                        </ScrollReveal>
                        <ScrollReveal delay={0.2}>
                            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                                Experience the future of learning. Chat naturally with an expert AI tutor
                                that adapts to your pace, explains complex topics visually, and
                                helps you practice real-world scenarios.
                            </p>
                        </ScrollReveal>
                        <ScrollReveal delay={0.4} width="100%">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => router.push("/demo")}
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105"
                                >
                                    Try Demo
                                </button>
                                <button
                                    onClick={() => router.push("/register")}
                                    className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
                                >
                                    Get Started
                                </button>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Product Demo Video */}
            <section className="py-20 bg-[#0A0A0A] relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 relative">
                    <div className="text-center mb-12 relative z-20 bg-[#0A0A0A]">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium border border-indigo-500/20 mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            See it in action
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Real-time Interaction</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Watch how VoicePrep handles complex tutoring sessions with instant visual aids and natural conversation.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: -100, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="relative group max-w-5xl mx-auto z-10"
                    >
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                        {/* Browser Window Frame */}
                        <div className="relative rounded-2xl border border-gray-800 bg-[#161b22] shadow-2xl overflow-hidden">
                            {/* Window Header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                                </div>
                                {/* Fake URL Bar */}
                                <div className="ml-4 flex-1 max-w-2xl mx-auto h-7 bg-black/20 rounded-md flex items-center justify-center text-[11px] text-gray-500 font-mono border border-white/5 shadow-inner">
                                    <span className="text-gray-600 mr-2">🔒</span>
                                    voiceprep.ai/demo/live-session
                                </div>
                            </div>

                            {/* Video Content */}
                            <div className="aspect-video bg-gray-900 relative">
                                <DemoVideoPlayer
                                    src="/demo_video.mov"
                                    poster="/binary_tree_mermaid.jpeg"
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Visual Learning Gallery */}
            <section className="py-24 bg-[#0A0A0A] border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <ScrollReveal width="100%">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Visual Learning Engine</h2>
                        </ScrollReveal>
                        <ScrollReveal delay={0.2} width="100%">
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                                Don't just listen—see. VoicePrep instantly generates diagrams and animations to explain concepts clearly.
                            </p>
                        </ScrollReveal>
                    </div>

                    <div className="space-y-20">
                        {/* Mermaid Diagrams */}
                        <div>
                            <ScrollReveal>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <svg className="w-6 h-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Instant Flowcharts & Diagrams</h3>
                                </div>
                            </ScrollReveal>

                            <div className="grid md:grid-cols-2 gap-8">
                                <ScrollReveal delay={0.1} width="100%">
                                    <div className="group relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-all">
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 z-10" />
                                        <img
                                            src="/binary_tree_mermaid.jpeg"
                                            alt="Binary Tree Structure"
                                            className="w-full h-[350px] object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                            <h4 className="text-lg font-bold text-white mb-1">Binary Tree Structure</h4>
                                            <p className="text-sm text-gray-400">Generated instantly during a coding lesson</p>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={0.2} width="100%">
                                    <div className="group relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-all">
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 z-10" />
                                        <img
                                            src="/contract_mermaid.jpeg"
                                            alt="Legal Contract Flow"
                                            className="w-full h-[350px] object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                            <h4 className="text-lg font-bold text-white mb-1">Legal Contract Flow</h4>
                                            <p className="text-sm text-gray-400">Visualizing complex legal dependencies</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>

                        {/* Animations */}
                        <div>
                            <ScrollReveal>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Dynamic Concept Animations</h3>
                                </div>
                            </ScrollReveal>

                            <div className="grid md:grid-cols-3 gap-6">
                                <ScrollReveal delay={0.1} width="100%">
                                    <div className="group relative rounded-xl overflow-hidden border border-gray-800 bg-black">
                                        <video
                                            src="/assets_vs_liabilities_animation.mp4"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-[250px] object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Finance</span>
                                            <h4 className="text-white font-medium">Assets vs Liabilities</h4>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={0.2} width="100%">
                                    <div className="group relative rounded-xl overflow-hidden border border-gray-800 bg-black">
                                        <video
                                            src="/binary_search_and_insert_animation.mp4"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-[250px] object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Algorithms</span>
                                            <h4 className="text-white font-medium">Binary Search</h4>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={0.3} width="100%">
                                    <div className="group relative rounded-xl overflow-hidden border border-gray-800 bg-black">
                                        <video
                                            src="/binary_trees_animation.mp4"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-[250px] object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Data Structures</span>
                                            <h4 className="text-white font-medium">Tree Operations</h4>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
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
