import { prisma } from "@/lib/db";

export async function getChildForParent(parentId: string, childId: string) {
  return prisma.childProfile.findFirst({
    where: { id: childId, parentId },
  });
}
