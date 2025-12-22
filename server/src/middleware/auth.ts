import { FastifyRequest } from 'fastify';
import { verifyToken } from '../utils/jwt';



export async function authMiddleware(req: any, reply: any) {
  const header = req.headers.authorization;
  if (!header) {
    return reply.status(401).send({ error: 'unauthorized' });
  }

  const token = header.replace('Bearer ', '');
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch {
    return reply.status(401).send({ error: 'invalid_token' });
  }
}
