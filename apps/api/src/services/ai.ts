export type AIExpandInput = {
  content: string;
  tags?: string[];
};

export type AIExpandOutput = {
  title: string;
  summary: string;
  problem: string;
  audience: string;
  value: string;
  nextSteps: string;
};

function fallbackExpandIdea(input: AIExpandInput): AIExpandOutput {
  const normalized = input.content.trim();
  const tagsText = input.tags?.length ? `，标签参考：${input.tags.join(' / ')}` : '';

  return {
    title: normalized.slice(0, 24) || '未命名灵感',
    summary: `围绕“${normalized}”整理的一版 MVP 摘要${tagsText}。`,
    problem: '用户有很多瞬时灵感，但缺少一个足够轻量、可持续回看的沉淀入口。',
    audience: '创作者、独立开发者、产品经理、内容工作者',
    value: '把碎片想法快速变成结构化条目，降低遗忘率，也方便后续继续推进。',
    nextSteps: '先明确最小可用场景，再拆成页面、数据结构和下一次验证动作。',
  };
}

function parseJsonObject(raw: string): AIExpandOutput | null {
  try {
    const parsed = JSON.parse(raw);
    const output = {
      title: String(parsed.title ?? '').trim(),
      summary: String(parsed.summary ?? '').trim(),
      problem: String(parsed.problem ?? '').trim(),
      audience: String(parsed.audience ?? '').trim(),
      value: String(parsed.value ?? '').trim(),
      nextSteps: String(parsed.nextSteps ?? '').trim(),
    };

    if (Object.values(output).some((value) => !value)) {
      return null;
    }

    return output;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = '你擅长将中文灵感整理成简洁、可执行、结构清晰的 JSON。必须只输出合法 JSON 对象。';

function buildPrompt(input: AIExpandInput) {
  return `你是 ThoughtSeed 的灵感整理助手。请把用户输入整理为结构化结果，并严格输出 JSON，不要包含 markdown 代码块，不要输出额外解释。\n\n字段要求：\n- title: 适合展示的短标题\n- summary: 1-2 句摘要\n- problem: 用户/场景的核心问题\n- audience: 目标用户\n- value: 这条想法的潜在价值\n- nextSteps: 下一步建议\n\n用户输入：${input.content}\n标签：${input.tags?.join(', ') || '无'}`;
}

async function requestOpenAICompatible(input: AIExpandInput): Promise<AIExpandOutput | null> {
  const apiKey = process.env.AI_API_KEY?.trim();
  const baseUrl = process.env.AI_BASE_URL?.trim();
  const model = process.env.AI_MODEL?.trim();

  if (!apiKey || !baseUrl || !model || apiKey === 'your_api_key_here') {
    return null;
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(input) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? parseJsonObject(content) : null;
}

async function requestOllama(input: AIExpandInput): Promise<AIExpandOutput | null> {
  const host = process.env.OLLAMA_HOST?.trim() || 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL?.trim();
  if (!model) return null;

  const endpoint = `${host.replace(/\/$/, '')}/api/chat`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(input) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.message?.content;
  return typeof content === 'string' ? parseJsonObject(content) : null;
}

export async function expandIdeaWithAI(input: AIExpandInput): Promise<AIExpandOutput> {
  const provider = (process.env.AI_PROVIDER?.trim() || 'openai-compatible').toLowerCase();

  try {
    const parsed = provider === 'ollama'
      ? await requestOllama(input)
      : await requestOpenAICompatible(input);

    return parsed ?? fallbackExpandIdea(input);
  } catch (error) {
    console.error('expandIdeaWithAI fallback:', error);
    return fallbackExpandIdea(input);
  }
}
