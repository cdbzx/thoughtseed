"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIdeas = listIdeas;
exports.getIdea = getIdea;
exports.createIdea = createIdea;
exports.expandIdea = expandIdea;
exports.listTodayReview = listTodayReview;
const ideas = [];
function listIdeas() {
    return ideas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
function getIdea(id) {
    return ideas.find((idea) => idea.id === id) ?? null;
}
function createIdea(input) {
    const now = new Date().toISOString();
    const idea = {
        id: `idea_${Date.now()}`,
        content: input.content,
        sourceType: input.sourceType ?? 'text',
        tags: input.tags ?? [],
        favorite: false,
        status: 'new',
        createdAt: now,
        updatedAt: now,
    };
    ideas.unshift(idea);
    return idea;
}
function expandIdea(id) {
    const idea = getIdea(id);
    if (!idea)
        return null;
    idea.expansion = {
        title: idea.content.slice(0, 18) || '未命名灵感',
        summary: `围绕“${idea.content}”生成的一版结构化摘要。`,
        problem: '用户有灵感但来不及记录，且后续难以回顾和转化。',
        audience: '创作者、产品经理、独立开发者',
        value: '帮助用户把碎片想法沉淀成可执行内容。',
        nextSteps: '先确认 MVP 范围，再完善页面与交互原型。',
    };
    idea.status = 'expanded';
    idea.updatedAt = new Date().toISOString();
    return idea.expansion;
}
function listTodayReview() {
    return ideas.slice(0, 5).map((idea) => ({
        id: idea.id,
        content: idea.content,
        createdAt: idea.createdAt,
    }));
}
