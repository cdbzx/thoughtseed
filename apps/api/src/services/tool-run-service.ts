import { prisma } from '../lib/prisma';

export type CreateToolRunInput = {
  ideaId: string;
  toolId: string;
  toolName: string;
  taskType?: string;
  taskSummary: string;
  inputSummary: string;
  resultSummary: string;
  status?: 'success' | 'partial' | 'failed';
  usefulnessScore?: number | null;
  learnedRule?: string | null;
};

export async function listIdeaToolRuns(ideaId: string) {
  return prisma.toolRun.findMany({
    where: { ideaId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createToolRun(input: CreateToolRunInput) {
  return prisma.toolRun.create({
    data: {
      ideaId: input.ideaId,
      toolId: input.toolId,
      toolName: input.toolName,
      taskType: input.taskType ?? 'exploration',
      taskSummary: input.taskSummary,
      inputSummary: input.inputSummary,
      resultSummary: input.resultSummary,
      status: input.status ?? 'success',
      usefulnessScore: input.usefulnessScore ?? null,
      learnedRule: input.learnedRule ?? null,
    },
  });
}

export async function listRecentLearnedRules() {
  return prisma.toolRun.findMany({
    where: {
      learnedRule: {
        not: null,
      },
    },
    orderBy: [{ usefulnessScore: 'desc' }, { createdAt: 'desc' }],
    take: 20,
    select: {
      id: true,
      ideaId: true,
      toolId: true,
      toolName: true,
      taskSummary: true,
      learnedRule: true,
      usefulnessScore: true,
      createdAt: true,
    },
  });
}

export async function buildToolMemoryStats() {
  const [runs, preferences] = await Promise.all([
    prisma.toolRun.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.toolPreference.findMany({ orderBy: [{ preference: 'desc' }, { signalCount: 'desc' }] }),
  ]);

  const byTool = new Map<string, { toolId: string; toolName: string; count: number; successCount: number; totalScore: number; scoredCount: number }>();

  for (const run of runs) {
    const current = byTool.get(run.toolId) ?? {
      toolId: run.toolId,
      toolName: run.toolName,
      count: 0,
      successCount: 0,
      totalScore: 0,
      scoredCount: 0,
    };

    current.count += 1;
    if (run.status === 'success') current.successCount += 1;
    if (typeof run.usefulnessScore === 'number') {
      current.totalScore += run.usefulnessScore;
      current.scoredCount += 1;
    }

    byTool.set(run.toolId, current);
  }

  return {
    totalRuns: runs.length,
    learnedRulesCount: runs.filter((item) => item.learnedRule).length,
    preferenceSignals: preferences.reduce((sum, item) => sum + item.signalCount, 0),
    preferences: preferences,
    tools: Array.from(byTool.values())
      .map((item) => ({
        toolId: item.toolId,
        toolName: item.toolName,
        count: item.count,
        successRate: item.count ? item.successCount / item.count : 0,
        avgScore: item.scoredCount ? item.totalScore / item.scoredCount : null,
      }))
      .sort((a, b) => b.count - a.count),
  };
}
