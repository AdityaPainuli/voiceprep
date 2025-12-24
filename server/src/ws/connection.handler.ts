import WebSocket from "ws";
import { createOpenAIClient } from "./openai/openai.client";
import { handleClientMessage } from "./client.events";
import { handleOpenAIMessage } from "./openai/openai.events";
import "dotenv/config";
import { prisma } from "../db/client";
import { resolveUserId } from "../middleware/auth";
import { ClientContext } from "../types/client";

export async function handleWsConnection(ws: WebSocket, req: any) {
  console.log("🔗 Client connected");

  const API_KEY = process.env.OPENAI_API_KEY!;
  const openAI = createOpenAIClient(API_KEY);

  // 🔑 1. Message buffer (very important)
  const messageQueue: string[] = [];

  let ctx: ClientContext | null = null;
  let isInitialized = false;

  // ✅ 2. Attach WS handler immediately
  ws.on("message", (raw) => {
    const msg = raw.toString();

    // Buffer until ctx is ready
    if (!ctx) {
      messageQueue.push(msg);
      return;
    }

    const data = JSON.parse(msg);
    console.log(data.type);

    if (data.type === "init_session") {
      isInitialized = true;
    }

    if (!isInitialized && data.type === "audio") {
      console.warn("⚠️ Audio received before init_session");
      return;
    }

    handleClientMessage(msg, ws, openAI, ctx);
  });

  /* ---------------- ASYNC SETUP ---------------- */

  const userId = await resolveUserId(req);

  const url = new URL(req.url, `http://${req.headers.host}`);
  let lessonPlanId = url.searchParams.get("lessonPlanId");

  if (lessonPlanId) {
    const plan = await prisma.lessonPlan.findFirst({
      where: { id: lessonPlanId, userId },
    });

    if (!plan) {
      ws.close(4001, "Invalid lesson plan");
      return;
    }
  }

  if (!lessonPlanId) {
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        userId,
        type: "CODING",
        topic: "Untitled lesson",
        gradeLevel: "BEGINEER",
      },
    });

    lessonPlanId = lessonPlan.id;

    ws.send(
      JSON.stringify({
        type: "lesson_plan_created",
        lessonPlanId,
      })
    );
  }

  // ✅ 3. Context is now ready
  ctx = { userId, lessonPlanId };

  // ✅ 4. Drain buffered messages (VERY IMPORTANT)
  for (const msg of messageQueue) {
    const data = JSON.parse(msg);

    if (data.type === "init_session") {
      isInitialized = true;
    }

    if (!isInitialized && data.type === "audio") {
      continue;
    }

    handleClientMessage(msg, ws, openAI, ctx);
  }

  messageQueue.length = 0;

  openAI.onMessage((msg) => handleOpenAIMessage(msg, ws, openAI, ctx!));

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    openAI.close();
  });
}
