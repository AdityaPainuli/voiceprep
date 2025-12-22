import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import { registerRoutes } from './routes';
import { registerWebSocket } from './ws';

dotenv.config();

const fastify = Fastify({
  logger: true
});

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

fastify.register(cors, {
  origin: true // Allow all origins for now (dev)
});

registerRoutes(fastify);
registerWebSocket(fastify);

fastify.get('/api/health', async (request, response) => {
  return response.code(200).send({ status: "ok"})
})

