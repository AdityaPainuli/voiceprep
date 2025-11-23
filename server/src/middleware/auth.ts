import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export interface AuthRequest extends FastifyRequest {
  user?: {
    userId: string;
    email: string;
    plan: string;
  };
}

export const authenticate = async (request: AuthRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    request.user = decoded;
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
};
