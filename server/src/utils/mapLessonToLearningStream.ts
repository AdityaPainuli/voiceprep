import { Animation, Diagram, LessonItem, Prisma, Slide } from "@prisma/client";

export type LearningItem =
  | {
      type: "note";
      id: string;
      title: string;
      content: string;
      tags?: string[];
    }
  | {
      type: "visual";
      id: string;
      chartType: "bar" | "line" | "pie" | "doughnut" | "radar" | "mermaid";
      data: any;
      title: string;
      description?: string;
    }
  | {
      type: "code";
      id: string;
      code: string;
      language: string;
      explanation?: string;
    }
  | { type: "slide"; id: string; title: string; bulletPoints: string[] }
  | {
      type: "animation";
      id: string;
      url: string;
      title: string;
      description?: string;
      code?: string;
    };

export type LessonPlanWithContent = Prisma.LessonPlanGetPayload<{
  include: {
    slides: true;
    diagrams: true;
    animations: true;
    items: true;
  };
}>;

export function mapLessonToLearningStream(
  lesson: LessonPlanWithContent
): LearningItem[] {
  const result: LearningItem[] = [];

  const slidesById: Map<string, Slide> = new Map(
    lesson.slides.map((s: any) => [s.id, s])
  );
  const diagramsById: Map<string, Diagram> = new Map(
    lesson.diagrams.map((d: Diagram) => [d.id, d])
  );
  const animationsById: Map<string, Animation> = new Map(
    lesson.animations.map((a: Animation) => [a.id, a])
  );

  for (const item of lesson.items.sort(
    (a: LessonItem, b: LessonItem) => a.order - b.order
  )) {
    switch (item.type) {
      case "SLIDE":
        const slide = slidesById.get(item.slideId!);
        if (!slide) break;

        if (slide.content) {
          result.push({
            type: "note",
            id: slide.id,
            title: slide.title,
            content: slide.content,
            tags: slide.tags ?? [],
          });
        } else {
          result.push({
            type: "slide",
            id: slide.id,
            title: slide.title,
            bulletPoints: (slide.bulletPoints as string[]) || [],
          });
        }
        break;
      case "DIAGRAM":
        const diagram = diagramsById.get(item.diagramId!);
        if (!diagram) break;

        result.push({
          type: "visual",
          id: diagram.id,
          chartType: "mermaid",
          data: diagram.code,
          title: diagram.title,
          description: diagram.description,
        });
        break;
      case "ANIMATION": {
        const animation = animationsById.get(item.animationId!);
        if (!animation) break;

        result.push({
          type: "animation",
          id: animation.id,
          url: animation.fileUrl, // TODO: fileURL might be expired so need to send fileID anyways,
          title: "", // TODO: what's it?
          description: animation.description!,
        });
        break;
      }
    }
  }
  return result;
}
