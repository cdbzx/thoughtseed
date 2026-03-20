# 第一版代码状态

## 已补的内容
- API 内存数据 store
- ideas 相关路由函数
- API demo 入口
- Web 首页
- Capture 页面
- Ideas 列表页
- Idea Detail 页面
- Review 页面
- mock data

## 当前性质
这一版还是“可读骨架 + 占位实现”，还不是可直接生产运行的完整应用。

## 下一步建议
1. 把 apps/web 真正初始化成 Next.js
2. 把 apps/api 接成真实 HTTP 服务（如 Express/Nest/Fastify）
3. 把内存 store 改成 Prisma + SQLite
4. 把 Web 页面从 mock data 改为真实 API 调用
5. 把 AI 展开从占位函数改为真实模型调用
