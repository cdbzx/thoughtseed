"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const idea_service_1 = require("./services/idea-service");
const tool_execution_service_1 = require("./services/tool-execution-service");
const tool_learning_service_1 = require("./services/tool-learning-service");
const task_type_service_1 = require("./services/task-type-service");
const tool_service_1 = require("./services/tool-service");
const tool_matrix_service_1 = require("./services/tool-matrix-service");
const tool_run_service_1 = require("./services/tool-run-service");
const format_1 = require("./utils/format");
const app = (0, express_1.default)();
const port = Number(process.env.API_PORT ?? 3001);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
function serializeIdea(idea) {
    return {
        ...idea,
        tags: (0, format_1.splitTags)(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
    };
}
app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'thoughtseed-api' });
});
app.post('/api/ideas', async (req, res) => {
    const { content, sourceType, tags } = req.body ?? {};
    if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'content is required' });
    }
    const idea = await (0, idea_service_1.createIdea)({
        content: content.trim(),
        sourceType,
        tags: Array.isArray(tags) ? tags : [],
    });
    return res.status(201).json(serializeIdea(idea));
});
app.get('/api/ideas', async (_req, res) => {
    const items = await (0, idea_service_1.listIdeas)();
    return res.json({
        items: items.map(serializeIdea),
    });
});
app.get('/api/ideas/:id', async (req, res) => {
    const idea = await (0, idea_service_1.getIdea)(String(req.params.id));
    if (!idea) {
        return res.status(404).json({ error: 'idea not found' });
    }
    return res.json(serializeIdea(idea));
});
app.post('/api/ideas/:id/expand', async (req, res) => {
    const result = await (0, idea_service_1.expandIdea)(String(req.params.id));
    if (!result) {
        return res.status(404).json({ error: 'idea not found' });
    }
    return res.json(result);
});
app.get('/api/review/today', async (_req, res) => {
    const items = await (0, idea_service_1.listTodayReview)();
    return res.json({ items: items.map(serializeIdea) });
});
app.get('/api/tools', async (_req, res) => {
    return res.json({ items: (0, tool_service_1.listTools)() });
});
app.get('/api/ideas/:id/tool-plan', async (req, res) => {
    const idea = await (0, idea_service_1.getIdea)(String(req.params.id));
    if (!idea) {
        return res.status(404).json({ error: 'idea not found' });
    }
    return res.json(await (0, tool_service_1.buildToolPlan)({
        ideaId: idea.id,
        content: idea.content,
        tags: (0, format_1.splitTags)(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
        hasExpansion: Boolean(idea.expansion),
    }));
});
app.get('/api/ideas/:id/tool-runs', async (req, res) => {
    const idea = await (0, idea_service_1.getIdea)(String(req.params.id));
    if (!idea) {
        return res.status(404).json({ error: 'idea not found' });
    }
    const items = await (0, tool_run_service_1.listIdeaToolRuns)(String(req.params.id));
    return res.json({ items });
});
app.post('/api/ideas/:id/tool-runs', async (req, res) => {
    const ideaId = String(req.params.id);
    const idea = await (0, idea_service_1.getIdea)(ideaId);
    if (!idea) {
        return res.status(404).json({ error: 'idea not found' });
    }
    const { toolId, toolName, taskSummary, inputSummary, resultSummary, status, usefulnessScore, learnedRule } = req.body ?? {};
    if (!toolId || !toolName || !taskSummary || !inputSummary || !resultSummary) {
        return res.status(400).json({ error: 'missing required fields' });
    }
    const taskType = (0, task_type_service_1.detectTaskType)({
        content: idea.content,
        tags: (0, format_1.splitTags)(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
        hasExpansion: Boolean(idea.expansion),
    });
    const item = await (0, tool_run_service_1.createToolRun)({
        ideaId,
        toolId: String(toolId),
        toolName: String(toolName),
        taskType,
        taskSummary: String(taskSummary),
        inputSummary: String(inputSummary),
        resultSummary: String(resultSummary),
        status: ['success', 'partial', 'failed'].includes(String(status)) ? String(status) : 'success',
        usefulnessScore: usefulnessScore == null ? null : Number(usefulnessScore),
        learnedRule: learnedRule == null ? null : String(learnedRule),
    });
    return res.status(201).json(item);
});
app.get('/api/tool-memory/learned-rules', async (_req, res) => {
    const items = await (0, tool_run_service_1.listRecentLearnedRules)();
    return res.json({ items });
});
app.get('/api/tool-memory/stats', async (_req, res) => {
    const stats = await (0, tool_run_service_1.buildToolMemoryStats)();
    return res.json(stats);
});
app.get('/api/tool-memory/preferences', async (_req, res) => {
    const items = await (0, tool_learning_service_1.listToolPreferences)();
    return res.json({ items });
});
app.get('/api/tool-memory/matrix', async (_req, res) => {
    const data = await (0, tool_matrix_service_1.buildEffectivenessMatrix)();
    return res.json(data);
});
app.get('/api/tool-memory/task-rules', async (_req, res) => {
    const items = await (0, tool_matrix_service_1.generateTaskTypeRules)();
    return res.json({ items });
});
app.post('/api/ideas/:id/tool-runs/auto-seed', async (req, res) => {
    const ideaId = String(req.params.id);
    const idea = await (0, idea_service_1.getIdea)(ideaId);
    if (!idea) {
        return res.status(404).json({ error: 'idea not found' });
    }
    const plan = await (0, tool_service_1.buildToolPlan)({
        ideaId: idea.id,
        content: idea.content,
        tags: (0, format_1.splitTags)(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
        hasExpansion: Boolean(idea.expansion),
    });
    const first = plan.recommendedTools[0];
    const taskType = (0, task_type_service_1.detectTaskType)({
        content: idea.content,
        tags: (0, format_1.splitTags)(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
        hasExpansion: Boolean(idea.expansion),
    });
    const created = await (0, tool_run_service_1.createToolRun)({
        ideaId,
        toolId: first.toolId,
        toolName: first.toolName,
        taskType,
        taskSummary: `自动生成：${first.step}`,
        inputSummary: `围绕灵感「${idea.expansion?.title || idea.content}」生成的首条建议工具记录。`,
        resultSummary: `系统建议优先使用「${first.toolName}」，原因：${first.reason}`,
        status: 'partial',
        usefulnessScore: 3,
        learnedRule: first.source === 'memory' ? '本次建议参考了历史高分经验。' : first.source === 'history' ? '本次建议优先复用了这条灵感自己的历史路径。' : '本次建议基于默认工具策略生成。',
    });
    return res.status(201).json(created);
});
app.post('/api/ideas/:id/tool-execute', async (req, res) => {
    const ideaId = String(req.params.id);
    const result = await (0, tool_execution_service_1.executeSuggestedTool)({
        ideaId,
        toolId: req.body?.toolId ? String(req.body.toolId) : undefined,
    });
    if (!result) {
        return res.status(404).json({ error: 'idea not found' });
    }
    return res.status(201).json(result);
});
app.post('/api/tool-runs/:id/feedback', async (req, res) => {
    const toolRunId = String(req.params.id);
    const feedback = String(req.body?.feedback || '');
    if (!['adopt', 'skip', 'downvote'].includes(feedback)) {
        return res.status(400).json({ error: 'invalid feedback' });
    }
    const item = await (0, tool_learning_service_1.applyToolFeedback)({
        toolRunId,
        feedback: feedback,
        note: req.body?.note ? String(req.body.note) : undefined,
    });
    if (!item) {
        return res.status(404).json({ error: 'tool run not found' });
    }
    return res.json(item);
});
app.post('/api/ideas/:id/review-action', async (req, res) => {
    const action = String(req.body?.action || '');
    if (!['develop', 'later', 'ignore'].includes(action)) {
        return res.status(400).json({ error: 'invalid action' });
    }
    const idea = await (0, idea_service_1.applyReviewAction)(String(req.params.id), action);
    if (!idea) {
        return res.status(404).json({ error: 'idea not found' });
    }
    return res.json(serializeIdea(idea));
});
app.listen(port, () => {
    console.log(`ThoughtSeed API listening on http://localhost:${port}`);
});
