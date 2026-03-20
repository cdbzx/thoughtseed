export type IdeaRecord = {
  id: string;
  content: string;
  sourceType: 'text' | 'voice' | 'image' | 'link';
  tags: string[];
  favorite: boolean;
  status: 'new' | 'expanded' | 'reviewing' | 'archived';
  createdAt: string;
  updatedAt: string;
  expansion?: {
    title: string;
    summary: string;
    problem: string;
    audience: string;
    value: string;
    nextSteps: string;
  };
};

const ideas: IdeaRecord[] = [];

export function listIdeas() {
  return ideas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getIdea(id: string) {
  return ideas.find((idea) => idea.id === id) ?? null;
}

export function createIdea(input: {
  content: string;
  sourceType?: IdeaRecord['sourceType'];
  tags?: string[];
}) {
  const now = new Date().toISOString();
  const idea: IdeaRecord = {
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

export function expandIdea(id: string) {
  const idea = getIdea(id);
  if (!idea) return null;

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

export function listTodayReview() {
  return ideas.slice(0, 5).map((idea) => ({
    id: idea.id,
    content: idea.content,
    createdAt: idea.createdAt,
  }));
}
