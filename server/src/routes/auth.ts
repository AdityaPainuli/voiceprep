import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { createUser, findByEmail, getUserById } from "../db/user";
import { signToken } from "../utils/jwt";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../db/client";
import { generateEmailToken } from "../utils/token";
import { sendVerificationEmail } from "../utils/email";

interface VerifyEmailInterface {
  Querystring: {
    token: string;
  };
  Reply: string;
}

export default async function authRoutes(app: FastifyInstance) {
  // REGISTER
  app.post("/register", async (req, reply) => {
    const { email, password } = req.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: "missing_fields" });
    }

    const existing = await findByEmail(email);
    if (existing) {
      return reply.status(409).send({ error: "user_exists" });
    }
    const { token: emailToken, hash } = generateEmailToken();

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser(email, hashed);
    // TODO: Move to Database logic folder.
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    await sendVerificationEmail(user.email, emailToken);

    const token = signToken({ id: user.id, email: user.email });

    reply.send({ token });
  });

  // LOGIN
  app.post("/login", async (req, reply) => {
    const { email, password } = req.body as any;

    const user = await findByEmail(email);
    if (!user) {
      return reply.status(401).send({ error: "invalid_credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: "invalid_credentials" });
    }

    const token = signToken({ id: user.id, email: user.email });

    reply.send({ token });
  });

  app.get("/me", { preHandler: authMiddleware }, async (req: any, reply) => {
    const user = await getUserById(req.user.id);

    reply.send({
      user: {
        ...user,
        name: user?.name ? user?.name : user?.email.split("@")[0],
      },
    });
  });

  app.get<VerifyEmailInterface>("/verify-email", async (req, reply) => {
    const { token } = req.query;
    if (!token) return reply.status(400).send("Invalid_token");

    const hash = crypto.createHash("sha256").update(token).digest("hex");

    const record = await prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash: hash,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!record) return reply.status(400).send("Link expired or invalid");
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });

    await prisma.emailVerificationToken.delete({
      where: { id: record.id },
    });

    reply.status(200).send("Email verified successfully.");
  });
}
