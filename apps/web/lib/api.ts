export type IdeaExpansion = {
  title: string;
  summary: string;
  problem: string;
  audience: string;
  value: string;
  nextSteps: string;
};

export type IdeaItem = {
  id: string;
  content: string;
  sourceType: 'text' | 'voice' | 'image' | 'link';
  tags: string[];
  favorite: boolean;
  status: 'new' | 'expanded' | 'reviewing' | 'archived';
  createdAt: string;
  updatedAt: string;
  expansion?: IdeaExpansion | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3101';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export async function fetchIdeas(): Promise<{ items: IdeaItem[] }> {
  return apiFetch('/api/ideas');
}

export async function fetchIdea(id: string): Promise<IdeaItem> {
  return apiFetch(`/api/ideas/${id}`);
}

export async function fetchReviewToday(): Promise<{ items: IdeaItem[] }> {
  return apiFetch('/api/review/today');
}

export type ToolItem = {
  id: string;
  name: string;
  category: 'thinking' | 'research' | 'execution' | 'memory';
  description: string;
  whenToUse: string;
  learnHint: string;
};

export type IdeaToolPlan = {
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

export type ToolRunItem = {
  id: string;
  ideaId: string;
  toolId: string;
  toolName: string;
  taskType?: string;
  taskSummary: string;
  inputSummary: string;
  resultSummary: string;
  status: 'success' | 'partial' | 'failed' | string;
  usefulnessScore?: number | null;
  learnedRule?: string | null;
  feedback?: 'adopt' | 'skip' | 'downvote' | string | null;
  feedbackNote?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function createIdea(input: { content: string; tags: string[]; sourceType?: string }) {
  return apiFetch<IdeaItem>('/api/ideas', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function expandIdea(id: string) {
  return apiFetch<IdeaExpansion>(`/api/ideas/${id}/expand`, {
    method: 'POST',
  });
}

export async function fetchTools(): Promise<{ items: ToolItem[] }> {
  return apiFetch('/api/tools');
}

export async function fetchIdeaToolPlan(id: string): Promise<IdeaToolPlan> {
  return apiFetch(`/api/ideas/${id}/tool-plan`);
}

export async function fetchIdeaToolRuns(id: string): Promise<{ items: ToolRunItem[] }> {
  return apiFetch(`/api/ideas/${id}/tool-runs`);
}

export async function fetchLearnedRules(): Promise<{ items: Array<Pick<ToolRunItem, 'id' | 'ideaId' | 'toolId' | 'toolName' | 'taskSummary' | 'learnedRule' | 'usefulnessScore' | 'createdAt'>> }> {
  return apiFetch('/api/tool-memory/learned-rules');
}

export async function fetchToolMemoryStats(): Promise<{ totalRuns: number; learnedRulesCount: number; preferenceSignals: number; preferences: Array<{ toolId: string; toolName: string; preference: number; lastSignal: string | null; signalCount: number; updatedAt: string; createdAt: string }>; tools: Array<{ toolId: string; toolName: string; count: number; successRate: number; avgScore: number | null }> }> {
  return apiFetch('/api/tool-memory/stats');
}

export async function fetchToolPreferences(): Promise<{ items: Array<{ toolId: string; toolName: string; taskType: string; preference: number; lastSignal: string | null; signalCount: number; updatedAt: string; createdAt: string }> }> {
  return apiFetch('/api/tool-memory/preferences');
}

export async function fetchToolMatrix(): Promise<{ taskTypes: string[]; tools: string[]; cells: Array<{ taskType: string; taskTypeLabel: string; toolId: string; toolName: string; count: number; successRate: number; adoptRate: number; avgScore: number | null; preference: number; signalStrength: number; confidence: 'low' | 'medium' | 'high' | string }> }> {
  return apiFetch('/api/tool-memory/matrix');
}

export async function fetchTaskRules(): Promise<{ items: Array<{ taskType: string; taskTypeLabel: string; confidence: string; signalStrength: number; rules: string[] }> }> {
  return apiFetch('/api/tool-memory/task-rules');
}
