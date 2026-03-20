import Link from 'next/link';
import { IdeaCard } from '../../components/idea-card';
import { fetchIdeas } from '../../lib/api';

export default async function IdeasPage() {
  let items = [] as Awaited<ReturnType<typeof fetchIdeas>>['items'];
  try {
    const data = await fetchIdeas();
    items = data.items || [];
  } catch {
    items = [];
  }

  return (
    <main className="page-grid">
      <section className="hero">
        <div className="title-row">
          <div>
            <div className="meta">Ideas · 灵感库</div>
            <h1 style={{ margin: '8px 0 12px', fontSize: 40, letterSpacing: '-0.03em' }}>把所有灵感放在一个持续可回看的地方</h1>
            <p className="meta" style={{ maxWidth: 760 }}>
              这里不是简单收藏夹，而是灵感的长期容器。你可以查看最近记录的念头，进入详情页继续展开、整理、复习和推进。
            </p>
          </div>
          <Link className="button primary" href="/capture">记录一个新灵感</Link>
        </div>
      </section>

      <section className="list">
        {items.length === 0 ? (
          <div className="card empty">
            <div className="meta">灵感库还是空的</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>先记录第一条灵感，让系统开始为你积累</h2>
            <p className="meta" style={{ maxWidth: 560 }}>
              你不需要先准备完整框架，只要先写下一句最重要的念头。后续可以再进入详情页继续展开和整理。
            </p>
            <div className="actions" style={{ marginTop: 14 }}>
              <Link className="button primary" href="/capture">现在开始记录</Link>
            </div>
          </div>
        ) : (
          items.map((idea) => <IdeaCard key={idea.id} idea={idea} showExpansion />)
        )}
      </section>
    </main>
  );
}
