import { GradeLevel, ProgrammingLanguage } from "@prisma/client";
import { prisma } from "./client";
import { LessonPlanWithContent } from "../utils/mapLessonToLearningStream";

interface CreateLessonPlanInterface {
  gradeLevel: GradeLevel;
  programmingLanguage: ProgrammingLanguage;
  topic: string;
  type: "CODING" | "GENERAL";
}

interface learningStream {
  type: string;
  id: string;
  title: string;
  content: string;
  bulletPoints: any;
  tags: string[];
}

interface LessonByIdInterface {
  id: string;
  config: {
    topic: string;
    domain?: string;
    language?: string;
    experience: string;
  };
  learningStream: learningStream[];
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
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getLessonById(
  lessonId: string,
  userId: string
): Promise<LessonPlanWithContent | null> {
  const lessonPlan = await prisma.lessonPlan.findUnique({
    where: { id: lessonId, userId: userId },
    include: {
      slides: true,
      diagrams: true,
      animations: true,
      items: true,
      codes: true,
    },
  });
  if (!lessonPlan) {
    return null;
  }
  return lessonPlan;
}
