import { WebSocketServer } from 'ws';
import { handleWsConnection } from './connection.handler';
import type { FastifyInstance } from 'fastify';

export function registerWebSocket(fastify: FastifyInstance) {
  const wss = new WebSocketServer({ server: fastify.server });

  wss.on('connection', (ws, req) => {
    handleWsConnection(ws, req);
  });
}
