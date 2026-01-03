import { PLAN_LIMITS } from "../config/plans";
import { prisma } from "../db/client";

export async function assertusageAllowed(
  userId: string,
  action: "REALTIME" | "DIAGRAM" | "VIDEO",
  increment: number = 0
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { usageSummary: true },
  });

  if (!user) throw new Error("User not found");

  if (!user.emailVerified) {
    throw new Error("Email not verified");
  }

  const plan = PLAN_LIMITS[user.plan];
  const usage = user.usageSummary;

  if (!usage) return;

  if (action === "DIAGRAM") {
    if (usage.diagrams >= plan.diagrams) {
      throw new Error("Diagram limit reached.");
    }
  }

  if (action === "VIDEO") {
    if (usage.videos >= plan.videos) {
      throw new Error("Video limit reached");
    }
  }

  if (action === "REALTIME") {
    if (usage.realtimeMinutes + increment >= plan.realtimeMinutes) {
      throw new Error("Realtime limit reached");
    }
  }
}
