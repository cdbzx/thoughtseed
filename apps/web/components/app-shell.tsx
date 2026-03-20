import Link from 'next/link';
import { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>灵芽 ThoughtSeed</strong>
          <span>把灵感收进来，再交给 AI 帮你长出来。</span>
        </div>
        <nav className="nav">
          <Link href="/">首页</Link>
          <Link href="/capture">快速记录</Link>
          <Link href="/ideas">灵感库</Link>
          <Link href="/review">今日复习</Link>
          <Link href="/agent">工具实验室</Link>
          <Link href="/strategy">经验策略</Link>
        </nav>
      </header>
      {children}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">灵芽 ThoughtSeed</div>
            <p className="meta" style={{ marginTop: 10, maxWidth: 420 }}>
              一个围绕灵感生命周期设计的 AI 系统：帮助用户把一闪而过的念头，沉淀成可回顾、可展开、可执行的长期资产。
            </p>
          </div>
          <div className="footer-links">
            <Link href="/capture">开始记录</Link>
            <Link href="/ideas">查看灵感库</Link>
            <Link href="/review">进入今日复习</Link>
            <Link href="/agent">工具实验室</Link>
            <Link href="/strategy">经验策略</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
