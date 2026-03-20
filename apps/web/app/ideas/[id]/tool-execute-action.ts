'use server';

import { redirect } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3101';

export async function executeSuggestedToolAction(formData: FormData) {
  const id = String(formData.get('id') || '');
  const toolId = String(formData.get('toolId') || '');
  if (!id) return;

  let ok = false;
  try {
    const res = await fetch(`${API_BASE}/api/ideas/${id}/tool-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId: toolId || undefined }),
    });
    ok = res.ok;
  } catch {
    ok = false;
  }

  redirect(`/ideas/${id}?toolRun=${ok ? 'success' : 'error'}`);
}
