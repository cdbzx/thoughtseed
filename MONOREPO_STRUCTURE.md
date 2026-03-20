# 灵芽（ThoughtSeed）目录结构建议

```text
thoughtseed/
├── apps/
│   ├── web/           # Next.js 前端
│   └── api/           # API 服务
├── packages/
│   ├── ui/            # 共享 UI 组件
│   ├── ai/            # AI provider 抽象层
│   ├── db/            # Prisma / schema
│   └── shared/        # 类型和工具函数
├── docs/
│   ├── PRODUCT.md
│   ├── PRD.md
│   ├── MVP.md
│   └── TECH_ARCH.md
├── .env.example
├── package.json
└── README.md
```

## 说明
- `apps/web`：用户界面
- `apps/api`：业务 API
- `packages/ai`：封装 OpenAI compatible / Ollama
- `packages/db`：数据库 schema 与访问层
- `packages/shared`：共享类型
