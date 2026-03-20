'use server';

import { redirect } from 'next/navigation';
import { expandIdea } from '../../../lib/api';

export async function expandIdeaAction(formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return;

  let ok = false;
  try {
    await expandIdea(id);
    ok = true;
  } catch {
    ok = false;
  }

  redirect(`/ideas/${id}?expand=${ok ? 'success' : 'error'}`);
}
