"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEffectivenessMatrix = buildEffectivenessMatrix;
exports.generateTaskTypeRules = generateTaskTypeRules;
const prisma_1 = require("../lib/prisma");
const task_type_service_1 = require("./task-type-service");
function confidenceLabel(count) {
    if (count >= 8)
        return 'high';
    if (count >= 3)
        return 'medium';
    return 'low';
}
async function buildEffectivenessMatrix() {
    const [runs, preferences] = await Promise.all([
        prisma_1.prisma.toolRun.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma_1.prisma.toolPreference.findMany(),
    ]);
    const matrix = new Map();
    for (const run of runs) {
        const key = `${run.taskType}:${run.toolId}`;
        const item = matrix.get(key) ?? {
            taskType: run.taskType,
            toolId: run.toolId,
            toolName: run.toolName,
            count: 0,
            successCount: 0,
            totalScore: 0,
            scoredCount: 0,
            adoptedCount: 0,
            skippedCount: 0,
            downvotedCount: 0,
        };
        item.count += 1;
        if (run.status === 'success')
            item.successCount += 1;
        if (typeof run.usefulnessScore === 'number') {
            item.totalScore += run.usefulnessScore;
            item.scoredCount += 1;
        }
        if (run.feedback === 'adopt')
            item.adoptedCount += 1;
        if (run.feedback === 'skip')
            item.skippedCount += 1;
        if (run.feedback === 'downvote')
            item.downvotedCount += 1;
        matrix.set(key, item);
    }
    const prefMap = new Map(preferences.map((p) => [`${p.taskType}:${p.toolId}`, p]));
    const cells = Array.from(matrix.values())
        .map((item) => {
        const pref = prefMap.get(`${item.taskType}:${item.toolId}`) || null;
        const avgScore = item.scoredCount ? item.totalScore / item.scoredCount : null;
        const successRate = item.count ? item.successCount / item.count : 0;
        const adoptRate = item.count ? item.adoptedCount / item.count : 0;
        const signalStrength = pref?.signalCount ?? item.count;
        return {
            taskType: item.taskType,
            taskTypeLabel: (0, task_type_service_1.taskTypeLabel)(item.taskType),
            toolId: item.toolId,
            toolName: item.toolName,
            count: item.count,
            successRate,
            adoptRate,
            avgScore,
            preference: pref?.preference ?? 0,
            signalStrength,
            confidence: confidenceLabel(signalStrength),
        };
    })
        .sort((a, b) => a.taskType.localeCompare(b.taskType) || b.signalStrength - a.signalStrength);
    return {
        taskTypes: Array.from(new Set(cells.map((c) => c.taskType))),
        tools: Array.from(new Set(cells.map((c) => c.toolId))),
        cells,
    };
}
async function generateTaskTypeRules() {
    const matrix = await buildEffectivenessMatrix();
    const grouped = new Map();
    for (const cell of matrix.cells) {
        const arr = grouped.get(cell.taskType) ?? [];
        arr.push(cell);
        grouped.set(cell.taskType, arr);
    }
    return Array.from(grouped.entries()).map(([taskType, cells]) => {
        const bestByAdopt = [...cells].sort((a, b) => b.adoptRate - a.adoptRate || b.signalStrength - a.signalStrength)[0];
        const bestByScore = [...cells].filter((c) => c.avgScore != null).sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))[0];
        const strongest = [...cells].sort((a, b) => b.signalStrength - a.signalStrength)[0];
        const rules = [
            bestByAdopt ? `在${(0, task_type_service_1.taskTypeLabel)(taskType)}任务中，「${bestByAdopt.toolName}」当前采纳率最高（${Math.round(bestByAdopt.adoptRate * 100)}%）。` : null,
            bestByScore ? `从评分看，「${bestByScore.toolName}」当前平均效果最好（${bestByScore.avgScore?.toFixed(1)} / 5）。` : null,
            strongest ? `当前最有把握的信号来自「${strongest.toolName}」（${strongest.signalStrength} 次信号，置信度 ${strongest.confidence}）。` : null,
        ].filter(Boolean);
        return {
            taskType,
            taskTypeLabel: (0, task_type_service_1.taskTypeLabel)(taskType),
            confidence: strongest?.confidence || 'low',
            signalStrength: strongest?.signalStrength || 0,
            rules,
        };
    });
}
