import { createIdea, expandIdea, getIdea, listIdeas, listTodayReview } from '../lib/store';

export function postIdea(body: { content?: string; sourceType?: 'text' | 'voice' | 'image' | 'link'; tags?: string[] }) {
  if (!body.content?.trim()) {
    return { status: 400, error: 'content is required' };
  }

  return {
    status: 201,
    data: createIdea({
      content: body.content.trim(),
      sourceType: body.sourceType,
      tags: body.tags,
    }),
  };
}

export function getIdeas() {
  return { status: 200, data: { items: listIdeas() } };
}

export function getIdeaDetail(id: string) {
  const idea = getIdea(id);
  if (!idea) {
    return { status: 404, error: 'idea not found' };
  }

  return { status: 200, data: idea };
}

export function postExpandIdea(id: string) {
  const result = expandIdea(id);
  if (!result) {
    return { status: 404, error: 'idea not found' };
  }

  return { status: 200, data: result };
}

export function getTodayReview() {
  return {
    status: 200,
    data: { items: listTodayReview() },
  };
}
