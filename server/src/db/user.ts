import { prisma } from "./client";
import "dotenv/config";

export function createUser(email: string, password: string) {
  return prisma.user.create({
    data: {
      email,
      password,
    },
  });
}

export function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}
