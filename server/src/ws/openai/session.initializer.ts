import { tools } from "./tools.definition";
import { prisma } from "../../db/client";
import { GradeLevel, ProgrammingLanguage } from "@prisma/client";

export async function initializeSession(
  openAIWs: any,
  mode: "interview" | "tutor",
  userId: string,
  lessonPlanId: string,
  config?: any
) {
  const runInit = async () => {
    let instructions = "";

    if (mode == "interview") {
      // not handling for now.
      instructions = "You are a senior software engineer interviewer...";
    } else if (mode == "tutor") {
      const { topic, language, experience, domain, type } = config;
      instructions = `
      You are an expert, patient AI Tutor.
      
      You teach concepts step-by-step using structured thinking and visuals.
      
      ========================
      CORE TEACHING RULES
      ========================
      1. Teach in SMALL steps.
      2. Never overwhelm the user.
      3. Use visuals whenever they improve understanding.
      4. Ask for confirmation before moving forward.
      5. Never repeat content unless the user asks.
      6. Speak like a human tutor, not a textbook.
      
      ========================
      TEACHING FLOW (STRICT)
      ========================
      PHASE 1 — PLAN
      - Start by creating a learning roadmap using "create_note".
      - This is a high-level plan (no deep explanations).
      - After creating the plan, ask:
        "Does this plan look good before we start?"
      
      PHASE 2 — TEACH
      - Teach ONE concept at a time.
      - Use:
        - "create_slide" for theory
        - "generate_diagram" for structures or flows
        - "generate_animation" for dynamic behavior
      - Do NOT combine multiple concepts in one step.
      
      PHASE 3 — CHECK
      - After every concept, ask a short question:
        "Does this make sense?" or "Want to go deeper?"
      
      PHASE 4 — ADAPT
      - If user says yes → continue
      - If confused → re-explain using a different visualization
      - If advanced → increase depth
      
      ========================
      TOOL USAGE RULES
      ========================
      - Use tools ONLY when they add value.
      - Never explain diagrams without generating them.
      - Never generate diagrams for trivial explanations.
      - Use 'create_note' only once at the beginning.
      - Use 'create_slide' for conceptual breakdowns.
      - Use 'generate_diagram' for relationships / flows.
      - Use 'generate_animation' ONLY for dynamic processes.
      
      ========================
      STYLE
      ========================
      - Friendly, calm, encouraging.
      - Short sentences.
      - No filler.
      - No markdown unless inside tool content.
      
      ========================
      CONTEXT
      ========================
      Topic: ${topic}
      User Level: ${experience}
      Language: ${language}
      
      Start by creating the lesson plan now.
      `;

      await prisma.lessonPlan.update({
        where: { userId, id: lessonPlanId },
        data: {
          gradeLevel: String(experience).toUpperCase() as GradeLevel,
          programmingLanguage: String(
            language
          ).toUpperCase() as ProgrammingLanguage,
          topic: topic,
          domain: domain ?? "",
          type: type,
        },
      });
    }
    openAIWs.send({
      type: "session.update",
      session: {
        turn_detection: {
          type: "server_vad",
          threshold: 0.6,
          prefix_padding_ms: 300,
          silence_duration_ms: 600,
        },
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        voice: "alloy",
        modalities: ["text", "audio"],
        temperature: 0.6,
        instructions,
        tools,
      },
    });

    openAIWs.send({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Start the lesson plan now.",
          },
        ],
      },
    });

    openAIWs.send({ type: "response.create" });

    // if (mode === "tutor") {
    //   console.log("Sending initial message to llm.");
    //   openAIWs.send({
    //     type: "conversation.item.create",
    //     item: {
    //       type: "message",
    //       role: "user",
    //       content: [
    //         {
    //           type: "input_text",
    //           text: `
    //             I want to learn ${config.topic} in ${config.language}. I am a ${config.experience} level developer. Please act as my tutor.
    //             CRITICAL INSTRUCTION: Start IMMEDIATELY by using the "create_note" tool to generate a "Lesson Plan" for this topic.
    //             The note should outline what we will cover.
    //             After creating the note, introduce yourself and ask if I'm ready to start with the first item.
    //             `,
    //         },
    //       ],
    //     },
    //   });
    //   openAIWs.send({ type: "response.create" });
    // }
  };

  await runInit();
}
