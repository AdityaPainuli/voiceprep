import WebSocket from "ws";
import { createOpenAIClient } from "./openai/openai.client";
import { handleClientMessage } from "./client.events";
import { handleOpenAIMessage } from "./openai/openai.events";
import "dotenv/config";
import { prisma } from "../db/client";
import { resolveUserId } from "../middleware/auth";
import { ClientContext, RealtimeSessionState } from "../types/client";
import { assertusageAllowed } from "../services/usage.guard";
import { GradeLevel } from "@prisma/client";

const MAX_SESSION_MS = 60 * 20 * 1000; // 20 minutes

export async function handleWsConnection(ws: WebSocket, req: any) {
  console.log("🔗 Client connected");

  const API_KEY = process.env.OPENAI_API_KEY!;
  const openAI = createOpenAIClient(API_KEY);

  const session: RealtimeSessionState = {
    connectedAt: Date.now(),
  };

  // 🔑 1. Message buffer (very important)
  const messageQueue: string[] = [];

  let ctx: ClientContext | null = null;
  let isInitialized = false;

  // ✅ 2. Attach WS handler immediately
  ws.on("message", async (raw) => {
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

    await handleClientMessage(msg, ws, openAI, ctx);
  });

  /* ---------------- ASYNC SETUP ---------------- */

  const userId = await resolveUserId(req);

  try {
    await assertusageAllowed(userId, "REALTIME");
  } catch (e: any) {
    ws.send(
      JSON.stringify({
        type: "limit_reached or email not verified",
        reason: e.message,
      })
    );
    ws.close();
    return;
  }

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

  // Creating first.
  if (!lessonPlanId) {
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        userId,
        type: "CODING",
        topic: "Untitled lesson",
        gradeLevel: GradeLevel.BEGINNER,
      },
    });
    console.log("Lesson PLan created -> ", lessonPlan);

    lessonPlanId = lessonPlan.id;

    ws.send(
      JSON.stringify({
        type: "lesson_plan_created",
        lessonPlanId,
      })
    );
  }

  const maxSessionTimeout = setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "limit_reached",
          reason: "Maximum session duration reached.",
        })
      );
      ws.close();
    }
  }, MAX_SESSION_MS);

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

    await handleClientMessage(msg, ws, openAI, ctx);
  }

  messageQueue.length = 0;

  openAI.onMessage((msg) =>
    handleOpenAIMessage(msg, ws, openAI, ctx!, session)
  );

  let billed = false;

  ws.on("close", async () => {
    console.log("❌ Client disconnected");

    clearTimeout(maxSessionTimeout);

    if (!ctx) return;

    const durationMs = Date.now() - session.connectedAt;
    const minutesUsed = Math.ceil(durationMs / 60000);

    if (minutesUsed <= 0 || billed) return;
    billed = true;

    if (minutesUsed > 0) {
      try {
        await prisma.$transaction([
          prisma.usageEvent.create({
            data: {
              userId: ctx.userId,
              type: "REALTIME_MINUTE",
              amount: minutesUsed,
              metadata: {
                durationMs,
              },
            },
          }),
          prisma.usageSummary.upsert({
            where: { userId: ctx.userId },
            create: {
              userId: ctx.userId,
              realtimeMinutes: minutesUsed,
            },
            update: {
              realtimeMinutes: { increment: minutesUsed },
            },
          }),
        ]);
      } catch (e) {
        console.error("Usage billing failed: ", e);
      }
    }
    openAI.close();
  });
}
