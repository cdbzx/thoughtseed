import { prisma } from '../lib/prisma';
import { splitTags } from '../utils/format';
import { expandIdeaWithAI } from './ai';

export async function createIdea(input: { content: string; sourceType?: string; tags?: string[] }) {
  return prisma.idea.create({
    data: {
      content: input.content,
      sourceType: input.sourceType ?? 'text',
      tags: input.tags ? input.tags.join(',') : '',
    },
    include: { expansion: true },
  });
}

export async function listIdeas() {
  return prisma.idea.findMany({
    orderBy: { createdAt: 'desc' },
    include: { expansion: true },
  });
}

export async function getIdea(id: string) {
  return prisma.idea.findUnique({
    where: { id },
    include: { expansion: true },
  });
}

export async function expandIdea(id: string) {
  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return null;

  const payload = await expandIdeaWithAI({
    content: idea.content,
    tags: splitTags(idea.tags),
  });

  await prisma.ideaExpansion.upsert({
    where: { ideaId: id },
    update: payload,
    create: {
      ...payload,
      ideaId: id,
    },
  });

  await prisma.idea.update({
    where: { id },
    data: { status: 'expanded' },
  });

  return prisma.ideaExpansion.findUnique({ where: { ideaId: id } });
}

export async function listTodayReview() {
  return prisma.idea.findMany({
    where: {
      status: {
        not: 'archived',
      },
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    take: Number(process.env.REVIEW_DAILY_LIMIT ?? 5),
    include: { expansion: true },
  });
}

export async function applyReviewAction(id: string, action: 'develop' | 'later' | 'ignore') {
  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return null;

  const nextStatus = action === 'develop' ? 'reviewing' : action === 'later' ? 'expanded' : 'archived';

  return prisma.idea.update({
    where: { id },
    data: { status: nextStatus },
    include: { expansion: true },
  });
}
