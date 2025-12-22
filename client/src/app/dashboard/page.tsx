"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PLANS = [
    { name: 'BASIC', price: '$10/mo', limits: '60 mins, 100 diagrams, 3 videos' },
    { name: 'PRO', price: '$30/mo', limits: '240 mins, Unlimited diagrams, 20 videos' },
    { name: 'UNLIMITED', price: '$100/mo', limits: '800 mins, Unlimited everything' },
];

export default function DashboardPage() {
    const { user, logout, refreshUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;


    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">{user.email}</span>
                        <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Logout</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Usage Stats */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-blue-400">Current Usage ({user.plan})</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Realtime Minutes</span>
                                    <span>{user.realtimeMinutesUsed} used</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (user.realtimeMinutesUsed / (user.plan === 'TRIAL' ? 20 : user.plan === 'BASIC' ? 60 : user.plan === 'PRO' ? 240 : 800)) * 100)}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Diagrams</span>
                                    <span>{user.diagramsUsed} used</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (user.diagramsUsed / (user.plan === 'TRIAL' ? 5 : user.plan === 'BASIC' ? 100 : 1000)) * 100)}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Videos</span>
                                    <span>{user.videosUsed} used</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (user.videosUsed / (user.plan === 'TRIAL' ? 1 : user.plan === 'BASIC' ? 3 : user.plan === 'PRO' ? 20 : 100)) * 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link href="/tutor" className="block w-full bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-lg font-bold transition-colors">
                                Go to AI Tutor
                            </Link>
                        </div>
                    </div>

                    {/* Plan Upgrade */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-yellow-400">Upgrade Plan</h2>
                        <div className="space-y-4">
                            {PLANS.map((plan) => (
                                <div key={plan.name} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                                    <div>
                                        <h3 className="font-bold">{plan.name}</h3>
                                        <p className="text-xs text-gray-400">{plan.limits}</p>
                                    </div>
                                    {/* <div className="text-right">
                                        <p className="font-bold mb-1">{plan.price}</p>
                                        {user.plan === plan.name ? 
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Current</span>
                                        }
                                    </div> */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
