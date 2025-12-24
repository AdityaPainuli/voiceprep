import { ClientContext } from "../../types/client";
import { handleToolCall } from "../tools/tool.router";
import WebSocket from "ws";

export async function handleOpenAIMessage(
  response: any,
  ws: WebSocket,
  openAIWs: any,
  ctx: ClientContext
) {
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
  }

  if (response.type === "response.function_call_arguments.done") {
    console.log("Tool called: ", JSON.stringify(response.name));
    await handleToolCall(response, ws, openAIWs, ctx);
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
