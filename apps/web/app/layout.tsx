import './globals.css';
import { AppShell } from '../components/app-shell';

export const metadata = {
  title: '灵芽 ThoughtSeed',
  description: 'AI 灵感捕捉、补全与复习工具',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
