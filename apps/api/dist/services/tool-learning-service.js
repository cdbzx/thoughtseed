"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyToolFeedback = applyToolFeedback;
exports.listToolPreferences = listToolPreferences;
const prisma_1 = require("../lib/prisma");
async function applyToolFeedback(input) {
    const run = await prisma_1.prisma.toolRun.findUnique({ where: { id: input.toolRunId } });
    if (!run)
        return null;
    const delta = input.feedback === 'adopt' ? 2 : input.feedback === 'skip' ? -1 : -2;
    const updatedRun = await prisma_1.prisma.toolRun.update({
        where: { id: input.toolRunId },
        data: {
            feedback: input.feedback,
            feedbackNote: input.note?.trim() || null,
        },
    });
    for (const taskType of ['global', run.taskType || 'exploration']) {
        await prisma_1.prisma.toolPreference.upsert({
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
async function listToolPreferences(taskType) {
    return prisma_1.prisma.toolPreference.findMany({
        where: taskType ? { taskType } : undefined,
        orderBy: [{ preference: 'desc' }, { signalCount: 'desc' }, { updatedAt: 'desc' }],
    });
}
