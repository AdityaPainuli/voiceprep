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

export async function handleWsConnection(ws: WebSocket, req: any) {
  console.log("🔗 Client connected");

  const API_KEY = process.env.OPENAI_API_KEY!;
  const openAI = createOpenAIClient(API_KEY);

  const session: RealtimeSessionState = {
    activeStart: null,
    lastActivityAt: null,
    interval: null,
    totalActiveMs: 0,
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
        type: "limit_reached",
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

  ctx = { userId, lessonPlanId };

  session.interval = setInterval(async () => {
    if (!session.activeStart || !session.lastActivityAt) return;

    const now = Date.now();
    const idleMs = now - session.lastActivityAt;

    // If user stopped speaking
    if (idleMs > 4000) {
      const activeMs = session.lastActivityAt - session.activeStart;

      session.totalActiveMs += activeMs;

      const billableMinutes = Math.floor(session.totalActiveMs / 60000);

      if (billableMinutes > 0) {
        try {
          await assertusageAllowed(ctx.userId, "REALTIME", billableMinutes);
        } catch (e: any) {
          ws.send(
            JSON.stringify({
              type: "limit_reached",
              reason: "Realtime usage limit exceeded",
            })
          );
          openAI.close();
          ws.close();
          return;
        }
        await prisma.$transaction([
          prisma.usageEvent.create({
            data: {
              userId: ctx.userId,
              type: "REALTIME_MINUTE",
              amount: billableMinutes,
              metadata: {
                totalMs: session.totalActiveMs,
              },
            },
          }),
          prisma.usageSummary.upsert({
            where: { userId: ctx.userId },
            create: {
              userId: ctx.userId,
              realtimeMinutes: billableMinutes,
            },
            update: {
              realtimeMinutes: { increment: billableMinutes },
            },
          }),
        ]);

        // subtract billed time
        session.totalActiveMs -= billableMinutes * 60000;
      }

      // reset activity window
      session.activeStart = null;
      session.lastActivityAt = null;
    }
  }, 1000);

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

  ws.on("close", async () => {
    console.log("❌ Client disconnected");

    if (session.interval) clearInterval(session.interval);

    if (session.totalActiveMs > 0) {
      const minutes = Math.floor(session.totalActiveMs / 60000);

      if (minutes > 0) {
        await prisma.$transaction([
          prisma.usageEvent.create({
            data: {
              userId: ctx.userId,
              type: "REALTIME_MINUTE",
              amount: minutes,
              metadata: { reason: "disconnect" },
            },
          }),
          prisma.usageSummary.upsert({
            where: { userId: ctx.userId },
            create: {
              userId: ctx.userId,
              realtimeMinutes: minutes,
            },
            update: {
              realtimeMinutes: { increment: minutes },
            },
          }),
        ]);
      }
    }

    openAI.close();
  });
}
