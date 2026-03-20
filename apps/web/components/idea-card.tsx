import Link from 'next/link';
import { IdeaItem } from '../lib/api';

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

export function IdeaCard({ idea, showExpansion = false }: { idea: IdeaItem; showExpansion?: boolean }) {
  return (
    <article className="card compact">
      <div className="title-row">
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>{idea.expansion?.title || idea.content}</h3>
          <p className="meta" style={{ marginBottom: 0 }}>
            {new Date(idea.createdAt).toLocaleString('zh-CN')} · {SOURCE_LABELS[idea.sourceType] || idea.sourceType} · {STATUS_LABELS[idea.status] || idea.status}
          </p>
        </div>
        <span className="status">{idea.expansion ? '已展开' : '待展开'}</span>
      </div>

      <p style={{ marginTop: 14, marginBottom: 14 }}>{idea.content}</p>

      <div className="badges" style={{ marginBottom: 14 }}>
        {(idea.tags || []).length > 0 ? (idea.tags || []).map((tag) => <span key={tag} className="badge">#{tag}</span>) : <span className="meta">暂无标签</span>}
      </div>

      {showExpansion && idea.expansion ? (
        <div className="stack" style={{ marginBottom: 14 }}>
          <div className="card compact" style={{ background: 'var(--panel-muted)' }}>
            <strong>摘要</strong>
            <div className="meta" style={{ marginTop: 6 }}>{idea.expansion.summary}</div>
          </div>
          <div className="card compact" style={{ background: 'var(--panel-muted)' }}>
            <strong>下一步</strong>
            <div className="meta" style={{ marginTop: 6 }}>{idea.expansion.nextSteps}</div>
          </div>
        </div>
      ) : null}

      <div className="actions">
        <Link className="button" href={`/ideas/${idea.id}`}>查看详情</Link>
      </div>
    </article>
  );
}
