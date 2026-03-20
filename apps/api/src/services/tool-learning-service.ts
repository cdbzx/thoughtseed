import { prisma } from '../lib/prisma';

export async function applyToolFeedback(input: {
  toolRunId: string;
  feedback: 'adopt' | 'skip' | 'downvote';
  note?: string;
}) {
  const run = await prisma.toolRun.findUnique({ where: { id: input.toolRunId } });
  if (!run) return null;

  const delta = input.feedback === 'adopt' ? 2 : input.feedback === 'skip' ? -1 : -2;

  const updatedRun = await prisma.toolRun.update({
    where: { id: input.toolRunId },
    data: {
      feedback: input.feedback,
      feedbackNote: input.note?.trim() || null,
    },
  });

  for (const taskType of ['global', run.taskType || 'exploration']) {
    await prisma.toolPreference.upsert({
      where: { toolId_taskType: { toolId: run.toolId, taskType } },
      update: {
        toolName: run.toolName,
        preference: { increment: delta },
        signalCount: { increment: 1 },
        lastSignal: input.feedback,
      },
      create: {
        toolId: run.toolId,
        toolName: run.toolName,
        taskType,
        preference: delta,
        signalCount: 1,
        lastSignal: input.feedback,
      },
    });
  }

  return updatedRun;
}

export async function listToolPreferences(taskType?: string) {
  return prisma.toolPreference.findMany({
    where: taskType ? { taskType } : undefined,
    orderBy: [{ preference: 'desc' }, { signalCount: 'desc' }, { updatedAt: 'desc' }],
  });
}
