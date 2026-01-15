export const PLAN_LIMITS = {
  TRIAL: {
    realtimeMinutes: 10,
    diagrams: 100,
    videos: 3,
  },
  PRO: {
    realtimeMinutes: 240,
    diagrams: Infinity,
    videos: 20,
  },
  BASIC: {
    realtimeMinutes: 400,
    diagrams: Infinity,
    videos: 40,
  },
  UNLIMITED: {
    realtimeMinutes: Infinity,
    diagrams: Infinity,
    videos: Infinity,
  },
} as const;

export const DEMO_LIMITS = {
  maxDiagrams: 5,
  maxAnimations: 3,
  maxSessionMs: 10 * 60 * 1000,
};
