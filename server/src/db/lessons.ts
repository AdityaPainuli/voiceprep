import { LessonPlan } from "@prisma/client";
import { prisma } from "./client";

export async function create(data: Omit<LessonPlan, 'userId'>, userId: string) {
    return prisma.lessonPlan.create({
        data: {
            userId,
            ...data,
        }
    })
}


export function listByUser(userId: string) {
    return prisma.lessonPlan.findMany({
        where: { userId },
        include: { slides: true },
    });
}
