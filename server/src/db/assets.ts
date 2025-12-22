import { prisma } from "./client";

export function addDiagram(slidesId: string, data: any) {
    return prisma.diagram.create({
        data: {
            slidesId,
            ...data,
        }
    })
}