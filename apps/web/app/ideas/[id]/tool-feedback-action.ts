'use server';

import { redirect } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3101';

export async function toolFeedbackAction(formData: FormData) {
  const ideaId = String(formData.get('ideaId') || '');
  const toolRunId = String(formData.get('toolRunId') || '');
  const feedback = String(formData.get('feedback') || '');
  if (!ideaId || !toolRunId || !feedback) return;

  let ok = false;
  try {
    const res = await fetch(`${API_BASE}/api/tool-runs/${toolRunId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    });
    ok = res.ok;
  } catch {
    ok = false;
  }

  redirect(`/ideas/${ideaId}?toolRun=${ok ? 'success' : 'error'}`);
}
