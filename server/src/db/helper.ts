import { prisma } from "./client";

export async function getNextLessonItemOrder(
  lessonPlanId: string
): Promise<number> {
  const last = await prisma.lessonItem.findFirst({
    where: {
      lessonPlanId,
    },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return (last?.order ?? 0) + 1;
}
