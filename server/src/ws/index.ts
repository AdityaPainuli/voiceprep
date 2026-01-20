import { WebSocketServer } from "ws";
import { handleWsConnection } from "./connection.handler";
import { handleDemoWsConnection } from "./demo.connection.handler";
import type { FastifyInstance } from "fastify";

export function registerWebSocket(fastify: FastifyInstance) {
  const wss = new WebSocketServer({ server: fastify.server });

  wss.on("connection", (ws, req) => {
    const url = req.url || "";

    if (url.startsWith("/ws/demo") || url.startsWith("/demo")) {
      console.log("Demo Websocket connection");
      handleDemoWsConnection(ws, req);
      return;
    }
    if (url.startsWith("/?token=")) {
      console.log("Auth WS connection");
      handleWsConnection(ws, req);
      return;
    }

    console.warn("Unknown WS route:", url);
    ws.close(1008, "Invalid Websocket route");
  });
}
