import Link from 'next/link';
import { fetchIdeas, fetchReviewToday } from '../lib/api';

const journeySteps = [
  { label: 'Capture', title: '先接住', desc: '一句话先放进来，不打断思路。' },
  { label: 'Expand', title: '再补清楚', desc: 'AI 补成标题、价值、问题与下一步。' },
  { label: 'Review', title: '定期唤醒', desc: '在该回看的时候把它带回来。' },
];

const landingSignals = [
  '低摩擦记录',
  '结构化展开',
  '复习唤醒',
  '可自托管',
];

const compareRows = [
  { normal: '记完就沉底，后面很难再打开', thoughtseed: '会进入 review 池，被重新带回前台' },
  { normal: '只有原始碎片，过几天看不懂', thoughtseed: '自动补成结构化结论，方便继续判断' },
  { normal: '灵感和行动脱节', thoughtseed: '天然围绕“下一步”去推进' },
];

export default async function HomePage() {
  let ideaCount = 0;
  let reviewCount = 0;
  let recentIdeas: Array<{ id: string; content: string; tags?: string[]; updatedAt?: string }> = [];

  try {
    const [ideas, review] = await Promise.all([fetchIdeas(), fetchReviewToday()]);
    ideaCount = ideas.items.length;
    reviewCount = review.items.length;
    recentIdeas = ideas.items.slice(0, 3);
  } catch {
    ideaCount = 0;
    reviewCount = 0;
    recentIdeas = [];
  }

  return (
    <main className="page-grid">
      <section className="hero hero-home">
        <div className="hero-home-grid">
          <div className="stack" style={{ gap: 20 }}>
            <div className="badges">
              <span className="badge">ThoughtSeed MVP</span>
              <span className="badge">AI 优先的灵感管理</span>
              <span className="badge">开源 / 可自托管</span>
            </div>

            <div>
              <h1 style={{ margin: '8px 0 16px', fontSize: 58, lineHeight: 1.04, letterSpacing: '-0.05em', maxWidth: 820 }}>
                让每个念头都有生长的机会
              </h1>
              <p className="meta" style={{ fontSize: 16, lineHeight: 1.85, maxWidth: 720 }}>
                灵芽不是普通笔记工具，而是一个围绕 <strong>记录 → 展开 → 复习 → 转化</strong> 设计的 AI 灵感系统。
                先把灵感接住，再把它慢慢长成真正的内容、项目与行动。
              </p>
            </div>

            <div className="actions">
              <Link className="button primary" href="/capture">开始记录</Link>
              <Link className="button" href="/ideas">查看灵感库</Link>
              <Link className="button" href="/review">进入今日复习</Link>
            </div>

            <div className="home-journey-strip">
              {journeySteps.map((step, index) => (
                <div key={step.label} className="journey-chip">
                  <div className="journey-chip-top">
                    <span className="journey-chip-index">0{index + 1}</span>
                    <span className="journey-chip-label">{step.label}</span>
                  </div>
                  <strong>{step.title}</strong>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mini-stats">
              <div className="mini-stat">
                <div className="meta">已沉淀灵感</div>
                <strong>{ideaCount}</strong>
              </div>
              <div className="mini-stat">
                <div className="meta">今日复习池</div>
                <strong>{reviewCount}</strong>
              </div>
              <div className="mini-stat">
                <div className="meta">主链路</div>
                <strong>记录 → 展开 → 复习</strong>
              </div>
            </div>
          </div>

          <div className="hero-product-mock">
            <div className="hero-floating-seeds" aria-hidden="true">
              {landingSignals.map((item) => (
                <span key={item} className="floating-seed">{item}</span>
              ))}
            </div>
            <div className="mock-window">
              <div className="mock-window-topbar">
                <div className="mock-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="mock-window-title">灵芽工作台 · Product Preview</div>
              </div>

              <div className="mock-grid">
                <section className="mock-card capture-card">
                  <div className="mock-card-meta">Capture</div>
                  <div className="mock-card-kicker">原始灵感输入</div>
                  <div className="mock-input-shell">
                    <div className="mock-input-label">灵感内容</div>
                    <div className="mock-input-value">做一个帮助用户复习灵感的工具</div>
                  </div>
                  <div className="badges">
                    <span className="badge">#产品</span>
                    <span className="badge">#AI</span>
                  </div>
                  <div className="mock-input-hint">低摩擦记录 · 先收住这个念头</div>
                </section>

                <section className="mock-card ai-card emphasis-card">
                  <div className="mock-card-meta">AI Expand</div>
                  <div className="mock-card-kicker">结构化展开</div>
                  <div className="mock-ai-row"><strong>标题</strong><span>灵感复习系统</span></div>
                  <div className="mock-ai-row"><strong>摘要</strong><span>让旧想法重新回到眼前</span></div>
                  <div className="mock-ai-row"><strong>下一步</strong><span>先做最小 MVP 闭环</span></div>
                </section>

                <section className="mock-card review-card">
                  <div className="mock-card-meta">Review</div>
                  <div className="mock-card-kicker">复习唤醒</div>
                  <div className="mock-review-pill">今日值得再看一眼</div>
                  <h3>灵感复习系统</h3>
                  <p>不是收藏，而是重新判断：继续发展、稍后再看，还是直接放下。</p>
                  <div className="mock-review-actions">
                    <span>继续发展</span>
                    <span>稍后再看</span>
                    <span>忽略</span>
                  </div>
                </section>

                <section className="mock-card convert-card">
                  <div className="mock-card-meta">Convert</div>
                  <div className="mock-card-kicker">转化方向（下一阶段）</div>
                  <div className="mock-convert-list">
                    <div>→ 一篇文章草稿</div>
                    <div>→ 一个产品方向</div>
                    <div>→ 一条下一步行动</div>
                  </div>
                  <div className="mock-footer-note">从念头到可执行资产</div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <article className="card feature-card feature-card-capture">
          <div className="meta">快速记录</div>
          <h2 className="section-title">先收住，不打断思路</h2>
          <p className="meta">用最低摩擦把灵感写下来，不要求一开始就完整、清楚或结构化。</p>
        </article>
        <article className="card feature-card feature-card-expand">
          <div className="meta">AI 展开</div>
          <h2 className="section-title">把半成品变清楚</h2>
          <p className="meta">基于原始内容与标签，把零碎念头补成标题、摘要、问题、价值与下一步。</p>
        </article>
        <article className="card feature-card feature-card-review">
          <div className="meta">复习唤醒</div>
          <h2 className="section-title">不让灵感沉底</h2>
          <p className="meta">定期把值得继续发展的内容重新带回眼前，让灵感真正流向行动。</p>
        </article>
      </section>

      <section className="grid-2 home-compare-grid">
        <article className="card compare-card">
          <div className="meta">为什么不是普通笔记工具</div>
          <h2 className="section-title" style={{ marginTop: 6 }}>普通记录 vs 灵芽</h2>
          <div className="compare-table">
            <div className="compare-head">普通笔记</div>
            <div className="compare-head highlight">灵芽 ThoughtSeed</div>
            {compareRows.map((row, index) => (
              <>
                <div key={`n-${index}`} className="compare-cell">{row.normal}</div>
                <div key={`t-${index}`} className="compare-cell highlight">{row.thoughtseed}</div>
              </>
            ))}
          </div>
        </article>

        <article className="card home-cta-card">
          <div className="meta">产品使用节奏</div>
          <h2 className="section-title" style={{ marginTop: 6 }}>今天就能从一句话开始</h2>
          <div className="home-cta-steps">
            <div className="home-cta-step"><span>01</span><div>先用 Capture 写下一句正在冒出来的念头</div></div>
            <div className="home-cta-step"><span>02</span><div>进入 Detail 看 AI 给出的结构化结果</div></div>
            <div className="home-cta-step"><span>03</span><div>在 Review 里决定它是否值得继续推进</div></div>
          </div>
          <div className="actions" style={{ marginTop: 18 }}>
            <Link className="button primary" href="/capture">立即记录一个念头</Link>
            <Link className="button" href="/review">先看今日复习</Link>
          </div>
        </article>
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="title-row" style={{ marginBottom: 12 }}>
            <div>
              <div className="meta">Recent Ideas · 最近灵感</div>
              <h2 className="section-title" style={{ marginTop: 6 }}>最近写下来的念头</h2>
            </div>
            <Link className="button ghost" href="/ideas">查看全部</Link>
          </div>

          <div className="list">
            {recentIdeas.length === 0 ? (
              <div className="empty">还没有灵感，先去记录第一条。</div>
            ) : (
              recentIdeas.map((idea) => (
                <Link key={idea.id} href={`/ideas/${idea.id}`} className="card compact" style={{ display: 'block' }}>
                  <div className="title-row">
                    <strong style={{ fontSize: 16, lineHeight: 1.6 }}>{idea.content}</strong>
                  </div>
                  <div className="badges" style={{ marginTop: 12 }}>
                    {(idea.tags || []).length > 0 ? idea.tags?.map((tag) => <span key={tag} className="badge">#{tag}</span>) : <span className="meta">未设置标签</span>}
                  </div>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="card">
          <div className="meta">适合谁</div>
          <h2 className="section-title" style={{ marginTop: 6 }}>为有很多碎片化想法的人设计</h2>
          <div className="stack meta" style={{ gap: 12 }}>
            <div>• 产品经理：记录需求碎片、功能方向、用户洞察</div>
            <div>• 独立开发者：记录项目点子、MVP 想法、技术方向</div>
            <div>• 内容创作者：记录标题、选题、金句和结构灵感</div>
            <div>• 研究者/学生：记录论文问题、阅读联想和知识连接</div>
          </div>
          <div className="actions" style={{ marginTop: 18 }}>
            <Link className="button primary" href="/capture">现在就记录一个念头</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
