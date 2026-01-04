import { prisma } from "../../db/client";
import { getNextLessonItemOrder } from "../../db/helper";
import { ManimService } from "../../services/ManimService";
import WebSocket from "ws";
import { ClientContext } from "../../types/client";
import { assertusageAllowed } from "../../services/usage.guard";

const manim = new ManimService();
export async function handleToolCall(
  response: any,
  ws: WebSocket,
  openAIWs: any,
  ctx: ClientContext
) {
  let args: any;
  try {
    args =
      typeof response.arguments === "string"
        ? JSON.parse(response.arguments)
        : response.arguments;
  } catch (e) {
    console.error("Error occurred: ", e);
    console.log("Response body: ", response);
  }
  console.log(response.name);
  switch (response.name) {
    case "post_question":
      // TODO: save to db (maybe later.)
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
      await prisma.$transaction(async (tx) => {
        const order = await getNextLessonItemOrder(ctx.lessonPlanId);
        const code = await tx.code.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            code: args.correctedCode,
            explanation: args.explanation,
            language: args.language,
          },
        });

        await tx.lessonItem.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            type: "CODE",
            order,
            codeId: code.id,
          },
        });

        await tx.usageEvent.create({
          data: {
            userId: ctx.userId,
            type: "CODE_GENERATED",
            amount: 1,
            metadata: {
              lessonPlanId: ctx.lessonPlanId,
              language: code.language,
              code: code.code,
            },
          },
        });

        await tx.usageSummary.upsert({
          where: { userId: ctx.userId },
          create: {
            userId: ctx.userId,
            Code: 1,
          },
          update: { Code: { increment: 1 } },
        });
        return code;
      });
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
      try {
        await assertusageAllowed(ctx.userId, "DIAGRAM");
      } catch (e: any) {
        ws.send(
          JSON.stringify({
            type: "limit_reached",
            reason: e,
          })
        );
      }
      await prisma.$transaction(async (tx) => {
        const order = await getNextLessonItemOrder(ctx.lessonPlanId);
        const diagram = await tx.diagram.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            type: "CUSTOM",
            metaData: { source: "mermaid", code: args.code },
            code: args.code,
            title: args.title,
            description: args.description,
          },
        });

        await tx.lessonItem.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            type: "DIAGRAM",
            order,
            diagramId: diagram.id,
          },
        });

        await tx.usageEvent.create({
          data: {
            userId: ctx.userId,
            type: "DIAGRAM_GENERATED",
            amount: 1,
            metadata: {
              lessonPlanId: ctx.lessonPlanId,
              diagram_type: "mermaid",
            },
          },
        });

        await tx.usageSummary.upsert({
          where: { userId: ctx.userId },
          create: {
            userId: ctx.userId,
            diagrams: 1,
          },
          update: { diagrams: { increment: 1 } },
        });
        return diagram;
      });
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
      await prisma.$transaction(async (tx) => {
        const order = await getNextLessonItemOrder(ctx.lessonPlanId);

        const note = await tx.slide.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            title: args.title,
            content: args.content,
            tags: args.tags,
            type: "NOTE",
          },
        });

        await tx.lessonItem.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            type: "SLIDE",
            order,
            slideId: note.id,
          },
        });
        return note;
      });
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
      await prisma.$transaction(async (tx) => {
        const order = await getNextLessonItemOrder(ctx.lessonPlanId);
        const slide = await tx.slide.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            title: args.title,
            type: "SLIDE",
            bulletPoints: args.bulletPoints,
          },
        });

        await tx.lessonItem.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            type: "SLIDE",
            order,
            slideId: slide.id,
          },
        });
        return slide;
      });
      ws.send(
        JSON.stringify({
          type: "slide",
          title: args.title,
          bulletPoints: args.bulletPoints,
        })
      );
      break;

    case "generate_animation":
      try {
        await assertusageAllowed(ctx.userId, "VIDEO");
      } catch (e: any) {
        ws.send(
          JSON.stringify({
            type: "limit_reached",
            reason: e,
          })
        );
      }
      const { fileId, fileUrl, key } = await manim.generateVideo(args.code);
      await prisma.$transaction(async (tx) => {
        const order = await getNextLessonItemOrder(ctx.lessonPlanId);
        const animation = await tx.animation.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            fileId: key, //later can be used for generating temp urls
            metaData: { source: "manim", code: args.code },
            fileUrl: fileUrl,
          },
        });

        await tx.lessonItem.create({
          data: {
            lessonPlanId: ctx.lessonPlanId,
            type: "ANIMATION",
            order,
            animationId: animation.id,
          },
        });

        await tx.usageEvent.create({
          data: {
            userId: ctx.userId,
            type: "VIDEO_GENERATED",
            amount: 1,
            metadata: {
              lessonPlanId: ctx.lessonPlanId,
              source: "manim",
            },
          },
        });

        await tx.usageSummary.upsert({
          where: { userId: ctx.userId },
          create: {
            userId: ctx.userId,
            videos: 1,
          },
          update: { videos: { increment: 1 } },
        });
        return animation;
      });
      ws.send(
        JSON.stringify({
          type: "animation",
          fileId: key,
          url: fileUrl,
        })
      );
      break;
    case "complete_lesson":
      await prisma.$transaction(async (tx) => {
        const lessonPlan = await tx.lessonPlan.update({
          where: { id: ctx.lessonPlanId, userId: ctx.userId },
          data: {
            confidenceLevel: args.confidenceLevel,
            summary: args.summary,
          },
        });
        return lessonPlan;
      });
      ws.send(
        JSON.stringify({
          type: "complete_lesson",
          summary: args.summary,
          confidence: args.confidence,
          suggestedNextSteps: args.suggestedNextSteps,
        })
      );
      break;
  }

  openAIWs.send({
    type: "conversation.item.create",
    item: {
      type: "function_call_output",
      call_id: response.call_id,
      output: JSON.stringify({ success: true }),
    },
  });

  openAIWs.send({ type: "response.create" });
}
