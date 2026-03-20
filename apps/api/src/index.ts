import cors from 'cors';
import express, { Request, Response } from 'express';
import { applyReviewAction, createIdea, expandIdea, getIdea, listIdeas, listTodayReview } from './services/idea-service';
import { executeSuggestedTool } from './services/tool-execution-service';
import { applyToolFeedback, listToolPreferences } from './services/tool-learning-service';
import { detectTaskType } from './services/task-type-service';
import { buildToolPlan, listTools } from './services/tool-service';
import { buildEffectivenessMatrix, generateTaskTypeRules } from './services/tool-matrix-service';
import { buildToolMemoryStats, createToolRun, listIdeaToolRuns, listRecentLearnedRules } from './services/tool-run-service';
import { splitTags } from './utils/format';

const app = express();
const port = Number(process.env.API_PORT ?? 3001);

type SerializableIdea = {
  id: string;
  content: string;
  sourceType: string;
  tags: string | string[];
  favorite: boolean;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  expansion?: unknown;
};

app.use(cors());
app.use(express.json());

function serializeIdea(idea: SerializableIdea) {
  return {
    ...idea,
    tags: splitTags(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
  };
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'thoughtseed-api' });
});

app.post('/api/ideas', async (req: Request, res: Response) => {
  const { content, sourceType, tags } = req.body ?? {};
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content is required' });
  }

  const idea = await createIdea({
    content: content.trim(),
    sourceType,
    tags: Array.isArray(tags) ? tags : [],
  });

  return res.status(201).json(serializeIdea(idea));
});

app.get('/api/ideas', async (_req: Request, res: Response) => {
  const items = await listIdeas();
  return res.json({
    items: items.map(serializeIdea),
  });
});

app.get('/api/ideas/:id', async (req: Request, res: Response) => {
  const idea = await getIdea(String(req.params.id));
  if (!idea) {
    return res.status(404).json({ error: 'idea not found' });
  }

  return res.json(serializeIdea(idea));
});

app.post('/api/ideas/:id/expand', async (req: Request, res: Response) => {
  const result = await expandIdea(String(req.params.id));
  if (!result) {
    return res.status(404).json({ error: 'idea not found' });
  }
  return res.json(result);
});

app.get('/api/review/today', async (_req: Request, res: Response) => {
  const items = await listTodayReview();
  return res.json({ items: items.map(serializeIdea) });
});

app.get('/api/tools', async (_req: Request, res: Response) => {
  return res.json({ items: listTools() });
});

app.get('/api/ideas/:id/tool-plan', async (req: Request, res: Response) => {
  const idea = await getIdea(String(req.params.id));
  if (!idea) {
    return res.status(404).json({ error: 'idea not found' });
  }

  return res.json(
    await buildToolPlan({
      ideaId: idea.id,
      content: idea.content,
      tags: splitTags(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
      hasExpansion: Boolean(idea.expansion),
    }),
  );
});

app.get('/api/ideas/:id/tool-runs', async (req: Request, res: Response) => {
  const idea = await getIdea(String(req.params.id));
  if (!idea) {
    return res.status(404).json({ error: 'idea not found' });
  }

  const items = await listIdeaToolRuns(String(req.params.id));
  return res.json({ items });
});

app.post('/api/ideas/:id/tool-runs', async (req: Request, res: Response) => {
  const ideaId = String(req.params.id);
  const idea = await getIdea(ideaId);
  if (!idea) {
    return res.status(404).json({ error: 'idea not found' });
  }

  const { toolId, toolName, taskSummary, inputSummary, resultSummary, status, usefulnessScore, learnedRule } = req.body ?? {};

  if (!toolId || !toolName || !taskSummary || !inputSummary || !resultSummary) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  const taskType = detectTaskType({
    content: idea.content,
    tags: splitTags(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
    hasExpansion: Boolean(idea.expansion),
  });

  const item = await createToolRun({
    ideaId,
    toolId: String(toolId),
    toolName: String(toolName),
    taskType,
    taskSummary: String(taskSummary),
    inputSummary: String(inputSummary),
    resultSummary: String(resultSummary),
    status: ['success', 'partial', 'failed'].includes(String(status)) ? (String(status) as 'success' | 'partial' | 'failed') : 'success',
    usefulnessScore: usefulnessScore == null ? null : Number(usefulnessScore),
    learnedRule: learnedRule == null ? null : String(learnedRule),
  });

  return res.status(201).json(item);
});

app.get('/api/tool-memory/learned-rules', async (_req: Request, res: Response) => {
  const items = await listRecentLearnedRules();
  return res.json({ items });
});

app.get('/api/tool-memory/stats', async (_req: Request, res: Response) => {
  const stats = await buildToolMemoryStats();
  return res.json(stats);
});

app.get('/api/tool-memory/preferences', async (_req: Request, res: Response) => {
  const items = await listToolPreferences();
  return res.json({ items });
});

app.get('/api/tool-memory/matrix', async (_req: Request, res: Response) => {
  const data = await buildEffectivenessMatrix();
  return res.json(data);
});

app.get('/api/tool-memory/task-rules', async (_req: Request, res: Response) => {
  const items = await generateTaskTypeRules();
  return res.json({ items });
});

app.post('/api/ideas/:id/tool-runs/auto-seed', async (req: Request, res: Response) => {
  const ideaId = String(req.params.id);
  const idea = await getIdea(ideaId);
  if (!idea) {
    return res.status(404).json({ error: 'idea not found' });
  }

  const plan = await buildToolPlan({
    ideaId: idea.id,
    content: idea.content,
    tags: splitTags(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
    hasExpansion: Boolean(idea.expansion),
  });

  const first = plan.recommendedTools[0];
  const taskType = detectTaskType({
    content: idea.content,
    tags: splitTags(Array.isArray(idea.tags) ? idea.tags.join(',') : idea.tags),
    hasExpansion: Boolean(idea.expansion),
  });

  const created = await createToolRun({
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

app.post('/api/ideas/:id/tool-execute', async (req: Request, res: Response) => {
  const ideaId = String(req.params.id);
  const result = await executeSuggestedTool({
    ideaId,
    toolId: req.body?.toolId ? String(req.body.toolId) : undefined,
  });

  if (!result) {
    return res.status(404).json({ error: 'idea not found' });
  }

  return res.status(201).json(result);
});

app.post('/api/tool-runs/:id/feedback', async (req: Request, res: Response) => {
  const toolRunId = String(req.params.id);
  const feedback = String(req.body?.feedback || '');
  if (!['adopt', 'skip', 'downvote'].includes(feedback)) {
    return res.status(400).json({ error: 'invalid feedback' });
  }

  const item = await applyToolFeedback({
    toolRunId,
    feedback: feedback as 'adopt' | 'skip' | 'downvote',
    note: req.body?.note ? String(req.body.note) : undefined,
  });

  if (!item) {
    return res.status(404).json({ error: 'tool run not found' });
  }

  return res.json(item);
});

app.post('/api/ideas/:id/review-action', async (req: Request, res: Response) => {
  const action = String(req.body?.action || '');
  if (!['develop', 'later', 'ignore'].includes(action)) {
    return res.status(400).json({ error: 'invalid action' });
  }

  const idea = await applyReviewAction(String(req.params.id), action as 'develop' | 'later' | 'ignore');
  if (!idea) {
    return res.status(404).json({ error: 'idea not found' });
  }

  return res.json(serializeIdea(idea));
});

app.listen(port, () => {
  console.log(`ThoughtSeed API listening on http://localhost:${port}`);
});
