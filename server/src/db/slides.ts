import { Slide } from "@prisma/client";
import { prisma } from "./client";

export function create(lessonPlanId: string, data: Omit<Slide, 'lessonPlanId'>) {
    return prisma.slide.create({
        data: {
            lessonPlanId,
            ...data,
        }
    })
}