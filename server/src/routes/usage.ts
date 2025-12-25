import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import * as usageDB from "../db/usage";

export default async function usageRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware);

  app.get("/usage-summary", async (request: any, reply) => {
    return usageDB.getUsageSummary(request.user.id);
  });
}
