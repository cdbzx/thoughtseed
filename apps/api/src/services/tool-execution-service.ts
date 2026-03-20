import { getIdea } from './idea-service';
import { detectTaskType } from './task-type-service';
import { buildToolPlan } from './tool-service';
import { createToolRun } from './tool-run-service';

function short(text: string, max = 120) {
  const value = text.trim();
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export async function executeSuggestedTool(input: { ideaId: string; toolId?: string }) {
  const idea = await getIdea(input.ideaId);
  if (!idea) return null;

  const tags = idea.tags ? String(idea.tags).split(',').map((v) => v.trim()).filter(Boolean) : [];
  const taskType = detectTaskType({
    content: idea.content,
    tags,
    hasExpansion: Boolean(idea.expansion),
  });

  const plan = await buildToolPlan({
    ideaId: idea.id,
    content: idea.content,
    tags,
    hasExpansion: Boolean(idea.expansion),
  });

  const target = input.toolId
    ? plan.recommendedTools.find((item) => item.toolId === input.toolId) || plan.recommendedTools[0]
    : plan.recommendedTools[0];

  const title = idea.expansion?.title || short(idea.content, 24);

  const resultByTool: Record<string, { inputSummary: string; resultSummary: string; learnedRule: string; usefulnessScore: number }> = {
    'capture-context': {
      inputSummary: `围绕「${title}」提取任务目标、对象、约束与待验证点。`,
      resultSummary: `系统已先把这条灵感收敛为一个更清楚的问题框架，便于后续检索或拆解。`,
      learnedRule: '当灵感还停留在一句话时，先做上下文提取，比直接进入执行更稳。',
      usefulnessScore: 4,
    },
    'web-research': {
      inputSummary: `围绕「${title}」检索竞品、案例、已有方案与现实约束。`,
      resultSummary: `系统建议先补足外部信息，再决定是否继续投入执行。`,
      learnedRule: '当问题涉及市场、案例或已有做法时，先检索通常比直接拆任务更有效。',
      usefulnessScore: 4,
    },
    'task-planner': {
      inputSummary: `围绕「${title}」把现有想法拆成步骤、优先级和下一步。`,
      resultSummary: `系统已将这条灵感推进到“可行动”的粒度，更适合进入执行。`,
      learnedRule: '当灵感已经有结构化结果时，优先任务拆解，比重复解释价值更推进。',
      usefulnessScore: 5,
    },
    'tool-runner': {
      inputSummary: `围绕「${title}」进入实际工具执行阶段。`,
      resultSummary: `系统建议把思考结果转成一次具体工具动作，而不是停留在讨论层。`,
      learnedRule: '当目标和步骤都已明确时，应尽快进入一次真实执行，避免过度规划。',
      usefulnessScore: 4,
    },
    'memory-loop': {
      inputSummary: `回看「${title}」最近一次工具使用，提取可复用经验。`,
      resultSummary: `系统把这次工具选择沉淀成了可复用规则，用于下次推荐。`,
      learnedRule: '每次完成动作后都回写经验，能显著提升后续推荐质量。',
      usefulnessScore: 5,
    },
  };

  const fallback = {
    inputSummary: `围绕「${title}」执行建议工具。`,
    resultSummary: `系统完成了一次半自动工具执行记录。`,
    learnedRule: '先做一次轻量执行，再根据结果决定是否继续深入。',
    usefulnessScore: 3,
  };

  const picked = resultByTool[target.toolId] || fallback;

  const created = await createToolRun({
    ideaId: idea.id,
    toolId: target.toolId,
    toolName: target.toolName,
    taskType,
    taskSummary: `半自动执行：${target.step}`,
    inputSummary: picked.inputSummary,
    resultSummary: `${picked.resultSummary}（推荐来源：${target.source}）`,
    status: 'success',
    usefulnessScore: picked.usefulnessScore,
    learnedRule: picked.learnedRule,
  });

  return { created, plan };
}
