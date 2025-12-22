import { WebSocket } from "ws";
import { tools } from "./tools.definition";

export function initializeSession(
  openAIWs: any,
  mode: "interview" | "tutor",
  config?: any
) {
  const runInit = () => {
    let instructions = "";

    if (mode == "interview") {
      instructions = "You are a senior software engineer interviewer...";
    } else if (mode == "tutor") {
      const { topic, language, experience } = config;
      instructions = `
      You are a friendly AI Tutor for ${topic}. User is a ${experience} in ${language}.
          
          GOAL: Teach ${topic} visually.
          
          RULES:
          1. **BE CONCISE**: Speak clearly and briefly. Avoid long monologues.
          2. **NO REPETITION**: Do not repeat introductions or what you just said.
          3. **VISUAL FIRST**: Always use a tool to show what you mean.
          
          FLOW:
          1. **PLAN**: Start with "create_note" for a Lesson Plan.
          2. **TEACH**: Use "create_slide" for concepts. Speak to the slide.
          3. **EXPLAIN**: Use "generate_diagram" for structures, "generate_animation" for dynamic processes.
          4. **CHECK**: Ask if they understand before moving on.
          
          Adjust depth for ${experience} level.
      `;
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

    if (mode === "tutor") {
      openAIWs.send({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
                I want to learn ${config.topic} in ${config.language}. I am a ${config.experience} level developer. Please act as my tutor. 
                CRITICAL INSTRUCTION: Start IMMEDIATELY by using the "create_note" tool to generate a "Lesson Plan" for this topic. 
                The note should outline what we will cover. 
                After creating the note, introduce yourself and ask if I'm ready to start with the first item.
                `,
            },
          ],
        },
      });
      openAIWs.send({ type: "response.create" });
    }
  };

  runInit();
}
