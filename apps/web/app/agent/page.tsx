import Link from 'next/link';
import { fetchIdeas, fetchLearnedRules, fetchTools, fetchToolMemoryStats } from '../../lib/api';

const CATEGORY_LABELS = {
  thinking: '思考层',
  research: '研究层',
  execution: '执行层',
  memory: '学习层',
} as const;

export default async function AgentPage() {
  let tools = [] as Awaited<ReturnType<typeof fetchTools>>['items'];
  let ideas = [] as Awaited<ReturnType<typeof fetchIdeas>>['items'];
  let learnedRules = [] as Awaited<ReturnType<typeof fetchLearnedRules>>['items'];
  let memoryStats: Awaited<ReturnType<typeof fetchToolMemoryStats>> | null = null;

  try {
    const [toolsRes, ideasRes, learnedRes, statsRes] = await Promise.all([fetchTools(), fetchIdeas(), fetchLearnedRules(), fetchToolMemoryStats()]);
    tools = toolsRes.items || [];
    ideas = ideasRes.items || [];
    learnedRules = learnedRes.items || [];
    memoryStats = statsRes;
  } catch {
    tools = [];
    ideas = [];
    learnedRules = [];
    memoryStats = null;
  }

  return (
    <main className="page-grid">
      <section className="hero agent-hero">
        <div className="review-hero-grid">
          <div>
            <div className="badges">
              <span className="badge">Agent Tools MVP</span>
              <span className="badge">自由调动工具</span>
              <span className="badge">学习闭环</span>
            </div>
            <h1 style={{ margin: '10px 0 14px', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.04em', maxWidth: 820 }}>
              让灵芽不只会整理灵感，
              <br />
              还会为了目标主动挑工具
            </h1>
            <p className="meta" style={{ maxWidth: 820, lineHeight: 1.85 }}>
              这一层的目标不是增加更多按钮，而是让 Agent 逐步形成三种能力：先理解任务、再选择工具、最后把工具经验沉淀下来，变成下一次更聪明的行动路径。
            </p>
          </div>

          <aside className="review-hero-side">
            <div className="review-prompt-card">
              <div className="meta">当前可用工具原型</div>
              <div className="review-prompt-title">{tools.length} 个 Agent 工具模块</div>
              <p className="meta" style={{ marginBottom: 0 }}>
                当前先做出“会选工具 + 会给出策略 + 会回写经验”的产品骨架，后续再接真实执行能力。
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid-3">
        <article className="card compact">
          <div className="meta">总调用次数</div>
          <div className="kpi">{memoryStats?.totalRuns ?? 0}</div>
        </article>
        <article className="card compact">
          <div className="meta">经验规则数</div>
          <div className="kpi">{memoryStats?.learnedRulesCount ?? 0}</div>
        </article>
        <article className="card compact">
          <div className="meta">策略页</div>
          <div className="actions" style={{ marginTop: 14 }}>
            <Link className="button primary" href="/strategy">查看经验策略</Link>
          </div>
        </article>
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="meta">工具层设计</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>Agent 的四层工作流</h2>
          <div className="stack meta" style={{ gap: 12 }}>
            <div>• 思考层：先识别目标、对象、约束和未知点。</div>
            <div>• 研究层：查资料、看案例、补足外部世界信息。</div>
            <div>• 执行层：真正调用工具完成搜索、整理、生成或操作。</div>
            <div>• 学习层：把有效的工具组合沉淀为下次可复用经验。</div>
          </div>
        </article>

        <article className="card">
          <div className="meta">下一阶段目标</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>你现在要的不是 AI 助手，而是会成长的 Agent</h2>
          <div className="stack meta" style={{ gap: 12 }}>
            <div>• 不只回答问题，而是会自己规划怎么做。</div>
            <div>• 不只单次调用工具，而是会组合工具链路。</div>
            <div>• 不只执行一次，而是会总结“为什么这次有效”。</div>
            <div>• 不只保存内容，还保存工具使用经验。</div>
          </div>
        </article>
      </section>

      <section className="list">
        {tools.map((tool) => (
          <article key={tool.id} className="card compact review-item-card">
            <div className="review-item-header">
              <div className="review-item-index">{tool.name.slice(0, 2)}</div>
              <div>
                <div className="meta">{CATEGORY_LABELS[tool.category]}</div>
                <h2 style={{ margin: '4px 0 6px', fontSize: 22 }}>{tool.name}</h2>
                <p className="meta" style={{ marginBottom: 0 }}>{tool.description}</p>
              </div>
            </div>
            <div className="review-item-body">
              <div className="review-item-summary">
                <div className="meta">适合什么时候用</div>
                <p>{tool.whenToUse}</p>
              </div>
              <div className="review-item-reason card compact">
                <div className="meta">如何学会更好地用它</div>
                <p style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.75 }}>{tool.learnHint}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="title-row" style={{ marginBottom: 14 }}>
            <div>
              <div className="meta">从灵感进入工具策略</div>
              <h2 className="section-title" style={{ marginTop: 8 }}>拿现有灵感试一条工具路径</h2>
            </div>
          </div>
          {ideas.length === 0 ? (
            <div className="empty">还没有灵感，先去记录一条，再让 Agent 为它生成工具方案。</div>
          ) : (
            <div className="list">
              {ideas.slice(0, 4).map((idea) => (
                <Link key={idea.id} href={`/ideas/${idea.id}`} className="card compact" style={{ display: 'block' }}>
                  <div className="meta">打开详情页查看工具方案与调用记录</div>
                  <strong style={{ display: 'block', marginTop: 8, lineHeight: 1.7 }}>
                    {idea.expansion?.title || idea.content}
                  </strong>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="card">
          <div className="meta">学习记忆</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>最近沉淀下来的工具经验</h2>
          {learnedRules.length === 0 ? (
            <div className="empty">还没有学习记录。下一步会开始把每次工具调用的经验沉淀到这里。</div>
          ) : (
            <div className="list">
              {learnedRules.slice(0, 6).map((item) => (
                <div key={item.id} className="card compact">
                  <div className="meta">{item.toolName} · {new Date(item.createdAt).toLocaleDateString('zh-CN')}</div>
                  <strong style={{ display: 'block', marginTop: 8, lineHeight: 1.7 }}>{item.taskSummary}</strong>
                  <p className="meta" style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.75 }}>{item.learnedRule || '暂无经验规则'}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
