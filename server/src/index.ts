import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import { registerRoutes } from "./routes";
import { registerWebSocket } from "./ws";
import { execSync } from "child_process";
import { prisma } from "./db/client";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

try {
  execSync("python3 --version", { stdio: "inherit" });
  execSync("python3 -m manim --version", { stdio: "inherit" });
} catch {
  console.error("❌ Python or Manim not available");
}

const startServer = async () => {
  try {
    await fastify.listen({ port: 8080, host: "0.0.0.0" });
    console.log("Fastify server started on port 8080");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();

fastify.register(cors, {
  origin: true, // Allow all origins for now (dev)
});

registerRoutes(fastify);
registerWebSocket(fastify);

fastify.get("/health", async (request, response) => {
  try {
    // 🔥 This wakes the DB
    await prisma.$queryRaw`SELECT 1`;

    return response.code(200).send({
      status: "ok",
      db: "connected",
      timestamp: Date.now(),
    });
  } catch (err) {
    request.log.error(err, "Health check failed");

    return response.code(503).send({
      status: "error",
      db: "down",
    });
  }
});
