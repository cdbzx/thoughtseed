# ThoughtSeed 启动说明

## 当前状态
目前已生成：
- 产品文档
- PRD / MVP / 技术架构
- 多角色分工
- 第一周执行包
- 项目目录骨架

## 建议下一步
1. 安装 Node.js + pnpm / npm
2. 初始化 Next.js 到 `apps/web`
3. 初始化 API 服务到 `apps/api`
4. 安装 Prisma 并生成数据库 client
5. 接入第一个 AI provider
6. 先打通“记录 -> 列表 -> 详情 -> 展开”闭环

## 优先实现顺序
1. 数据库 schema
2. POST /api/ideas
3. GET /api/ideas
4. GET /api/ideas/:id
5. POST /api/ideas/:id/expand
6. Web 页面接通
