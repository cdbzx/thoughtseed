import Link from 'next/link';
import { SubmitButton } from '../../../components/submit-button';
import { fetchIdea, fetchIdeaToolPlan, fetchIdeaToolRuns } from '../../../lib/api';
import { expandIdeaAction } from './expand-action';
import { createToolRunAction } from './tool-run-action';
import { autoSeedToolRunAction } from './tool-run-auto-action';
import { executeSuggestedToolAction } from './tool-execute-action';
import { toolFeedbackAction } from './tool-feedback-action';

const SOURCE_LABELS: Record<string, string> = {
  text: '文本',
  voice: '语音',
  image: '图片',
  link: '链接',
};

const STATUS_LABELS: Record<string, string> = {
  new: '新记录',
  expanded: '已展开',
  reviewing: '推进中',
  archived: '已归档',
};

const SOURCE_BADGE_LABELS: Record<string, string> = {
  default: '默认策略',
  history: '来自历史',
  memory: '来自经验记忆',
  preference: '来自偏好学习',
};

type Props = {
  params: { id: string };
  searchParams?: { expand?: string; toolRun?: string };
};

export default async function IdeaDetailPage({ params, searchParams }: Props) {
  let idea: Awaited<ReturnType<typeof fetchIdea>> | null = null;
  let toolPlan: Awaited<ReturnType<typeof fetchIdeaToolPlan>> | null = null;
  let toolRuns: Awaited<ReturnType<typeof fetchIdeaToolRuns>>['items'] = [];
  try {
    const [ideaRes, toolPlanRes, toolRunsRes] = await Promise.all([
      fetchIdea(params.id),
      fetchIdeaToolPlan(params.id),
      fetchIdeaToolRuns(params.id),
    ]);
    idea = ideaRes;
    toolPlan = toolPlanRes;
    toolRuns = toolRunsRes.items || [];
  } catch {
    idea = null;
    toolPlan = null;
    toolRuns = [];
  }

  if (!idea) {
    return (
      <main className="page-grid">
        <section className="card">
          <h1 style={{ marginTop: 0 }}>灵感详情</h1>
          <p className="meta">未找到这条灵感。</p>
          <Link className="button" href="/ideas">返回灵感库</Link>
        </section>
      </main>
    );
  }

  const expandStatus = searchParams?.expand;
  const toolRunStatus = searchParams?.toolRun;
  const rankedTools = toolPlan ? toolPlan.recommendedTools : [];

  return (
    <main className="page-grid">
      <section className="hero detail-hero">
        <div className="detail-hero-grid">
          <div>
            <div className="badges">
              <span className="badge">灵感工作台</span>
              <span className="badge">{STATUS_LABELS[idea.status] || idea.status}</span>
              <span className="badge">{idea.expansion ? '已形成结构化结果' : '等待展开'}</span>
            </div>
            <h1 style={{ margin: '10px 0 14px', fontSize: 42, lineHeight: 1.08, letterSpacing: '-0.04em', maxWidth: 900 }}>
              {idea.expansion?.title || '这条灵感还在等待一个更清楚的名字'}
            </h1>
            <p className="meta" style={{ maxWidth: 820, lineHeight: 1.85 }}>
              这里不是只读详情页，而是这条灵感的工作台：左边保留原始念头，右边把 AI 的理解整理成可继续判断、可继续行动的结构。
            </p>
          </div>

          <div className="detail-hero-side">
            <div className="detail-meta-card">
              <div className="meta">记录信息</div>
              <div className="stack" style={{ gap: 10, marginTop: 10 }}>
                <div><strong>创建于：</strong>{new Date(idea.createdAt).toLocaleString('zh-CN')}</div>
                <div><strong>最后更新：</strong>{new Date(idea.updatedAt).toLocaleString('zh-CN')}</div>
                <div><strong>来源：</strong>{SOURCE_LABELS[idea.sourceType] || idea.sourceType}</div>
              </div>
            </div>
            <div className="actions">
              <Link className="button" href="/ideas">返回列表</Link>
              <form action={expandIdeaAction}>
                <input type="hidden" name="id" value={idea.id} />
                <SubmitButton className="button primary" idleText={idea.expansion ? '重新展开' : '生成展开'} pendingText="处理中…" />
              </form>
            </div>
          </div>
        </div>
      </section>

      {expandStatus === 'success' ? (
        <section className="card compact notice-success">
          <div className="meta" style={{ color: 'var(--success)' }}>AI 展开已完成</div>
          <div style={{ marginTop: 6 }}>右侧结果已经刷新，你现在可以继续判断这条灵感是否值得推进。</div>
        </section>
      ) : null}

      {expandStatus === 'error' ? (
        <section className="card compact notice-error">
          <div className="meta" style={{ color: 'var(--danger)' }}>AI 展开失败</div>
          <div style={{ marginTop: 6 }}>这次展开没有成功，可以稍后再试，或先检查 API / 模型配置。</div>
        </section>
      ) : null}

      {toolRunStatus === 'success' ? (
        <section className="card compact notice-success">
          <div className="meta" style={{ color: 'var(--success)' }}>工具调用记录已保存</div>
          <div style={{ marginTop: 6 }}>这条灵感刚刚新增了一条工具使用经验，后续可以继续累积学习规则。</div>
        </section>
      ) : null}

      {toolRunStatus === 'error' ? (
        <section className="card compact notice-error">
          <div className="meta" style={{ color: 'var(--danger)' }}>工具调用记录保存失败</div>
          <div style={{ marginTop: 6 }}>请检查必填字段是否完整，再重新提交。</div>
        </section>
      ) : null}

      <section className="detail-action-grid">
        <article className="card compact action-deck action-deck-primary">
          <div className="meta">推荐动作</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>先把它补成结构化起点</h2>
          <p className="meta" style={{ marginBottom: 0 }}>
            {idea.expansion
              ? '已经有一版 AI 结果了。接下来重点不是继续解释，而是判断什么部分值得保留、推进和转化。'
              : '这条灵感还只是原始种子。先生成一版展开，再决定它要不要继续长。'}
          </p>
        </article>
        <article className="card compact action-deck">
          <div className="meta">行动方向</div>
          <div className="decision-chip-row" style={{ marginTop: 10 }}>
            <span className="decision-chip active">继续发展</span>
            <span className="decision-chip">加入复习重点</span>
            <span className="decision-chip">稍后处理</span>
          </div>
          <p className="meta" style={{ marginBottom: 0, marginTop: 12 }}>
            当前先用详情页 + Review 来承接这些动作，后续再把它们做成真正的工作流按钮。
          </p>
        </article>
        <article className="card compact action-deck">
          <div className="meta">标签与状态</div>
          <div className="badges" style={{ marginTop: 10 }}>
            {(idea.tags || []).length > 0 ? idea.tags.map((tag) => <span key={tag} className="badge">#{tag}</span>) : <span className="meta">暂无标签</span>}
          </div>
          <p className="meta" style={{ marginBottom: 0, marginTop: 12 }}>当前状态：{STATUS_LABELS[idea.status] || idea.status}</p>
        </article>
      </section>

      {toolPlan ? (
        <section className="card detail-tool-plan-card detail-tool-plan-shell">
          <div className="title-row" style={{ marginBottom: 16 }}>
            <div>
              <div className="meta">Agent 工具方案</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>如果让灵芽主动调动工具，它应该怎么做</h2>
            </div>
            <Link className="button ghost" href="/agent">查看工具实验室</Link>
          </div>

          <div className="grid-2 detail-tool-plan-overview">
            <div className="card compact detail-overview-card detail-overview-primary">
              <div className="meta">目标</div>
              <p style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.8 }}>{toolPlan.objective}</p>
            </div>
            <div className="card compact detail-overview-card">
              <div className="meta">当前策略摘要</div>
              <p style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.8 }}>{toolPlan.summary}</p>
            </div>
          </div>

          <div className="card compact" style={{ marginTop: 16 }}>
            <div className="meta">可解释推荐</div>
            <div className="badges" style={{ marginTop: 10 }}>
              <span className="badge">任务类型：{toolPlan.taskType}</span>
            </div>
            <div className="stack meta" style={{ gap: 8, marginTop: 12 }}>
              {toolPlan.explanation.map((item, index) => (
                <div key={index}>• {item}</div>
              ))}
            </div>
          </div>

          <div className="stack" style={{ gap: 12, marginTop: 16 }}>
            {rankedTools.map((item, index) => (
              <div key={`${item.toolId}-${index}`} className="card compact tool-plan-step-card tool-plan-rank-card">
                <div className="title-row">
                  <div>
                    <div className="meta">Top {index + 1} · {SOURCE_BADGE_LABELS[item.source]} · 推荐分 {item.score}</div>
                    <strong style={{ display: 'block', marginTop: 6 }}>{item.toolName}</strong>
                  </div>
                  <div className="actions">
                    <span className="badge">{item.step}</span>
                    <form action={executeSuggestedToolAction}>
                      <input type="hidden" name="id" value={idea.id} />
                      <input type="hidden" name="toolId" value={item.toolId} />
                      <SubmitButton className="button" idleText="半自动执行" pendingText="执行中…" />
                    </form>
                  </div>
                </div>
                <p style={{ marginTop: 12, marginBottom: 0, lineHeight: 1.75 }}>{item.reason}</p>
                <div className="stack meta" style={{ gap: 6, marginTop: 12 }}>
                  {item.evidence.historyCount ? <div>历史次数：{item.evidence.historyCount}</div> : null}
                  {typeof item.evidence.preferenceSignals === 'number' ? <div>偏好信号：{item.evidence.preferenceSignals}</div> : null}
                  {typeof item.evidence.preferenceScore === 'number' ? <div>偏好分：{item.evidence.preferenceScore}</div> : null}
                  {typeof item.evidence.avgUsefulness === 'number' ? <div>平均有效度：{item.evidence.avgUsefulness.toFixed(1)} / 5</div> : null}
                  {item.evidence.learnedRule ? <div>规则依据：{item.evidence.learnedRule}</div> : null}
                </div>
              </div>
            ))}
          </div>

          <div className="card compact detail-guidance-card" style={{ marginTop: 16 }}>
            <div className="meta">学习闭环</div>
            <div className="stack meta" style={{ gap: 8, marginTop: 10 }}>
              {toolPlan.learningLoop.map((item, index) => (
                <div key={index}>• {item}</div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="card detail-tool-plan-card">
        <div className="title-row" style={{ marginBottom: 16 }}>
          <div>
            <div className="meta">工具调用记录</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>这条灵感已经学会了哪些工具经验</h2>
          </div>
        </div>

        <div className="grid-2 detail-toolrun-grid">
          <div className="card compact toolrun-form-card">
            <div className="meta">新增一条工具调用</div>
            <h3 style={{ marginTop: 8, marginBottom: 14, fontSize: 22 }}>把一次工具使用沉淀下来</h3>
            <form action={createToolRunAction} className="form">
              <input type="hidden" name="id" value={idea.id} />

              <div className="field">
                <label htmlFor="toolId">工具 ID</label>
                <input id="toolId" name="toolId" className="input" placeholder="例如：web-research" />
              </div>

              <div className="field">
                <label htmlFor="toolName">工具名称</label>
                <input id="toolName" name="toolName" className="input" placeholder="例如：外部检索" />
              </div>

              <div className="field">
                <label htmlFor="taskSummary">本次任务</label>
                <input id="taskSummary" name="taskSummary" className="input" placeholder="例如：验证这个方向是否已有竞品" />
              </div>

              <div className="field">
                <label htmlFor="inputSummary">输入摘要</label>
                <textarea id="inputSummary" name="inputSummary" className="textarea toolrun-textarea" rows={4} placeholder="这次给工具的上下文、问题或检索词" />
              </div>

              <div className="field">
                <label htmlFor="resultSummary">结果摘要</label>
                <textarea id="resultSummary" name="resultSummary" className="textarea toolrun-textarea" rows={4} placeholder="这次工具产出了什么结果" />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label htmlFor="status">结果状态</label>
                  <select id="status" name="status" className="input">
                    <option value="success">success</option>
                    <option value="partial">partial</option>
                    <option value="failed">failed</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="usefulnessScore">有用度（1-5）</label>
                  <input id="usefulnessScore" name="usefulnessScore" type="number" min="1" max="5" className="input" placeholder="例如：4" />
                </div>
              </div>

              <div className="field">
                <label htmlFor="learnedRule">沉淀经验</label>
                <textarea id="learnedRule" name="learnedRule" className="textarea toolrun-textarea" rows={4} placeholder="例如：当灵感还很模糊时，先用外部检索而不是直接任务拆解" />
              </div>

              <div className="actions">
                <SubmitButton className="button primary" idleText="保存工具调用记录" pendingText="保存中…" />
              </div>
            </form>

            <form action={autoSeedToolRunAction} className="toolrun-auto-form">
              <input type="hidden" name="id" value={idea.id} />
              <SubmitButton className="button ghost" idleText="自动生成首条建议记录" pendingText="生成中…" />
            </form>
          </div>

          <div>
            {toolRuns.length === 0 ? (
              <div className="card empty">还没有真实工具调用记录。现在已经可以手动新增第一条经验了。</div>
            ) : (
              <div className="list">
                {toolRuns.map((item) => (
                  <div key={item.id} className="card compact tool-plan-step-card">
                    <div className="title-row">
                      <div>
                        <div className="meta">{item.toolName} · {new Date(item.createdAt).toLocaleString('zh-CN')}</div>
                        <strong style={{ display: 'block', marginTop: 6 }}>{item.taskSummary}</strong>
                      </div>
                      <span className="badge">{item.status}</span>
                    </div>
                    <div className="grid-2" style={{ marginTop: 12 }}>
                      <div className="card compact">
                        <div className="meta">输入</div>
                        <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.75 }}>{item.inputSummary}</p>
                      </div>
                      <div className="card compact">
                        <div className="meta">结果</div>
                        <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.75 }}>{item.resultSummary}</p>
                      </div>
                    </div>
                    <div className="meta" style={{ marginTop: 12 }}>任务类型：{item.taskType || 'exploration'}</div>
                    {item.usefulnessScore ? (
                      <div className="meta" style={{ marginTop: 8 }}>有用度评分：{item.usefulnessScore} / 5</div>
                    ) : null}
                    {item.feedback ? (
                      <div className="meta" style={{ marginTop: 8 }}>学习反馈：{item.feedback}</div>
                    ) : null}
                    <div className="actions" style={{ marginTop: 12 }}>
                      <form action={toolFeedbackAction}>
                        <input type="hidden" name="ideaId" value={idea.id} />
                        <input type="hidden" name="toolRunId" value={item.id} />
                        <input type="hidden" name="feedback" value="adopt" />
                        <SubmitButton className="button" idleText="采纳" pendingText="提交中…" />
                      </form>
                      <form action={toolFeedbackAction}>
                        <input type="hidden" name="ideaId" value={idea.id} />
                        <input type="hidden" name="toolRunId" value={item.id} />
                        <input type="hidden" name="feedback" value="skip" />
                        <SubmitButton className="button ghost" idleText="跳过" pendingText="提交中…" />
                      </form>
                      <form action={toolFeedbackAction}>
                        <input type="hidden" name="ideaId" value={idea.id} />
                        <input type="hidden" name="toolRunId" value={item.id} />
                        <input type="hidden" name="feedback" value="downvote" />
                        <SubmitButton className="button ghost" idleText="不适用" pendingText="提交中…" />
                      </form>
                    </div>
                    {item.learnedRule ? (
                      <div className="card compact detail-guidance-card" style={{ marginTop: 12 }}>
                        <div className="meta">沉淀下来的经验</div>
                        <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.75 }}>{item.learnedRule}</p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid-2 detail-workbench-grid">
        <article className="card detail-column detail-source-column">
          <div className="title-row" style={{ marginBottom: 16 }}>
            <div>
              <div className="meta">原始灵感</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>种子原貌</h2>
            </div>
            <span className="status">{STATUS_LABELS[idea.status] || idea.status}</span>
          </div>

          <div className="idea-seed-card detail-seed-card">
            <div className="meta">你最初写下来的内容</div>
            <div className="idea-seed-content">{idea.content}</div>
          </div>

          <div className="detail-facts-list">
            <div className="detail-fact-item">
              <span className="meta">来源</span>
              <strong>{SOURCE_LABELS[idea.sourceType] || idea.sourceType}</strong>
            </div>
            <div className="detail-fact-item">
              <span className="meta">记录 ID</span>
              <strong className="mono">{idea.id}</strong>
            </div>
            <div className="detail-fact-item">
              <span className="meta">更新时间</span>
              <strong>{new Date(idea.updatedAt).toLocaleString('zh-CN')}</strong>
            </div>
          </div>

          <div className="card compact detail-guidance-card">
            <div className="meta">如何看左侧</div>
            <p style={{ marginBottom: 0, lineHeight: 1.8 }}>
              左边保留的是灵感最初的样子。不要急着把原句“改对”，而是先确认：这个念头真正打动你的地方是什么，它想解决什么问题。
            </p>
          </div>
        </article>

        <article className="card detail-column detail-ai-column">
          <div className="title-row" style={{ marginBottom: 16 }}>
            <div>
              <div className="meta">AI 展开</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>结构化结论板</h2>
            </div>
            <span className="badge">可继续判断 / 可继续行动</span>
          </div>
          {idea.expansion ? (
            <div className="stack detail-ai-stack">
              <div className="card compact detail-ai-intro">
                <div className="meta">这一页的作用</div>
                <p style={{ marginBottom: 0, lineHeight: 1.8 }}>
                  不是让 AI 替你决定，而是先把这条灵感补成一个更容易继续判断、继续拆解的结构化起点。
                </p>
              </div>

              <div className="detail-structured-board">
                <div className="detail-board-main">
                  <div className="detail-board-block block-title">
                    <span className="meta">标题</span>
                    <strong>{idea.expansion.title}</strong>
                  </div>
                  <div className="detail-board-block block-summary">
                    <span className="meta">摘要</span>
                    <p>{idea.expansion.summary}</p>
                  </div>
                </div>

                <div className="detail-board-grid">
                  <div className="detail-board-block">
                    <span className="meta">问题</span>
                    <p>{idea.expansion.problem}</p>
                  </div>
                  <div className="detail-board-block">
                    <span className="meta">目标用户</span>
                    <p>{idea.expansion.audience}</p>
                  </div>
                  <div className="detail-board-block">
                    <span className="meta">价值</span>
                    <p>{idea.expansion.value}</p>
                  </div>
                  <div className="detail-board-block emphasis">
                    <span className="meta">下一步</span>
                    <p>{idea.expansion.nextSteps}</p>
                  </div>
                </div>
              </div>

              <div className="card compact detail-guidance-card">
                <div className="meta">建议下一步</div>
                <div className="stack meta" style={{ gap: 8, marginTop: 10 }}>
                  <div>• 先确认标题和摘要是否真的代表这条灵感。</div>
                  <div>• 再看“问题 / 用户 / 价值”有没有哪一块值得单独拉出去继续写。</div>
                  <div>• 最后把“下一步”变成真正会做的一件事。</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty">这条灵感还没有展开结果，点击上面的按钮生成一版结构化内容。</div>
          )}
        </article>
      </section>
    </main>
  );
}
