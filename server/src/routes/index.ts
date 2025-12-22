import { FastifyInstance } from "fastify";
import lessonRoutes from "./lessons";
import slideRoutes from "./slides";
import assetRoutes from "./assets";
import authRoutes from "./auth";

export function registerRoutes(app: FastifyInstance) {
    app.register(lessonRoutes, { prefix: '/lessons'})
    app.register(slideRoutes, { prefix: '/slides'})
    app.register(assetRoutes, { prefix: '/assets' })
    app.register(authRoutes, { prefix: '/auth' })
}