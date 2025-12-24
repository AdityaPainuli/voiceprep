import { prisma } from "./client";

interface CreateAnimationInterface {
  fileId: string;
  fileUrl: string;
  metaData: string;
}

export function addDiagram(slideId: string, data: CreateAnimationInterface) {
  // return prisma.diagram.create({
  //     data: {
  //         fileId: data.fileId,
  //         type: 'ARCHITECTURE', // hardcoding for right now.
  //     }
  // })
}

export function addAnimation(slideId: string, data: CreateAnimationInterface) {
  // return prisma.animation.create({
  //     data: {
  //         slideId,
  //         fileId: data.fileId,
  //         fileUrl: data.fileUrl,
  //         metadata: data.metaData,
  //     }
  // })
}
