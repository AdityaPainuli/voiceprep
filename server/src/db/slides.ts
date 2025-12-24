import { prisma } from "./client";

interface CreateSlideInterface {
  title: string;
  order: number;
  content: string;
}
// One slide can have multiple diagram,animation or video (need to think about it)?
export function createSlides(lessonPlanId: string, data: CreateSlideInterface) {
  return prisma.slide.create({
    data: {
      lessonPlanId,
      title: data.title,
      content: data.content,
      type: "SLIDE",
    },
  });
}
