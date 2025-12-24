import { FastifyInstance } from 'fastify';

import * as Lessons from '../db/lessons';
import { authMiddleware } from '../middleware/auth';

export default async function lessonRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/', {preHandler: authMiddleware } , async (req: any) => {
    return Lessons.createLessons(req.body, req.user.id);
  })

  app.get('/', { preHandler: authMiddleware}, async (req: any) => {
    return Lessons.listByUser(req.user.id);
  });
}
