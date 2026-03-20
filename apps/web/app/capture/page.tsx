import Link from 'next/link';
import { createIdeaAction } from './actions';
import { CaptureSubmitButton } from './submit-button';

const quickSeeds = [
  '给独立开发者做一个“灵感自动回访”工具',
  '把碎片想法整理成可执行卡片，而不是收藏夹',
  '语音记下念头后，自动提取标题 / 价值 / 下一步',
];

const captureModes = [
  { label: '文本输入', desc: '当前已可用，适合随手留下一句话。', active: true },
  { label: '语音速记', desc: '后续支持，把想到的话直接说出来。', active: false },
  { label: '图片摘录', desc: '后续支持，从截图或照片里接住灵感。', active: false },
  { label: '链接收藏', desc: '后续支持，把文章或网页变成待展开线索。', active: false },
];

export default function CapturePage({ searchParams }: { searchParams?: { error?: string } }) {
  const showError = searchParams?.error === 'empty';

  return (
    <main className="page-grid">
      <section className="hero hero-capture">
        <div className="capture-hero-grid">
          <div className="stack" style={{ gap: 18 }}>
            <div className="badges">
              <span className="badge">Capture 工作台</span>
              <span className="badge">低摩擦输入</span>
              <span className="badge">一句话也可以开始</span>
            </div>
            <div>
              <h1 style={{ margin: '8px 0 14px', fontSize: 46, lineHeight: 1.06, letterSpacing: '-0.045em', maxWidth: 760 }}>
                先把念头放进来，
                <br />
                再决定它要长成什么
              </h1>
              <p className="meta" style={{ lineHeight: 1.85, maxWidth: 760, fontSize: 16 }}>
                这里不是传统表单页，而是灵感入口。你只需要留下此刻最重要的一句话，系统会先为它建立真实记录；后面再交给 AI 去展开、整理和唤醒。
              </p>
            </div>

            <div className="capture-hero-points">
              <div className="capture-point">
                <strong>低摩擦</strong>
                <span>不用一开始就想清楚，先收住再说。</span>
              </div>
              <div className="capture-point">
                <strong>有后续</strong>
                <span>保存后会直达详情页，立刻可以继续展开。</span>
              </div>
              <div className="capture-point">
                <strong>可成长</strong>
                <span>一条碎片念头，也能长成结构化方向。</span>
              </div>
            </div>
          </div>

          <aside className="capture-side-preview">
            <div className="capture-preview-card">
              <div className="capture-preview-top">
                <span className="badge">工作流预览</span>
                <span className="meta">记录 → 展开 → 复习</span>
              </div>
              <div className="capture-preview-flow">
                <div className="capture-preview-step active">
                  <div className="meta">Step 01</div>
                  <strong>写下一句话</strong>
                  <p>比如：“做一个把旧灵感重新带回眼前的工具”。</p>
                </div>
                <div className="capture-preview-step">
                  <div className="meta">Step 02</div>
                  <strong>AI 补成结构</strong>
                  <p>自动补出标题、价值、适用用户和下一步建议。</p>
                </div>
                <div className="capture-preview-step">
                  <div className="meta">Step 03</div>
                  <strong>等待被唤醒</strong>
                  <p>在真正值得回看的时候，再把它带回来。</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid-2 capture-workbench-grid">
        <div className="card capture-form-card">
          <div className="title-row" style={{ marginBottom: 18 }}>
            <div>
              <div className="meta">新建灵感</div>
              <h2 className="section-title" style={{ marginTop: 8 }}>输入原始灵感</h2>
            </div>
            <span className="status">文本录入 MVP</span>
          </div>

          {showError ? (
            <div className="card compact capture-feedback capture-feedback-error">
              <div className="meta" style={{ color: 'var(--danger)' }}>内容不能为空</div>
              <div style={{ marginTop: 6 }}>先写下一句灵感，再继续保存。</div>
            </div>
          ) : null}

          <form action={createIdeaAction} className="form">
            <div className="field">
              <label htmlFor="content">灵感内容</label>
              <textarea
                id="content"
                name="content"
                placeholder="比如：做一个把零碎灵感自动整理成可执行卡片的工具"
                className="textarea capture-textarea"
                rows={11}
                required
                minLength={2}
              />
              <p className="meta" style={{ margin: 0 }}>只写一句也可以。重点是别让它从脑子里滑走。</p>
            </div>

            <div className="field">
              <label htmlFor="tags">标签</label>
              <input id="tags" name="tags" placeholder="产品，AI，效率" className="input" />
              <div className="tag-suggestion-row">
                {['产品', 'AI', '内容', '创业', '工作流'].map((tag) => (
                  <span key={tag} className="badge">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="capture-action-bar">
              <div className="capture-action-copy meta">
                保存后会直接跳到详情页，你可以立刻让 AI 帮你展开这条灵感。
              </div>
              <div className="actions">
                <CaptureSubmitButton />
                <Link className="button ghost" href="/ideas">去灵感库</Link>
              </div>
            </div>
          </form>
        </div>

        <aside className="stack">
          <div className="card">
            <div className="meta">推荐写法</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>这些都可以直接记</h2>
            <div className="stack" style={{ gap: 10 }}>
              {quickSeeds.map((seed) => (
                <div key={seed} className="idea-seed-card">
                  <div className="meta">一句话灵感</div>
                  <div className="idea-seed-content">“{seed}”</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="meta">输入模式</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>后续会继续长出来的入口</h2>
            <div className="stack" style={{ gap: 10 }}>
              {captureModes.map((mode) => (
                <div key={mode.label} className={`capture-mode-card${mode.active ? ' active' : ''}`}>
                  <div className="title-row" style={{ marginBottom: 8 }}>
                    <strong>{mode.label}</strong>
                    <span className={mode.active ? 'status' : 'badge'}>{mode.active ? '当前可用' : '规划中'}</span>
                  </div>
                  <div className="meta">{mode.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card compact" style={{ background: 'var(--primary-soft)' }}>
            <div className="meta">记录建议</div>
            <div className="stack meta" style={{ gap: 10, marginTop: 10 }}>
              <div>• 先记下核心句子，不用一开始就补背景和上下文。</div>
              <div>• 标签尽量短，方便后续筛选、聚类与复盘。</div>
              <div>• 先记录，再决定是否让 AI 帮你展开。</div>
              <div>• 真正重要的不是“写得完整”，而是“别丢”。</div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
