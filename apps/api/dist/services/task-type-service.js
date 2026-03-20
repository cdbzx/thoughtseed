"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectTaskType = detectTaskType;
exports.taskTypeLabel = taskTypeLabel;
function detectTaskType(input) {
    const text = `${input.content} ${(input.tags || []).join(' ')}`.toLowerCase();
    if (/复盘|总结|回顾|经验|学习|沉淀/.test(text))
        return 'reflection';
    if (/执行|落地|上线|实现|开发|操作/.test(text))
        return 'execution';
    if (input.hasExpansion || /计划|步骤|拆解|任务|roadmap|todo/.test(text))
        return 'planning';
    if (/竞品|调研|案例|市场|搜索|研究|资料/.test(text))
        return 'research';
    return 'exploration';
}
function taskTypeLabel(type) {
    const labels = {
        exploration: '探索型',
        research: '调研型',
        planning: '规划型',
        execution: '执行型',
        reflection: '复盘型',
        global: '全局',
    };
    return labels[type] || type;
}
