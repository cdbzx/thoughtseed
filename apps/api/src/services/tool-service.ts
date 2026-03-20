import { listToolPreferences } from './tool-learning-service';
import { detectTaskType, taskTypeLabel } from './task-type-service';
import { listIdeaToolRuns, listRecentLearnedRules } from './tool-run-service';

export type ToolDefinition = {
  id: string;
  name: string;
  category: 'thinking' | 'research' | 'execution' | 'memory';
  description: string;
  whenToUse: string;
  learnHint: string;
};

export type ToolPlan = {
  summary: string;
  objective: string;
  taskType: string;
  explanation: string[];
  recommendedTools: Array<{
    toolId: string;
    toolName: string;
    reason: string;
    step: string;
    source: 'default' | 'history' | 'memory' | 'preference';
    score: number;
    evidence: {
      historyCount?: number;
      preferenceSignals?: number;
      preferenceScore?: number;
      avgUsefulness?: number | null;
      learnedRule?: string | null;
    };
  }>;
  learningLoop: string[];
};

const TOOLS: ToolDefinition[] = [
  {
    id: 'capture-context',
    name: '上下文提取器',
    category: 'thinking',
    description: '先从原始灵感里提取目标、对象、约束和缺口，避免一上来就乱做。',
    whenToUse: '适合任何还比较模糊、只有一句话的灵感。',
    learnHint: '记录哪些输入格式更容易得到清晰目标。',
  },
  {
    id: 'web-research',
    name: '外部检索',
    category: 'research',
    description: '搜索外部资料、竞品、案例和技术线索，为灵感补全现实世界信息。',
    whenToUse: '适合需要验证市场、方案或已有做法的时候。',
    learnHint: '沉淀哪些搜索词和信息源更高效。',
  },
  {
    id: 'task-planner',
    name: '任务拆解器',
    category: 'thinking',
    description: '把一个念头拆成可执行步骤、依赖和下一步行动。',
    whenToUse: '适合准备进入执行阶段时。',
    learnHint: '记录哪种拆解粒度最容易推进。',
  },
  {
    id: 'tool-runner',
    name: '工具执行器',
    category: 'execution',
    description: '真正调用工具完成查询、生成、整理或执行动作。',
    whenToUse: '当目标已经明确，不再只是讨论，而要开始做。',
    learnHint: '记录哪个工具在什么任务上效果最好。',
  },
  {
    id: 'memory-loop',
    name: '经验回写',
    category: 'memory',
    description: '把一次成功或失败的工具使用经验沉淀成可复用规则。',
    whenToUse: '每次任务结束后，用来形成“越用越会”的闭环。',
    learnHint: '记录触发条件、工具选择、结果质量和复用建议。',
  },
];

export function listTools() {
  return TOOLS;
}

function getToolName(toolId: string) {
  return TOOLS.find((tool) => tool.id === toolId)?.name || toolId;
}

