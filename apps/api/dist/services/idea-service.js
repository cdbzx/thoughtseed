"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdea = createIdea;
exports.listIdeas = listIdeas;
exports.getIdea = getIdea;
exports.expandIdea = expandIdea;
exports.listTodayReview = listTodayReview;
exports.applyReviewAction = applyReviewAction;
const prisma_1 = require("../lib/prisma");
const format_1 = require("../utils/format");
const ai_1 = require("./ai");
async function createIdea(input) {
    return prisma_1.prisma.idea.create({
        data: {
            content: input.content,
            sourceType: input.sourceType ?? 'text',
            tags: input.tags ? input.tags.join(',') : '',
        },
        include: { expansion: true },
    });
}
async function listIdeas() {
    return prisma_1.prisma.idea.findMany({
        orderBy: { createdAt: 'desc' },
        include: { expansion: true },
    });
}
async function getIdea(id) {
    return prisma_1.prisma.idea.findUnique({
        where: { id },
        include: { expansion: true },
    });
}
async function expandIdea(id) {
    const idea = await prisma_1.prisma.idea.findUnique({ where: { id } });
    if (!idea)
        return null;
    const payload = await (0, ai_1.expandIdeaWithAI)({
        content: idea.content,
        tags: (0, format_1.splitTags)(idea.tags),
    });
    await prisma_1.prisma.ideaExpansion.upsert({
        where: { ideaId: id },
        update: payload,
        create: {
            ...payload,
            ideaId: id,
        },
    });
    await prisma_1.prisma.idea.update({
        where: { id },
        data: { status: 'expanded' },
    });
    return prisma_1.prisma.ideaExpansion.findUnique({ where: { ideaId: id } });
}
async function listTodayReview() {
    return prisma_1.prisma.idea.findMany({
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
async function applyReviewAction(id, action) {
    const idea = await prisma_1.prisma.idea.findUnique({ where: { id } });
    if (!idea)
        return null;
    const nextStatus = action === 'develop' ? 'reviewing' : action === 'later' ? 'expanded' : 'archived';
    return prisma_1.prisma.idea.update({
        where: { id },
        data: { status: nextStatus },
        include: { expansion: true },
    });
}
