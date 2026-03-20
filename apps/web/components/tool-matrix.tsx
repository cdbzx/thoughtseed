type Cell = {
  taskType: string;
  taskTypeLabel: string;
  toolId: string;
  toolName: string;
  count: number;
  successRate: number;
  adoptRate: number;
  avgScore: number | null;
  preference: number;
  signalStrength: number;
  confidence: string;
};

function confidenceColor(confidence: string) {
  if (confidence === 'high') return 'rgba(16, 185, 129, 0.14)';
  if (confidence === 'medium') return 'rgba(245, 158, 11, 0.12)';
  return 'rgba(148, 163, 184, 0.10)';
}

export function ToolMatrix({ cells }: { cells: Cell[] }) {
  return (
    <div className="list">
      {cells.map((cell) => (
        <div key={`${cell.taskType}-${cell.toolId}`} className="card compact" style={{ background: confidenceColor(cell.confidence) }}>
          <div className="title-row">
            <div>
              <div className="meta">{cell.taskTypeLabel}</div>
              <strong style={{ display: 'block', marginTop: 6 }}>{cell.toolName}</strong>
            </div>
            <span className="badge">置信度 {cell.confidence}</span>
          </div>
          <div className="stack meta" style={{ gap: 6, marginTop: 12 }}>
            <div>信号强度：{cell.signalStrength}</div>
            <div>成功率：{Math.round(cell.successRate * 100)}%</div>
            <div>采纳率：{Math.round(cell.adoptRate * 100)}%</div>
            <div>平均评分：{cell.avgScore == null ? '暂无' : cell.avgScore.toFixed(1)}</div>
            <div>偏好分：{cell.preference}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
