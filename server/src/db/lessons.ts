import { GradeLevel, ProgrammingLanguage } from "@prisma/client";
import { prisma } from "./client";

interface CreateLessonPlanInterface {
  gradeLevel: GradeLevel;
  programmingLanguage: ProgrammingLanguage;
  topic: string;
  type: "CODING" | "GENERAL";
}

export function createLessons(data: CreateLessonPlanInterface, userId: string) {
  return prisma.lessonPlan.create({
    data: {
      userId,
      type: data.type,
      programmingLanguage: data.programmingLanguage,
      topic: data.topic,
      gradeLevel: data.gradeLevel,
    },
  });
}

export function updateLessons(
  data: CreateLessonPlanInterface,
  userId: string,
  lessonPlanId: string
) {
  return prisma.lessonPlan.update({
    where: {
      userId,
      id: lessonPlanId,
    },
    data: {
      type: data.type,
      topic: data.topic,
      gradeLevel: data.gradeLevel,
      programmingLanguage: data.programmingLanguage,
    },
  });
}

export function listByUser(userId: string) {
  return prisma.lessonPlan.findMany({
    where: { userId },
    include: { slides: true },
  });
}
