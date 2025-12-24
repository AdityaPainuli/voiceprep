import { prisma } from "./client";
import "dotenv/config";

export function createUser(email: string, password: string) {
    return prisma.user.create({
        data: {
            email,
            password
        }
    })
}

export function findByEmail(email: string) {
    return prisma.user.findUnique({
        where: {email}
    })
}

export function getUserById(userId: string) {
    return prisma.user.findUnique({
        where: {
            id: userId
        }
    })
}

export function IncrementDiagram(userId: string) {
    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            diagramsUsed: {
                increment: 1
            }
        }
    })
}

export function IncrementVideo(userId: string) {
    return prisma.user.update({
        where: {
            id: userId
        },
        data: {
            videosUsed: {
                increment: 1,
            }
        }
    })
}

// TODO: How to track credit balance, real-time minutes used and token used.
