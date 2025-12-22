import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { createUser, findByEmail, getUserById } from '../db/user';
import { signToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../db/client';

export default async function authRoutes(app: FastifyInstance) {

  // REGISTER
  app.post('/register', async (req, reply) => {
    const { email, password } = req.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'missing_fields' });
    }

    const existing = await findByEmail(email);
    if (existing) {
      return reply.status(409).send({ error: 'user_exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser(email, hashed);

    const token = signToken({ id: user.id, email: user.email });

    reply.send({ token });
  });

  // LOGIN
  app.post('/login', async (req, reply) => {
    const { email, password } = req.body as any;

    const user = await findByEmail(email);
    if (!user) {
      return reply.status(401).send({ error: 'invalid_credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: 'invalid_credentials' });
    }

    const token = signToken({ id: user.id, email: user.email });

    reply.send({ token });
  });

  app.get('/me', {preHandler: authMiddleware}, async (req: any, reply) => {
      const user = await getUserById(req.user.id);
      
      reply.send({ user: {...user, name: user?.name ? user?.name : user?.email.split('@')[0] }  })
  })
}
