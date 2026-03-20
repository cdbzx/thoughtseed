"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postIdea = postIdea;
exports.getIdeas = getIdeas;
exports.getIdeaDetail = getIdeaDetail;
exports.postExpandIdea = postExpandIdea;
exports.getTodayReview = getTodayReview;
const store_1 = require("../lib/store");
function postIdea(body) {
    if (!body.content?.trim()) {
        return { status: 400, error: 'content is required' };
    }
    return {
        status: 201,
        data: (0, store_1.createIdea)({
            content: body.content.trim(),
            sourceType: body.sourceType,
            tags: body.tags,
        }),
    };
}
function getIdeas() {
    return { status: 200, data: { items: (0, store_1.listIdeas)() } };
}
function getIdeaDetail(id) {
    const idea = (0, store_1.getIdea)(id);
    if (!idea) {
        return { status: 404, error: 'idea not found' };
    }
    return { status: 200, data: idea };
}
function postExpandIdea(id) {
    const result = (0, store_1.expandIdea)(id);
    if (!result) {
        return { status: 404, error: 'idea not found' };
    }
    return { status: 200, data: result };
}
function getTodayReview() {
    return {
        status: 200,
        data: { items: (0, store_1.listTodayReview)() },
    };
}
