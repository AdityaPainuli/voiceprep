import { ClientContext } from "../types/client";
import { initializeSession } from "./openai/session.initializer";

export function handleClientMessage(
  raw: string,
  ws: any,
  openAI: any,
  ctx: ClientContext
) {
  const data = JSON.parse(raw);
  switch (data.type) {
    case "init_session":
      console.log("Got here");
      initializeSession(
        openAI,
        data.mode,
        data.userId,
        ctx.lessonPlanId,
        data.config
      );
      break;

    case "audio":
      openAI.send({
        type: "input_audio_buffer.append",
        audio: data.payload,
      });
      break;

    case "submit_code":
      openAI.send({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Here is my solution code:\n\n${data.code}\n\nPlease evaluate it.`,
            },
          ],
        },
      });
      openAI.send({ type: "response.create" });
      break;

    case "run_code":
      openAI.send({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: `I want to run this code. Please simulate the execution. If there are errors (syntax, runtime, etc.), provide the EXACT error message and stack trace in the output and set status to 'error'. If it runs successfully, show the output and set status to 'success'.\n\n${data.code}\n\n(Internal ID: ${data.id}`,
            },
          ],
        },
      });
      openAI.send({ type: "response.create" });
      break;

    case "next_question":
      openAI.send({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: `I am ready for the next question. Please provide a new technical interview question`,
            },
          ],
        },
      });
      openAI.send({ type: "response.create" });
      break;
    case "text_message":
      openAI.send({
        type: "conversation.item.create",
        role: "user",
        content: [
          {
            type: "input_text",
            text: data.text,
          },
        ],
      });
      openAI.send({ type: "response.create" });
  }
}
