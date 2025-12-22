import Fastify, { RequestPayload } from 'fastify';
import { PrismaClient } from '@prisma/client';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import path from 'path';
import fastifyStatic from '@fastify/static';
import { ManimService } from './services/ManimService';
import { UsageService } from './services/UsageService';
import jwt from 'jsonwebtoken';
import cors from '@fastify/cors';
import { railwayS3 } from './services/bucket';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { registerRoutes } from './routes';

dotenv.config();

const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env');
  process.exit(1);
}

const fastify = Fastify({
  logger: true
});

// Serve static files (including generated animations)
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/', // accessible at http://localhost:8080/animations/...
});

const manimService = new ManimService();
// const usageService = new UsageService();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';
const BASE_URL = process.env.BASE_URL

const startServer = async () => {
  try {
    await fastify.listen({ port: 8080, host: '0.0.0.0' });
    console.log('Fastify server started on port 8080');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();

// Enable CORS
fastify.register(cors, {
  origin: true // Allow all origins for now (dev)
});

registerRoutes(fastify)

fastify.get('/api/health', async (request, response) => {
  return response.code(200).send({ status: "ok"})
})

fastify.post('/api/animations/:id', async (request, reply) => {
    // In frontend - <video src="/api/animations/manim_123" controls />
    const {id} = request.params as {id : string};
    const key = `manim/${id}.mp4`;

    try {
      const result = await railwayS3.send(
        new GetObjectCommand({
          Bucket: "optimized-holster-aovy0bb",
          Key: key,
        })
      );

      if (!result.Body) {
        reply.code(404).send({ error: 'Video not found' });
        return;
      }

      reply.header('Content-Type', "video/mp4").header('Cache-Control', 'no-store').header('Accept-Ranges', 'bytes')

      return reply.send(result.Body)
    } catch (err: any) {
      if (err.name === "NoSuchKey") {
        reply.code(404).send({ error: 'Video not found' });
        return;
      }

      console.error("Failed to stream video: ", err);
      reply.code(500).send({ error: "Failed to stream video" });
    }

})


const wss = new WebSocketServer({ server: fastify.server });

wss.on('connection', async (ws, req) => {
  // Extract token from query string: /?token=...
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  let user: any = null;
  const sessionStartTime = Date.now();

  // if (token) {
  //   try {
  //     const decoded = jwt.verify(token, JWT_SECRET) as any;
  //     user = await authService.getUser(decoded.userId);
      
  //     // Check if user has minutes left
  //     try {
  //       await usageService.checkLimit(user.id, 'realtimeMinutes', 1); // Check if at least 1 min available
  //     } catch (e: any) {
  //       console.log('User limit reached:', e.message);
  //       ws.close(1008, e.message);
  //       return;
  //     }

  //     console.log(`User connected: ${user.email} (${user.plan})`);
  //   } catch (err) {
  //     console.log('Invalid token for WS connection');
  //     ws.close(1008, 'Invalid token');
  //     return;
  //   }
  // } else {
  //   console.log('No token provided for WS connection');
  //   ws.close(1008, 'Authentication required');
  //   return;
  // }

  console.log('Client connected');

  // ... (rest of the WS logic, now with access to `user` object)
  // Pass `user` to initializeSession or store it in a map if needed
  
  const openAIWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-realtime', {
      headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  const initializeSession = (mode: 'interview' | 'tutor', config?: any) => {
      // ... (keep existing logic)
      const runInit = () => {
        if (openAIWs.readyState !== WebSocket.OPEN) {
            console.log('OpenAI WebSocket not ready yet, retrying in 100ms...');
            setTimeout(runInit, 100);
            return;
        }

        let instructions = '';
        
        if (mode === 'interview') {
          instructions = 'You are a senior software engineer interviewer. Your goal is to conduct a realistic mock interview. Start by greeting the candidate and asking them which programming language they would like to use for the interview. Once they specify a language, use the "post_question" tool to send them a technical question (e.g., a coding problem or concept check) suitable for a software engineering role. ALWAYS provide 2-3 test cases with the question using the "testCases" parameter. Listen to their response, ask follow-up questions to probe their understanding, and provide constructive feedback on their approach and communication. When the user submits code, analyze it. If the code is incorrect, suboptimal, or could be improved in ANY way (style, performance, readability), you MUST use the "provide_code_correction" tool to show the corrected version. Do not just describe the changes verbally; show them using the tool. Explain the changes verbally while the tool displays the diff. CRITICAL: If the user asks for ANY of the following, you MUST use the "provide_code_correction" tool: suggestions, improvements, optimizations, refactoring, better code, cleaner code, fixing issues, or any request to modify/enhance their code. NEVER give verbal-only suggestions for code changes. ALWAYS show the improved code using the tool, even if they just ask "can you suggest improvements?" or "how can I optimize this?". Verbal explanation alone is FORBIDDEN for code changes. You must show the diff. If the code is correct, praise them. IMPORTANT: When the user submits a CORRECT solution, use the "mark_question_solved" tool to enable the "Next Question" button. Do NOT move to the next question automatically. Wait for the user to click "Next Question" (which will send a "next_question" event) or explicitly ask for it before posting a new question. If the user asks to run the code (or clicks Run), you MUST simulate the execution and use the "provide_execution_output" tool. DO NOT just say the output verbally. You MUST use the tool to display it. If the code is correct, use status="success". If there are errors, use status="error" and provide the EXACT error message and stack trace. Keep the tone professional but encouraging.';
        } else if (mode === 'tutor') {
          const { topic, language, experience } = config;
          instructions = `You are a friendly AI Tutor for ${topic}. User is a ${experience} in ${language}.
          
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
          
          Adjust depth for ${experience} level.`;
        }

        const sessionUpdate = {
          type: 'session.update',
          session: {
            turn_detection: { 
              type: 'server_vad',
              threshold: 0.6,
              prefix_padding_ms: 300,
              silence_duration_ms: 600
            },
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            voice: 'alloy',
            instructions: instructions,
            modalities: ["text", "audio"],
            temperature: 0.6,
            tools: [{
              type: "function",
              name: "post_question",
            description: "Post a technical interview question or a coding exercise to the candidate's screen with test cases.",
              parameters: {
                type: "object",
                properties: {
                  question: { type: "string", description: "The text of the question or exercise to display." },
                  testCases: { 
                    type: "array", 
                    items: {
                        type: "object",
                        properties: {
                            input: { type: "string" },
                            expectedOutput: { type: "string" }
                        }
                    },
                    description: "Array of test cases (input/output pairs)."
                  }
                },
                required: ["question", "testCases"]
              }
            }, {
              type: "function",
              name: "mark_question_solved",
              description: "Mark the current question as solved when the candidate provides a correct solution.",
              parameters: {
                type: "object",
                properties: {
                  feedback: { type: "string", description: "Brief feedback on the solution." }
                },
                required: ["feedback"]
              }
            }, {
              type: "function",
              name: "provide_code_correction",
              description: "Provide a corrected version of the candidate's code, or show a code example.",
              parameters: {
                type: "object",
                properties: {
                  correctedCode: { type: "string", description: "The full code snippet to display." },
                  language: { type: "string", description: "The programming language of the code (e.g., 'python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust')." },
                  explanation: { type: "string", description: "Brief explanation of the code." }
                },
                required: ["correctedCode", "language", "explanation"]
              }
            }, {
              type: "function",
              name: "provide_execution_output",
              description: "Provide the output of the simulated code execution.",
              parameters: {
                type: "object",
                properties: {
                  output: { type: "string", description: "The console output of the code execution." },
                  status: { type: "string", enum: ["success", "error"], description: "The execution status." },
                  id: { type: "string", description: "The internal ID provided in the user's request (if any)." }
                },
                required: ["output", "status"]
              }
            }, {
              type: "function",
              name: "generate_chart",
              description: "Generate a standard chart for QUANTITATIVE/NUMERICAL data (e.g., performance metrics, market share, comparisons).",
              parameters: {
                type: "object",
                properties: {
                  type: { 
                    type: "string", 
                    enum: ["bar", "line", "pie", "doughnut", "radar"],
                    description: "The type of chart to generate." 
                  },
                  data: {
                    type: "object",
                    properties: {
                      labels: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "Labels for the X-axis or categories."
                      },
                      datasets: {
                        type: "array", 
                        items: { 
                          type: "object",
                          properties: {
                            label: { type: "string", description: "Label for the dataset." },
                            data: { 
                              type: "array", 
                              items: { type: "number" },
                              description: "Array of numerical values corresponding to the labels."
                            },
                            backgroundColor: { 
                              type: "array", 
                              items: { type: "string" },
                              description: "Optional array of colors for the data points."
                            }
                          },
                          required: ["label", "data"]
                        },
                        description: "Data points. MUST include at least one dataset."
                      }
                    },
                    required: ["labels", "datasets"]
                  },
                  title: { type: "string", description: "Title of the chart." },
                  description: { type: "string", description: "Brief description of what the chart shows." }
                },
                required: ["type", "data", "title"]
              }
            }, {
              type: "function",
              name: "generate_diagram",
              description: "Generate a structural diagram using Mermaid.js for CONCEPTS, FLOWS, and DATA STRUCTURES (e.g., Linked Lists, Trees, Graphs, Class Diagrams, Flowcharts).",
              parameters: {
                type: "object",
                properties: {
                  code: { type: "string", description: "The Mermaid.js syntax string. Do not include markdown backticks." },
                  title: { type: "string", description: "Title of the diagram." },
                  description: { type: "string", description: "Brief description of what the diagram shows." }
                },
                required: ["code", "title"]
              }
            }, {
              type: "function",
              name: "create_note",
              description: "Create a structured note card for the user's notebook.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Title of the note." },
                  content: { type: "string", description: "The content of the note. MUST use rich Markdown formatting: Use Headers (##), Bold (**text**), Lists (- item), and Code Blocks (```language) to organize information clearly." },
                  tags: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Optional tags for the note (e.g., 'Concept', 'Tip', 'Warning')."
                  }
                },
                required: ["title", "content"]
              }
            }, {
              type: "function",
              name: "create_slide",
              description: "Create a presentation slide for a specific topic.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Title of the slide (the topic)." },
                  bulletPoints: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "List of 3-5 key points to display on the slide."
                  }
                },
                required: ["title", "bulletPoints"]
              }
            }, {
              type: "function",
              name: "generate_animation",
              description: "Generate a video animation using Manim (Python) for explaining DYNAMIC concepts (e.g., how a Linked List insertion works, Binary Search visualization, Physics concepts).",
              parameters: {
                type: "object",
                properties: {
                  code: { type: "string", description: "The Python code for the Manim Scene. Must define a class inheriting from Scene (e.g. class MyScene(Scene):). The code should construct the animation." },
                  title: { type: "string", description: "Title of the animation." },
                  description: { type: "string", description: "Brief description of what the animation shows." }
                },
                required: ["code", "title"]
              }
            }]
          },
        };
        console.log('Sending session update:', JSON.stringify(sessionUpdate));
        try {
            openAIWs.send(JSON.stringify(sessionUpdate));
        } catch (e) {
            console.error('Failed to send session update, retrying in 100ms:', e);
            setTimeout(runInit, 100);
            return;
        }

        // For Tutor mode, trigger an initial response to greet the user
        if (mode === 'tutor') {
            // Inject context as a user message to ensure the model understands the scenario
            const contextMessage = {
                type: 'conversation.item.create',
                item: {
                    type: 'message',
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: `I want to learn ${config.topic} in ${config.language}. I am a ${config.experience} level developer. Please act as my tutor. 
                            
                            CRITICAL INSTRUCTION: Start IMMEDIATELY by using the "create_note" tool to generate a "Lesson Plan" for this topic. 
                            The note should outline what we will cover. 
                            After creating the note, introduce yourself and ask if I'm ready to start with the first item.`
                        }
                    ]
                }
            };
            console.log('Injecting tutor context:', JSON.stringify(contextMessage));
            try {
                openAIWs.send(JSON.stringify(contextMessage));
                openAIWs.send(JSON.stringify({ type: 'response.create' }));
            } catch (e) {
                console.error('Failed to send context message:', e);
            }
        }
      };

      runInit();
  };

  openAIWs.on('open', () => {
    console.log('Connected to OpenAI');
    // Wait for client to send init_session before initializing OpenAI session
  });

  openAIWs.on('message', async (data) => {
    try {
        const response = JSON.parse(data.toString());
        if (response.type === 'session.updated') {
            console.log('Session updated successfully:', response);
        }

        if (response.type === 'response.function_call_arguments.done') {
            console.log('Tool called:', response);
            const args = JSON.parse(response.arguments);
            

            if (response.name === 'post_question') {
                ws.send(JSON.stringify({
                    type: 'question',
                    question: args.question,
                    testCases: args.testCases
                }));
            } else if (response.name === 'mark_question_solved') {
                ws.send(JSON.stringify({
                    type: 'question_solved',
                    feedback: args.feedback
                }));
            } else if (response.name === 'provide_code_correction') {
                ws.send(JSON.stringify({
                    type: 'correction',
                    correctedCode: args.correctedCode,
                    language: args.language,
                    explanation: args.explanation
                }));
            } else if (response.name === 'provide_execution_output') {
                ws.send(JSON.stringify({
                    type: 'execution_output',
                    output: args.output,
                  status: args.status,
                    language: args.language,
                    id: args.id
                }));
            } else if (response.name === 'generate_chart') {
                ws.send(JSON.stringify({
                    type: 'chart',
                    chartType: args.type,
                    data: args.data,
                    title: args.title,
                    description: args.description
                }));
            } else if (response.name === 'generate_diagram') {
                ws.send(JSON.stringify({
                    type: 'diagram',
                    code: args.code,
                    title: args.title,
                    description: args.description
                }));
            } else if (response.name === 'create_note') {
                ws.send(JSON.stringify({
                    type: 'note',
                    title: args.title,
                    content: args.content,
                    tags: args.tags
                }));
            } else if (response.name === 'create_slide') {
                ws.send(JSON.stringify({
                    type: 'slide',
                    title: args.title,
                    bulletPoints: args.bulletPoints
                }));
            } else if (response.name === 'generate_animation') {
                // Notify client that generation started (optional, or just wait)
                console.log('Generating animation...');
                
                try {
                    const videoUrl = await manimService.generateVideo(args.code);
                    const fullUrl = `${BASE_URL}/${videoUrl}`;
                    
                    ws.send(JSON.stringify({
                        type: 'animation',
                        url: fullUrl,
                        title: args.title,
                        description: args.description,
                        code: args.code,
                        objectId: videoUrl.id,
                        objectKey: videoUrl.key
                    }));
                } catch (error) {
                    console.error('Animation generation failed:', error);
                    // Optionally send error to client
                }
            }
            
            // Acknowledge the tool call (required for the model to continue)
            const toolOutput = {
                type: 'conversation.item.create',
                item: {
                    type: 'function_call_output',
                    call_id: response.call_id,
                    output: JSON.stringify({ success: true })
                }
            };
            openAIWs.send(JSON.stringify(toolOutput));
            openAIWs.send(JSON.stringify({ type: 'response.create' }));
        }

        if (response.type === 'response.audio.delta' && response.delta) {
            // Relay audio to client
            const audioDelta = {
                event: 'media',
                media: {
                    payload: response.delta
                }
            };
            ws.send(JSON.stringify(audioDelta));
        }

        if (response.type === 'input_audio_buffer.speech_started') {
            ws.send(JSON.stringify({ type: 'speech_started' }));
        }

        if (response.type === 'input_audio_buffer.speech_stopped') {
            ws.send(JSON.stringify({ type: 'speech_stopped' }));
        }

        if (response.type === 'response.created') {
            ws.send(JSON.stringify({ type: 'thinking' }));
        }
    } catch (e) {
        console.error('Error processing OpenAI message:', e, 'Raw message:', data.toString());
    }
  });

  openAIWs.on('error', (error) => {
    console.error('OpenAI WebSocket error:', error);
  });

  openAIWs.on('close', () => {
    console.log('Disconnected from OpenAI');
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message from client:', data.type);
      
      if (data.type === 'init_session') {
        initializeSession(data.mode, data.config);
      } else if (data.type === 'audio' && openAIWs.readyState === WebSocket.OPEN) {
        const audioAppend = {
            type: 'input_audio_buffer.append',
            audio: data.payload
        };
        openAIWs.send(JSON.stringify(audioAppend));
      } else if (data.type === 'submit_code' && openAIWs.readyState === WebSocket.OPEN) {
        const codeSubmission = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: `Here is my solution code:\n\n${data.code}\n\nPlease evaluate it.`
                    }
                ]
            }
        };
        openAIWs.send(JSON.stringify(codeSubmission));
        openAIWs.send(JSON.stringify({ type: 'response.create' }));
      } else if (data.type === 'run_code' && openAIWs.readyState === WebSocket.OPEN) {
        const codeExecution = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: `I want to run this code. Please simulate the execution. If there are errors (syntax, runtime, etc.), provide the EXACT error message and stack trace in the output and set status to 'error'. If it runs successfully, show the output and set status to 'success'.\n\n${data.code}\n\n(Internal ID: ${data.id})`
                    }
                ]
            }
        };
        openAIWs.send(JSON.stringify(codeExecution));
        openAIWs.send(JSON.stringify({ type: 'response.create' }));
      } else if (data.type === 'next_question' && openAIWs.readyState === WebSocket.OPEN) {
        const nextQuestionRequest = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: `I am ready for the next question. Please provide a new technical interview question.`
                    }
                ]
            }
        };
        openAIWs.send(JSON.stringify(nextQuestionRequest));
        openAIWs.send(JSON.stringify({ type: 'response.create' }));
      } else if (data.type === 'text_message' && openAIWs.readyState === WebSocket.OPEN) {
        const textMessage = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: data.text
                    }
                ]
            }
        };
        openAIWs.send(JSON.stringify(textMessage));
        openAIWs.send(JSON.stringify({ type: 'response.create' }));
      }

    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });

  ws.on('close', async () => {
    console.log('Client disconnected');
    openAIWs.close();
    
    // Track session duration
    if (user) {
        // await usageService.trackSessionDuration(user.id, sessionStartTime);
    }
  });
});
