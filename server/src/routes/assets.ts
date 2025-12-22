import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import * as Assets from '../db/assets';

export default async function assetRoutes(app: FastifyInstance) {
    app.addHook('preHandler', authMiddleware)

    app.post('/diagram', async (req) => {
        const {slideId, ...data } = req.body as any;
        return Assets.addDiagram(slideId, data)
    })
}