import { ToolMatrix } from '../../components/tool-matrix';
import { fetchLearnedRules, fetchTaskRules, fetchToolMatrix, fetchToolMemoryStats, fetchToolPreferences } from '../../lib/api';

export default async function StrategyPage() {
  let stats: Awaited<ReturnType<typeof fetchToolMemoryStats>> | null = null;
  let learnedRules = [] as Awaited<ReturnType<typeof fetchLearnedRules>>['items'];
  let preferences = [] as Awaited<ReturnType<typeof fetchToolPreferences>>['items'];
  let matrix = [] as Awaited<ReturnType<typeof fetchToolMatrix>>['cells'];
  let taskRules = [] as Awaited<ReturnType<typeof fetchTaskRules>>['items'];

  try {
    const [statsRes, rulesRes, prefRes, matrixRes, taskRulesRes] = await Promise.all([
      fetchToolMemoryStats(),
      fetchLearnedRules(),
      fetchToolPreferences(),
      fetchToolMatrix(),
      fetchTaskRules(),
    ]);
    stats = statsRes;
    learnedRules = rulesRes.items || [];
    preferences = prefRes.items || [];
    matrix = matrixRes.cells || [];
    taskRules = taskRulesRes.items || [];
  } catch {
    stats = null;
    learnedRules = [];
    preferences = [];
    matrix = [];
    taskRules = [];
  }

  return (
    <main className="page-grid">
      <section className="hero agent-hero">
        <div>
          <div className="badges">
            <span className="badge">Strategy Memory</span>
            <span className="badge">经验策略页</span>
            <span className="badge">可复用规则</span>
          </div>
          <h1 style={{ margin: '10px 0 14px', fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.04em', maxWidth: 820 }}>
            不只保存结果，
            <br />
            还要保存“为什么这次工具选择有效”
          </h1>
          <p className="meta" style={{ maxWidth: 820, lineHeight: 1.85 }}>
            这一页沉淀的是灵芽的策略记忆：哪些工具被频繁使用、哪些组合更稳定、哪些经验规则值得下次优先复用。
          </p>
        </div>
      </section>

      <section className="grid-3">
        <article className="card compact"><div className="meta">总调用次数</div><div className="kpi">{stats?.totalRuns ?? 0}</div></article>
        <article className="card compact"><div className="meta">已沉淀经验</div><div className="kpi">{stats?.learnedRulesCount ?? 0}</div></article>
        <article className="card compact"><div className="meta">反馈信号数</div><div className="kpi">{stats?.preferenceSignals ?? 0}</div></article>
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="meta">效果矩阵</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>任务类型 × 工具 效果矩阵</h2>
          {matrix.length === 0 ? <div className="empty">还没有足够的矩阵数据。</div> : <ToolMatrix cells={matrix} />}
        </article>

        <article className="card">
          <div className="meta">任务类型规则</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>系统自动总结的学习规则</h2>
          {taskRules.length === 0 ? (
            <div className="empty">还没有足够的任务类型学习数据。</div>
          ) : (
            <div className="list">
              {taskRules.map((item) => (
                <div key={item.taskType} className="card compact">
                  <div className="title-row">
                    <strong>{item.taskTypeLabel}</strong>
                    <span className="badge">置信度 {item.confidence}</span>
                  </div>
                  <div className="meta" style={{ marginTop: 8 }}>信号强度：{item.signalStrength}</div>
                  <div className="stack meta" style={{ gap: 8, marginTop: 10 }}>
                    {item.rules.map((rule, index) => <div key={index}>• {rule}</div>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="meta">偏好学习</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>用户反馈正在把哪些工具推高/压低</h2>
          {preferences.length === 0 ? (
            <div className="empty">还没有偏好学习信号。你在详情页点“采纳 / 跳过 / 不适用”后，这里就会开始变化。</div>
          ) : (
            <div className="list">
              {preferences.map((item) => (
                <div key={`${item.toolId}-${item.taskType}`} className="card compact">
                  <div className="title-row">
                    <strong>{item.toolName}</strong>
                    <span className="badge">偏好分 {item.preference}</span>
                  </div>
                  <div className="stack meta" style={{ gap: 6, marginTop: 10 }}>
                    <div>任务类型：{item.taskType}</div>
                    <div>反馈次数：{item.signalCount}</div>
                    <div>最近信号：{item.lastSignal || '暂无'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="card">
          <div className="meta">经验规则</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>最近值得复用的策略</h2>
          {learnedRules.length === 0 ? (
            <div className="empty">还没有经验规则。先通过详情页记录几次工具使用，系统就会开始形成策略记忆。</div>
          ) : (
            <div className="list">
              {learnedRules.map((item) => (
                <div key={item.id} className="card compact">
                  <div className="meta">{item.toolName} · 评分 {item.usefulnessScore ?? '-'} / 5</div>
                  <strong style={{ display: 'block', marginTop: 8, lineHeight: 1.7 }}>{item.taskSummary}</strong>
                  <p className="meta" style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.75 }}>{item.learnedRule}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
