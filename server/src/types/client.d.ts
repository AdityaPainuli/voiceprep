import { UserPlan } from "@prisma/client";

export interface ClientContext {
  userId: string;
  lessonPlanId: string;
}

type RealtimeSessionState = {
  connectedAt: number;
};

export interface UserUsageState {
  lessonPlans: number;
  creditBalance: number;
  name: string;
  plan: UserPlan;
  usage_summary: {
    diagram_used: number;
    videos_used: number;
    realtimeMinutes: number;
  };
}
