import { FastifyInstance } from "fastify";

import * as Lessons from "../db/lessons";
import { authMiddleware } from "../middleware/auth";
import {
  LearningItem,
  mapLessonToLearningStream,
} from "../utils/mapLessonToLearningStream";
import { GradeLevel, ProgrammingLanguage } from "@prisma/client";

interface LessonResponse {
  config: {
    topic: string;
    domain: string | null;
    language: ProgrammingLanguage | null;
    experience: GradeLevel;
  };
  learningStream: LearningItem[];
}
interface LessonInterface {
  Params: {
    lessonId: string;
  };
  Reply: LessonResponse;
}

export default async function lessonRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware);

  app.post("/", { preHandler: authMiddleware }, async (req: any) => {
    return Lessons.createLessons(req.body, req.user.id);
  });

  app.get("/", { preHandler: authMiddleware }, async (req: any) => {
    return Lessons.listByUser(req.user.id);
  });

  app.get<LessonInterface>(
    "/:lessonId",
    { preHandler: authMiddleware },
    async (req: any, reply) => {
      const { lessonId } = req.params;
      const lessons = await Lessons.getLessonById(lessonId, req.user.id);
      if (!lessons) return reply.code(404).send();
      const learningItems = mapLessonToLearningStream(lessons);

      const response = {
        config: {
          topic: lessons.topic,
          domain: lessons.domain,
          language: lessons.programmingLanguage,
          experience: lessons.gradeLevel,
        },
        learningStream: learningItems,
      } satisfies LessonResponse;

      return reply.code(200).send(response);
    }
  );
}
