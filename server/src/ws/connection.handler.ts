import WebSocket from 'ws';
import { createOpenAIClient } from './openai/openai.client';
import { handleClientMessage } from './client.events';
import { handleOpenAIMessage } from './openai/openai.events';
import 'dotenv/config';

export function handleWsConnection(ws: WebSocket, req: any) {
  console.log('🔗 Client connected');
  const API_KEY = process.env.OPENAI_API_KEY!;

  const openAI = createOpenAIClient(API_KEY);

  openAI.onMessage((msg) => handleOpenAIMessage(msg, ws, openAI));

  ws.on('message', (raw) => {
    handleClientMessage(raw.toString(), ws, openAI);
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
    openAI.close();
  });
}
