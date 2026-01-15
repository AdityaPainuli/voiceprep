import WebSocket from "ws";
import { createOpenAIClient } from "./openai/openai.client";
import "dotenv/config";
import { ClientContext } from "../types/client";
import { handleClientMessage } from "./client.events";
import { handleOpenAIMessage } from "./openai/openai.events";
import { DEMO_LIMITS } from "../config/plans";

export async function handleDemoWsConnection(ws: WebSocket, req: any) {
  console.log("Demo client connected");

  const API_KEY = process.env.OPENAI_API_KEY!;
  const openAI = createOpenAIClient(API_KEY);

  const demoSession = {
    connectedAt: Date.now(),
    diagramsUsed: 0,
    animationsUsed: 0,
    closed: false,
  };

  const messageQueue: string[] = [];
  let isInitialized = false;

  const ctx: ClientContext = {
    mode: "DEMO" as const,
    lessonPlanId: "",
    userId: "",
  };

  ws.on("message", async (raw) => {
    if (demoSession.closed) return;

    const data = JSON.parse(raw.toString());
    const msg = raw.toString();

    if (!isInitialized) {
      if (data.type === "init_session" || data.type === "demo_init_session") {
        isInitialized = true;
      } else {
        messageQueue.push(msg);
        return;
      }
    }

    console.log("[DEMO]", data.type);

    if (data.type === "audio" && !isInitialized) {
       // Should not happen due to check above, but keeping for safety/logic
       return; 
    }

    if (data.type === "tool_call") {
      if (data.name === "generate_diagram") {
        if (++demoSession.diagramsUsed > DEMO_LIMITS.maxDiagrams) {
          return notifyLimit(ws, "Diagram limit reached");
        }
      }

      if (data.name == "generate_animation") {
        if (++demoSession.animationsUsed > DEMO_LIMITS.maxAnimations) {
          return notifyLimit(ws, "Animation limit reached");
        }
      }
    }

    await handleClientMessage(msg, ws, openAI, ctx);
  });

  const demoTimeOut = setTimeout(() => {
    endDemo(ws, demoSession, "Demo time limit reached");
  }, DEMO_LIMITS.maxSessionMs);

  // Removed redundant drain loop since there is no async setup delay in demo mode

  openAI.onMessage((msg) =>
    handleOpenAIMessage(msg, ws, openAI, ctx, demoSession)
  );

  ws.on("close", () => {
    console.log("Demo client disconnected");
    demoSession.closed = true;
    clearTimeout(demoTimeOut);
    openAI.close();
  });
}

function notifyLimit(ws: WebSocket, message: string) {
  ws.send(
    JSON.stringify({
      type: "toast",
      level: "info",
      message,
      demo: true,
    })
  );
}

function endDemo(ws: WebSocket, session: any, reason: string) {
  if (session.closed) return;
  session.closed = true;

  ws.send(
    JSON.stringify({
      type: "demo-complete",
      reason,
      summary: {
        diagramsUsed: session.diagramsUsed,
        animationUsed: session.animationUsed,
        confidence: "Good",
      },
      cta: {
        title: "Create a free account to continue",
        action: "SIGNUP",
      },
    })
  );

  // ws.close(); 
  // Do NOT close immediately. Let the AI finish speaking (buffered audio).
  // The client will initiate close when they leave or after a timeout.
  // We'll set a hard limit here just in case the client hangs.
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
        console.log("Force closing demo session after grace period");
        ws.close();
    }
  }, 15000); // 15 seconds grace period for audio to finish
}
