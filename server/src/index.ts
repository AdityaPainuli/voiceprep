import Fastify from 'fastify';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import path from 'path';

dotenv.config();

const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env');
  process.exit(1);
}

const fastify = Fastify({
  logger: true
});

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  const openAIWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
      headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  const initializeSession = () => {
    const sessionUpdate = {
      type: 'session.update',
      session: {
        turn_detection: { 
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 400
        },
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        voice: 'alloy',
        instructions: 'You are a senior software engineer interviewer. Your goal is to conduct a realistic mock interview. Start by greeting the candidate and asking them which programming language they would like to use for the interview. Once they specify a language, use the \"post_question\" tool to send them a technical question (e.g., a coding problem or concept check) suitable for a software engineering role. ALWAYS provide 2-3 test cases with the question using the \"testCases\" parameter. Listen to their response, ask follow-up questions to probe their understanding, and provide constructive feedback on their approach and communication. When the user submits code, analyze it. If the code is incorrect, suboptimal, or could be improved in ANY way (style, performance, readability), you MUST use the \"provide_code_correction\" tool to show the corrected version. Do not just describe the changes verbally; show them using the tool. Explain the changes verbally while the tool displays the diff. CRITICAL: If the user asks for ANY of the following, you MUST use the \"provide_code_correction\" tool: suggestions, improvements, optimizations, refactoring, better code, cleaner code, fixing issues, or any request to modify/enhance their code. NEVER give verbal-only suggestions for code changes. ALWAYS show the improved code using the tool, even if they just ask \"can you suggest improvements?\" or \"how can I optimize this?\". Verbal explanation alone is FORBIDDEN for code changes. You must show the diff. If the code is correct, praise them. IMPORTANT: When the user submits a CORRECT solution, use the \"mark_question_solved\" tool to enable the \"Next Question\" button. Do NOT move to the next question automatically. Wait for the user to click \"Next Question\" (which will send a \"next_question\" event) or explicitly ask for it before posting a new question. If the user asks to run the code (or clicks Run), you MUST simulate the execution and use the \"provide_execution_output\" tool. DO NOT just say the output verbally. You MUST use the tool to display it. If the code is correct, use status=\"success\". If there are errors, use status=\"error\" and provide the EXACT error message and stack trace. Keep the tone professional but encouraging.',
        modalities: ["text", "audio"],
        temperature: 0.8,
        tools: [{
          type: "function",
          name: "post_question",
          description: "Post a technical interview question to the candidate's screen with test cases.",
          parameters: {
            type: "object",
            properties: {
              question: { type: "string", description: "The text of the question to display." },
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
          description: "Provide a corrected version of the candidate's code with fixes or improvements.",
          parameters: {
            type: "object",
            properties: {
              correctedCode: { type: "string", description: "The full corrected code snippet." },
              explanation: { type: "string", description: "Brief explanation of what was fixed." }
            },
            required: ["correctedCode", "explanation"]
          }
        }, {
          type: "function",
          name: "provide_execution_output",
          description: "Provide the output of the simulated code execution.",
          parameters: {
            type: "object",
            properties: {
              output: { type: "string", description: "The console output of the code execution." },
              status: { type: "string", enum: ["success", "error"], description: "The execution status." }
            },
            required: ["output", "status"]
          }
        }]
      },
    };
    console.log('Sending session update:', JSON.stringify(sessionUpdate));
    openAIWs.send(JSON.stringify(sessionUpdate));
  };

  openAIWs.on('open', () => {
    console.log('Connected to OpenAI');
    initializeSession();
  });

  openAIWs.on('message', (data) => {
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
                    explanation: args.explanation
                }));
            } else if (response.name === 'provide_execution_output') {
                ws.send(JSON.stringify({
                    type: 'execution_output',
                    output: args.output,
                    status: args.status
                }));
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
      
      if (data.type === 'audio' && openAIWs.readyState === WebSocket.OPEN) {
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
                        text: `I want to run this code. Please simulate the execution. If there are errors (syntax, runtime, etc.), provide the EXACT error message and stack trace in the output and set status to 'error'. If it runs successfully, show the output and set status to 'success'.\n\n${data.code}`
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
      }

    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    openAIWs.close();
  });
});

console.log('WebSocket server started on port 8080');
