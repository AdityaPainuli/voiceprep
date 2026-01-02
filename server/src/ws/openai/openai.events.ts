import { prisma } from "../../db/client";
import { ClientContext, RealtimeSessionState } from "../../types/client";
import { handleToolCall } from "../tools/tool.router";
import WebSocket from "ws";

export async function handleOpenAIMessage(
  response: any,
  ws: WebSocket,
  openAIWs: any,
  ctx: ClientContext,
  session: RealtimeSessionState
) {
  const toolArgumentBuffer = new Map<string, string>();
  if (response.type === "error") {
    console.error("❌ OpenAI error:", JSON.stringify(response, null, 2));
  }

  if (response.type === "session.updated") {
    console.log("Session updated successfully");
  }
  if (response.type === "response.audio.delta") {
    ws.send(
      JSON.stringify({
        event: "media",
        media: { payload: response.delta },
      })
    );
    return;
  }

  if (response.type === "response.function_call_arguments.delta") {
    console.log("Delta response is occuring.");
    const existing = toolArgumentBuffer.get(response.call_id) || "";
    toolArgumentBuffer.set(response.call_id, existing + response.delta);
    return;
  }

  if (response.type === "response.function_call_arguments.done") {
    let parsedArgs: any = null;

    // Case 1: streamed JSON (string chunks)
    const buffered = toolArgumentBuffer.get(response.call_id);

    if (buffered) {
      try {
        parsedArgs = JSON.parse(buffered);
      } catch (err) {
        console.error("❌ Failed to parse buffered tool args:", buffered);
        return;
      } finally {
        toolArgumentBuffer.delete(response.call_id);
      }
    }

    // Case 2: OpenAI sent structured object directly
    else {
      parsedArgs = response.arguments;
    }

    // ❌ Nothing usable
    if (!parsedArgs) {
      console.warn("⚠️ Tool call received but no usable arguments", response);
      return;
    }

    await handleToolCall(
      {
        name: response.name,
        arguments: parsedArgs,
        call_id: response.call_id,
      },
      ws,
      openAIWs,
      ctx
    );

    return;
  }

  if (response.type === "input_audio_buffer.speech_started") {
    ws.send(JSON.stringify({ type: "speech_started" }));
  }

  if (response.type === "input_audio_buffer.speech_stopped") {
    ws.send(JSON.stringify({ type: "speech_stopped" }));
  }

  if (response.type === "response.create") {
    ws.send(JSON.stringify({ type: "thinking" }));
  }
}
