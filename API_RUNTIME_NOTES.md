# API Runtime Notes

## 当前状态
API 已从“内存函数演示”推进到“Express + Prisma 骨架”。

## 已具备
- Express HTTP 服务入口
- /health
- POST /api/ideas
- GET /api/ideas
- GET /api/ideas/:id
- POST /api/ideas/:id/expand
- GET /api/review/today
- Prisma schema
- SQLite 数据源配置

## 还缺
- 安装依赖
- prisma generate
- prisma migrate dev
- 真正运行服务并联调
- Web 侧改成真实请求 API

## 建议下一步
1. 安装 workspace 依赖
2. 生成 Prisma client
3. 创建首个 migration
4. 启动 API
5. 用 curl 或前端联调接口
