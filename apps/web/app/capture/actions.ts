'use server';

import { redirect } from 'next/navigation';
import { createIdea } from '../../lib/api';

export async function createIdeaAction(formData: FormData) {
  const content = String(formData.get('content') || '').trim();
  const tagsRaw = String(formData.get('tags') || '').trim();
  const tags = tagsRaw
    ? tagsRaw
        .split(/[，,]/)
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

  if (!content) {
    redirect('/capture?error=empty');
  }

  const idea = await createIdea({ content, sourceType: 'text', tags });
  redirect(`/ideas/${idea.id}`);
}
