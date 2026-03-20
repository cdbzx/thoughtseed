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
  return {
    title: input.content.slice(0, 24) || '未命名灵感',
    summary: `基于内容生成的一版摘要：${input.content}`,
    problem: '用户有灵感，但记录后缺少结构化整理和持续推进手段。',
    audience: '创作者、产品经理、独立开发者',
    value: '帮助用户把碎片化想法沉淀为可继续推进的结构化条目。',
    nextSteps: '确认 MVP 范围，补齐页面交互并继续验证高频使用场景。',
  };
}

function tryParseJson(content: string): AIExpandOutput | null {
  try {
    const parsed = JSON.parse(content);
    const output = {
      title: String(parsed.title ?? '').trim(),
      summary: String(parsed.summary ?? '').trim(),
      problem: String(parsed.problem ?? '').trim(),
      audience: String(parsed.audience ?? '').trim(),
      value: String(parsed.value ?? '').trim(),
      nextSteps: String(parsed.nextSteps ?? '').trim(),
    };

    return Object.values(output).every(Boolean) ? output : null;
  } catch {
    return null;
  }
}

export async function expandIdea(input: AIExpandInput): Promise<AIExpandOutput> {
  const apiKey = process.env.AI_API_KEY?.trim();
  const baseUrl = process.env.AI_BASE_URL?.trim();
  const model = process.env.AI_MODEL?.trim();

  if (!apiKey || !baseUrl || !model || apiKey === 'your_api_key_here') {
    return fallbackExpandIdea(input);
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: '你是灵感整理助手，只返回合法 JSON。',
          },
          {
            role: 'user',
            content: `请把这条灵感整理成 JSON，字段包括 title/summary/problem/audience/value/nextSteps。灵感内容：${input.content}。标签：${input.tags?.join(', ') || '无'}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return fallbackExpandIdea(input);
    }

    return tryParseJson(content) ?? fallbackExpandIdea(input);
  } catch {
    return fallbackExpandIdea(input);
  }
}
