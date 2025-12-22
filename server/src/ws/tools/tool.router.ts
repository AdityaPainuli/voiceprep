import { ManimService } from "../../services/ManimService";
import WebSocket from "ws";

const manim = new ManimService();

export async function handleToolCall(
  response: any,
  ws: WebSocket,
  openAIWs: any,
) {
  const args = JSON.parse(response.arguments);

  switch (response.name) {
    case "post_question":
      ws.send(
        JSON.stringify({
          type: "question",
          question: args.question,
          testCases: args.testCases,
        })
      );
      break;
    case "mark_question_solved":
      ws.send(
        JSON.stringify({
          type: "question_solved",
          feedback: args.feedback,
        })
      );
      break;
    case "provide_code_correction":
      ws.send(
        JSON.stringify({
          type: "correction",
          correctionCode: args.correctedCode,
          language: args.language,
          explanation: args.explanation,
        })
      );
      break;
    case "provide_execution_output":
      ws.send(
        JSON.stringify({
          type: "execution_output",
          output: args.output,
          status: args.status,
          language: args.language,
          id: args.id,
        })
      );
      break;
    case "generate_chart":
      ws.send(
        JSON.stringify({
          type: "chart",
          chartType: args.type,
          data: args.data,
          title: args.title,
          description: args.description,
        })
      );
      break;
    case "generate_diagram":
      ws.send(
        JSON.stringify({
          type: "diagram",
          code: args.code,
          title: args.title,
          description: args.description,
        })
      );
      break;
    case "create_note":
      ws.send(
        JSON.stringify({
          type: "note",
          title: args.title,
          content: args.content,
          tags: args.tags,
        })
      );
      break;
    case "create_slide":
      ws.send(
        JSON.stringify({
          type: "slide",
          title: args.title,
          bulletPoints: args.bulletPoints,
        })
      );
      break;

    case "generate_animation": {
      const fileID = await manim.generateVideo(args.code);
      ws.send(
        JSON.stringify({
          type: "animation",
          // TODO: Handle using id or something here.
          // url: `${BASE_URL}/${video}`,
          fileId: fileID,
        })
      );
      break;
    }
  }

  openAIWs.send({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: response.call_id,
        output: JSON.stringify({ success: true }),
      },
    }
  );

  openAIWs.send({ type: "response.create" });
}
