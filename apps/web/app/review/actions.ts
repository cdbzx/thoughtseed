'use server';

import { redirect } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3101';

export async function reviewAction(formData: FormData) {
  const id = String(formData.get('id') || '');
  const action = String(formData.get('action') || '');

  if (!id || !action) return;

  let ok = false;
  try {
    const res = await fetch(`${API_BASE}/api/ideas/${id}/review-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    ok = res.ok;
  } catch {
    ok = false;
  }

  redirect(`/review?action=${action}&status=${ok ? 'success' : 'error'}`);
}
