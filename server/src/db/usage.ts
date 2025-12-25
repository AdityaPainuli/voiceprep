import { UserUsageState } from "../types/client";
import { prisma } from "./client";

export async function getUsageSummary(userId: string): Promise<UserUsageState> {
  const usage = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      usageEvents: true,
      usageSummary: {
        select: {
          diagrams: true,
          realtimeMinutes: true,
          videos: true,
        },
      },
      plan: true,
      lessonPlans: {
        select: {
          _count: true,
        },
      },
      creditBalance: true,
      name: true,
    },
  });

  return {
    lessonPlans: usage?.lessonPlans.length || 0,
    creditBalance: usage?.creditBalance || 0,
    name: usage?.name || "",
    plan: usage?.plan || "TRIAL",
    usage_summary: {
      diagram_used: usage?.usageSummary?.diagrams || 0,
      realtimeMinutes: usage?.usageSummary?.realtimeMinutes || 0,
      videos_used: usage?.usageSummary?.videos || 0,
    },
  };
}
