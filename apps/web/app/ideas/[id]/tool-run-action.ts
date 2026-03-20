'use server';

import { redirect } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3101';

export async function createToolRunAction(formData: FormData) {
  const id = String(formData.get('id') || '');
  const toolId = String(formData.get('toolId') || '').trim();
  const toolName = String(formData.get('toolName') || '').trim();
  const taskSummary = String(formData.get('taskSummary') || '').trim();
  const inputSummary = String(formData.get('inputSummary') || '').trim();
  const resultSummary = String(formData.get('resultSummary') || '').trim();
  const status = String(formData.get('status') || 'success').trim();
  const usefulnessScoreRaw = String(formData.get('usefulnessScore') || '').trim();
  const learnedRule = String(formData.get('learnedRule') || '').trim();

  if (!id || !toolId || !toolName || !taskSummary || !inputSummary || !resultSummary) {
    redirect(`/ideas/${id}?toolRun=error`);
  }

  let ok = false;
  try {
    const res = await fetch(`${API_BASE}/api/ideas/${id}/tool-runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId,
        toolName,
        taskSummary,
        inputSummary,
        resultSummary,
        status,
        usefulnessScore: usefulnessScoreRaw ? Number(usefulnessScoreRaw) : null,
        learnedRule: learnedRule || null,
      }),
    });
    ok = res.ok;
  } catch {
    ok = false;
  }

  redirect(`/ideas/${id}?toolRun=${ok ? 'success' : 'error'}`);
}
