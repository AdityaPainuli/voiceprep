import { FastifyRequest } from "fastify";
import { verifyToken } from "../utils/jwt";
import { error } from "console";
import jwt from "jsonwebtoken";

export async function authMiddleware(req: any, reply: any) {
  const header = req.headers.authorization;
  if (!header) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const token = header.replace("Bearer ", "");
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch {
    return reply.status(401).send({ error: "invalid_token" });
  }
}

export async function resolveUserId(req: any): Promise<string> {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!token) {
    throw new Error("Missing auth token");
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
    id: string;
  };

  return payload.id;
}
