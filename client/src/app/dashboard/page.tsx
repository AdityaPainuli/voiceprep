"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    name: "TRIAL",
    price: "free",
    limits: "5 mins, 20 diagrams, 3 videos, unlimited lesson plans",
  },
  {
    name: "PRO",
    price: "$30/mo",
    limits: "50 mins, 20 videos, unlimited lesson lesson plans & diagrams",
  },
  {
    name: "BASIC",
    price: "$50/mo",
    limits: "100 mins, 40 videos, unlimited lesson plans & diagrams",
  },
  {
    name: "UNLIMITED",
    price: "$80/mo",
    limits: "300 mins, Unlimited everything",
  },
];

interface UserUsageState {
  lessonPlans: number;
  creditBalance: number;
  name: string;
  plan: "TRIAL" | "PRO" | "UNLIMITED" | "BASIC"; // add basic plan
  usage_summary: {
    diagram_used: number;
    videos_used: number;
    realtimeMinutes: number;
  };
}

const PLAN_LIMITS = {
  TRIAL: { realtimeMinutes: 10, diagrams: 10, videos: 1 },
  BASIC: { realtimeMinutes: 60, diagrams: 100, videos: 3 },
  PRO: { realtimeMinutes: 240, diagrams: 999999, videos: 20 },
  UNLIMITED: { realtimeMinutes: 800, diagrams: 999999, videos: 100 },
};

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [usageData, setUsageData] = useState<UserUsageState>();
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/usage-summary`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUsageData(data);
        }
      } catch (error) {
        console.error("Failed to fetch usage data:", error);
      } finally {
        setLoadingUsage(false);
      }
    };

    if (user) {
      fetchUsageData();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  const planLimits = PLAN_LIMITS[usageData?.plan || "TRIAL"];
  const usage = usageData?.usage_summary || {
    diagram_used: 0,
    videos_used: 0,
    realtimeMinutes: 0,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {usageData?.name && (
              <p className="text-gray-400 mt-1">
                Welcome back, {usageData.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user.email}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Usage Stats */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-400">
                Current Usage ({usageData?.plan || "TRIAL"})
              </h2>
              {loadingUsage && (
                <span className="text-xs text-gray-500">Loading...</span>
              )}
            </div>

            <div className="space-y-4">
              {/* Realtime Minutes */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Realtime Minutes</span>
                  <span>
                    {usage.realtimeMinutes} / {planLimits.realtimeMinutes} used
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (usage.realtimeMinutes / planLimits.realtimeMinutes) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Diagrams */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Diagrams</span>
                  <span>
                    {usage.diagram_used}{" "}
                    {planLimits.diagrams < 999999
                      ? `/ ${planLimits.diagrams}`
                      : ""}{" "}
                    used
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full transition-all"
                    style={{
                      width:
                        planLimits.diagrams < 999999
                          ? `${Math.min(
                              100,
                              (usage.diagram_used / planLimits.diagrams) * 100
                            )}%`
                          : "0%",
                    }}
                  ></div>
                </div>
                {planLimits.diagrams >= 999999 && (
                  <p className="text-xs text-gray-400 mt-1">Unlimited</p>
                )}
              </div>

              {/* Videos */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Videos</span>
                  <span>
                    {usage.videos_used} / {planLimits.videos} used
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (usage.videos_used / planLimits.videos) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Credit Balance */}
              {usageData?.creditBalance !== undefined && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Credit Balance</span>
                    <span className="text-lg font-bold text-yellow-400">
                      ${usageData.creditBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Lesson Plans */}
              {usageData?.lessonPlans !== undefined && (
                <div className="pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Lesson Plans Created
                    </span>
                    <span className="text-lg font-bold text-blue-400">
                      {usageData.lessonPlans}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Link
                href="/tutor"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-lg font-bold transition-colors"
              >
                Go to AI Tutor
              </Link>
            </div>
            <div className="mt-6">
              <Link
                href="/"
                className="block w-full bg-green-600 hover:bg-green-700 text-center py-3 rounded-lg font-bold transition-colors"
              >
                Go to Home Page
              </Link>
            </div>
          </div>

          {/* Plan Upgrade */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">
              Upgrade Plan
            </h2>
            <div className="space-y-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                    usageData?.plan === plan.name
                      ? "bg-gray-700 border-blue-500"
                      : "bg-gray-700/50 border-gray-600"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{plan.name}</h3>
                      {usageData?.plan === plan.name && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{plan.limits}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{plan.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="block w-full bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-lg font-bold transition-colors">
                <a
                  target="_blank"
                  href="https://calendar.app.google/oRRB2riEpXaV5vbz8"
                >
                  Book a call for upgrading your plan
                </a>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
