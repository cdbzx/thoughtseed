"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIdeaToolRuns = listIdeaToolRuns;
exports.createToolRun = createToolRun;
exports.listRecentLearnedRules = listRecentLearnedRules;
exports.buildToolMemoryStats = buildToolMemoryStats;
const prisma_1 = require("../lib/prisma");
async function listIdeaToolRuns(ideaId) {
    return prisma_1.prisma.toolRun.findMany({
        where: { ideaId },
        orderBy: { createdAt: 'desc' },
    });
}
async function createToolRun(input) {
    return prisma_1.prisma.toolRun.create({
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
async function listRecentLearnedRules() {
    return prisma_1.prisma.toolRun.findMany({
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
async function buildToolMemoryStats() {
    const [runs, preferences] = await Promise.all([
        prisma_1.prisma.toolRun.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma_1.prisma.toolPreference.findMany({ orderBy: [{ preference: 'desc' }, { signalCount: 'desc' }] }),
    ]);
    const byTool = new Map();
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
        if (run.status === 'success')
            current.successCount += 1;
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
