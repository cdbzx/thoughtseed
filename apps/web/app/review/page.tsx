import Link from 'next/link';
import { SubmitButton } from '../../components/submit-button';
import { fetchReviewToday } from '../../lib/api';
import { reviewAction } from './actions';

export default async function ReviewPage({ searchParams }: { searchParams?: { action?: string; status?: string } }) {
  let items = [] as Awaited<ReturnType<typeof fetchReviewToday>>['items'];
  try {
    const data = await fetchReviewToday();
    items = data.items || [];
  } catch {
    items = [];
  }

  const status = searchParams?.status;
  const action = searchParams?.action;

  return (
    <main className="page-grid">
      <section className="hero review-hero">
        <div className="review-hero-grid">
          <div>
            <div className="badges">
              <span className="badge">今日复习</span>
              <span className="badge">唤醒旧灵感</span>
              <span className="badge">轻决策模式</span>
            </div>
            <h1 style={{ margin: '10px 0 14px', fontSize: 42, lineHeight: 1.08, letterSpacing: '-0.04em', maxWidth: 760 }}>
              今天不需要重读全部，
              <br />
              只需要做几个轻判断
            </h1>
            <p className="meta" style={{ maxWidth: 780, lineHeight: 1.85 }}>
              复习不是机械回顾旧笔记，而是在合适的时候重新判断：哪些灵感值得推进，哪些需要稍后处理，哪些可以果断放下。
            </p>
          </div>

          <aside className="review-hero-side">
            <div className="review-prompt-card">
              <div className="meta">今日复习池</div>
              <div className="review-prompt-title">{items.length} 条值得重新看一眼的灵感</div>
              <p className="meta" style={{ marginBottom: 0 }}>
                目标不是做完很多，而是把真正重要的几条重新带回前台。
              </p>
            </div>
          </aside>
        </div>
      </section>

      {status === 'success' ? (
        <section className="card compact notice-success">
          <div className="meta" style={{ color: 'var(--success)' }}>复习动作已保存</div>
          <div style={{ marginTop: 6 }}>已成功执行操作：{action === 'develop' ? '标记推进中' : action === 'later' ? '稍后再看' : '忽略'}。</div>
        </section>
      ) : null}

      {status === 'error' ? (
        <section className="card compact notice-error">
          <div className="meta" style={{ color: 'var(--danger)' }}>复习动作保存失败</div>
          <div style={{ marginTop: 6 }}>这次操作没有成功，请稍后重试。</div>
        </section>
      ) : null}

      <section className="grid-3 review-decision-grid">
        <article className="card compact review-decision-card active">
          <div className="meta">继续发展</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>值得现在继续拆</h2>
          <p className="meta" style={{ marginBottom: 0 }}>适合那些已经有明确方向，值得马上继续细化和推进的灵感。</p>
        </article>
        <article className="card compact review-decision-card">
          <div className="meta">稍后再看</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>先保留，不急着处理</h2>
          <p className="meta" style={{ marginBottom: 0 }}>适合暂时不处理，但你明确不想让它沉底消失的念头。</p>
        </article>
        <article className="card compact review-decision-card">
          <div className="meta">忽略</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>主动清理注意力</h2>
          <p className="meta" style={{ marginBottom: 0 }}>适合已经不值得继续投入注意力的内容，帮你保持复习池轻量。</p>
        </article>
      </section>

      <section className="list review-list">
        {items.length === 0 ? (
          <div className="card empty">今天还没有可复习内容，先去记录或展开几条灵感。</div>
        ) : (
          items.map((idea, index) => (
            <article key={idea.id} className="card compact review-item-card">
              <div className="review-item-header">
                <div className="review-item-index">#{String(index + 1).padStart(2, '0')}</div>
                <div>
                  <div className="meta">今天为什么看到它</div>
                  <h2 style={{ margin: '4px 0 6px', fontSize: 22, lineHeight: 1.35 }}>
                    {idea.expansion?.title || idea.content}
                  </h2>
                  <div className="badges">
                    <span className="badge">最近更新：{new Date(idea.updatedAt).toLocaleDateString('zh-CN')}</span>
                    <span className="badge">{idea.status === 'reviewing' ? '推进中' : idea.expansion ? '可继续发展' : '建议先展开'}</span>
                    {(idea.tags || []).slice(0, 3).map((tag) => <span key={tag} className="badge">#{tag}</span>)}
                  </div>
                </div>
              </div>

              <div className="review-item-body">
                <div className="review-item-summary">
                  <div className="meta">当前摘要</div>
                  <p>{idea.expansion?.summary || idea.content}</p>
                </div>
                <div className="review-item-reason card compact">
                  <div className="meta">建议判断方式</div>
                  <div className="stack meta" style={{ gap: 8, marginTop: 10 }}>
                    <div>• 如果它已经有清晰下一步，就继续发展。</div>
                    <div>• 如果它还重要但不在今天处理，就稍后再看。</div>
                    <div>• 如果它已经不再打动你，就直接忽略。</div>
                  </div>
                </div>
              </div>

              <div className="review-action-bar">
                <Link className="button primary" href={`/ideas/${idea.id}`}>继续发展</Link>
                <form action={reviewAction}>
                  <input type="hidden" name="id" value={idea.id} />
                  <input type="hidden" name="action" value="develop" />
                  <SubmitButton className="button" idleText="标记推进中" pendingText="提交中…" />
                </form>
                <form action={reviewAction}>
                  <input type="hidden" name="id" value={idea.id} />
                  <input type="hidden" name="action" value="later" />
                  <SubmitButton className="button" idleText="稍后再看" pendingText="提交中…" />
                </form>
                <form action={reviewAction}>
                  <input type="hidden" name="id" value={idea.id} />
                  <input type="hidden" name="action" value="ignore" />
                  <SubmitButton className="button ghost" idleText="忽略" pendingText="提交中…" />
                </form>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