export async function buildToolPlan(input: { ideaId?: string; content: string; tags?: string[]; hasExpansion?: boolean }): Promise<ToolPlan> {
  const base = input.content.trim();
  const tagsText = input.tags?.length ? `（标签：${input.tags.join(' / ')}）` : '';
  const taskType = detectTaskType(input);
  const [history, learnedRules, preferences, typePreferences] = await Promise.all([
    input.ideaId ? listIdeaToolRuns(input.ideaId) : Promise.resolve([]),
    listRecentLearnedRules(),
    listToolPreferences('global'),
    listToolPreferences(taskType),
  ]);

  const repeatedTool = history.find((item) => item.status === 'success' || item.status === 'partial');
  const memoryRule = learnedRules.find((item) => item.usefulnessScore == null || item.usefulnessScore >= 4);
  const topPreference = preferences[0];
  const topTypePreference = typePreferences.find((item) => item.taskType !== 'global');
  const historyByTool = new Map<string, { count: number; totalScore: number; scoredCount: number }>();

  for (const item of history) {
    const current = historyByTool.get(item.toolId) ?? { count: 0, totalScore: 0, scoredCount: 0 };
    current.count += 1;
    if (typeof item.usefulnessScore === 'number') {
      current.totalScore += item.usefulnessScore;
      current.scoredCount += 1;
    }
    historyByTool.set(item.toolId, current);
  }

  const recommendedTools: ToolPlan['recommendedTools'] = [
    {
      toolId: 'capture-context',
      toolName: getToolName('capture-context'),
      reason: '先把灵感里的目标、对象和未知点理清，否则后面的工具调用会偏。',
      step: '提炼任务目标、约束、期望产出。',
      source: 'default',
      score: 72,
      evidence: {},
    },
  ];

  if (repeatedTool) {
    const stats = historyByTool.get(repeatedTool.toolId);
    recommendedTools.push({
      toolId: repeatedTool.toolId,
      toolName: repeatedTool.toolName,
      reason: `这条灵感之前已经使用过「${repeatedTool.toolName}」，说明它和当前问题有连续性，适合优先复用。`,
      step: '优先沿用这条灵感已经验证过的工具路径。',
      source: 'history',
      score: 92,
      evidence: {
        historyCount: stats?.count || 1,
        avgUsefulness: stats?.scoredCount ? stats.totalScore / stats.scoredCount : null,
      },
    });
  } else {
    const toolId = input.hasExpansion ? 'task-planner' : 'web-research';
    recommendedTools.push({
      toolId,
      toolName: getToolName(toolId),
      reason: input.hasExpansion ? '已经有结构化结果，下一步更适合直接拆执行。' : '还需要补外部信息和参考，先做检索更稳。',
      step: input.hasExpansion ? '拆成执行步骤和优先级。' : '补充竞品、资料、案例或现实约束。',
      source: 'default',
      score: 76,
      evidence: {},
    });
  }

  recommendedTools.push({
    toolId: 'tool-runner',
    toolName: getToolName('tool-runner'),
    reason: '从“思考”进入“执行”，真正调用工具完成动作。',
    step: '执行搜索、生成、整理、分类或其他具体操作。',
    source: 'default',
    score: 68,
    evidence: {},
  });

  if (memoryRule?.learnedRule) {
    recommendedTools.push({
      toolId: memoryRule.toolId,
      toolName: memoryRule.toolName,
      reason: `最近沉淀的高分经验提示：${memoryRule.learnedRule}`,
      step: '参考已验证经验，避免每次从零开始选工具。',
      source: 'memory',
      score: 84,
      evidence: {
        learnedRule: memoryRule.learnedRule,
        avgUsefulness: memoryRule.usefulnessScore ?? null,
      },
    });
  }

  if (topTypePreference && topTypePreference.preference > 0) {
    recommendedTools.push({
      toolId: topTypePreference.toolId,
      toolName: topTypePreference.toolName,
      reason: `在${taskTypeLabel(taskType)}任务里，这个工具最近更常被采纳（偏好分 ${topTypePreference.preference}，信号 ${topTypePreference.signalCount} 次）。`,
      step: '优先采用在当前任务类型里被验证过的工具。',
      source: 'preference',
      score: Math.min(97, 82 + topTypePreference.preference * 2),
      evidence: {
        preferenceSignals: topTypePreference.signalCount,
        preferenceScore: topTypePreference.preference,
      },
    });
  } else if (topPreference && topPreference.preference > 0) {
    recommendedTools.push({
      toolId: topPreference.toolId,
      toolName: topPreference.toolName,
      reason: `最近用户反馈更偏好这个工具（全局偏好分 ${topPreference.preference}，信号 ${topPreference.signalCount} 次）。`,
      step: '优先采用被持续正向反馈过的工具。',
      source: 'preference',
      score: Math.min(95, 78 + topPreference.preference * 2),
      evidence: {
        preferenceSignals: topPreference.signalCount,
        preferenceScore: topPreference.preference,
      },
    });
  } else {
    recommendedTools.push({
      toolId: 'memory-loop',
      toolName: getToolName('memory-loop'),
      reason: '如果不沉淀经验，Agent 每次都会像第一次做。',
      step: '记录这次什么工具组合有效、什么无效。',
      source: 'default',
      score: 64,
      evidence: {},
    });
  }

  const deduped = new Map<string, ToolPlan['recommendedTools'][number]>();
  for (const item of recommendedTools) {
    const existing = deduped.get(item.toolId);
    if (!existing || item.score > existing.score) deduped.set(item.toolId, item);
  }

  const finalTools = Array.from(deduped.values()).sort((a, b) => b.score - a.score);
  const explanation = [
    `当前任务被识别为：${taskTypeLabel(taskType)}。`,
    repeatedTool ? `这条灵感已有历史工具记录，因此优先参考它自己的已验证路径。` : '这条灵感缺少稳定历史路径，因此更依赖默认策略与全局经验。',
    topTypePreference && topTypePreference.preference > 0
      ? `当前任务类型下，${topTypePreference.toolName} 收到了更强的正向反馈。`
      : topPreference && topPreference.preference > 0
        ? `全局偏好里，${topPreference.toolName} 当前更受偏好。`
        : '当前还没有形成足够强的偏好信号。',
    memoryRule?.learnedRule ? `最近高分经验：${memoryRule.learnedRule}` : '当前高分经验还不够多，建议继续积累。',
  ];

  return {
    summary: `围绕“${base}”这条灵感，优先让 Agent 先理解问题，再选择工具，再把结果沉淀成经验。${tagsText}`,
    objective: '让灵芽从“会整理灵感”升级到“会为了目标主动调动工具，并且逐步学会怎么更好地用工具”。',
    taskType,
    explanation,
    recommendedTools: finalTools,
    learningLoop: [
      '先记录任务目标，而不是直接盲调工具。',
      '优先复用当前灵感自己已经验证过的工具路径。',
      '参考全局高分经验规则，再决定是否切换工具组合。',
      '再结合用户显式反馈，慢慢形成长期偏好。',
      '执行后评价结果质量：快不快、准不准、是否可复用。',
      '把高质量的工具选择规则回写成经验。',
    ],
  };
}
