import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import * as Assets from "../db/assets";
import { getSignedMediaUrl } from "../services/bucket";

export default async function assetRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware);

  app.post("/diagram", async (req) => {
    const { slideId, ...data } = req.body as any;
    return Assets.addDiagram(slideId, data);
  });

  app.get("/animations/:fileId", async (req: any, reply: any) => {
    const { fileId } = req.params;
    if (!fileId) {
      reply.status(404).send({ error: "fileId not provided in params" });
    }
    const fileUrl = await getSignedMediaUrl(fileId);
    reply.status(200).send({ fileUrl });
  });
}
