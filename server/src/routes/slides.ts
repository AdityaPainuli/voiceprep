import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import * as Slides from '../db/slides';

export default async function slideRoutes(app: FastifyInstance) {
    app.addHook('preHandler', authMiddleware)

    app.post('/', async (req) => {
        const {lessonPlanId, ...data} = req.body as any;
        return Slides.createSlides(lessonPlanId, data)
    })
}