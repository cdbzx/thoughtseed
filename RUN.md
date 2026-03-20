# ThoughtSeed 本地运行说明

## 1. 安装依赖
在 `/opt/thoughtseed` 目录执行：

```bash
npm install
```

## 2. 配置环境变量
```bash
cp .env.example .env
```

## 3. 生成 Prisma Client
```bash
npx prisma generate --schema packages/db/prisma/schema.prisma
```

## 4. 创建数据库迁移
```bash
npx prisma migrate dev --schema packages/db/prisma/schema.prisma --name init
```

## 5. 启动 API
```bash
npm run dev:api
```

> 启动脚本会自动释放 `3101` 端口上的旧进程，避免残留 dev 进程导致启动异常。

## 6. 启动 Web
新开一个终端执行：

```bash
npm run dev:web
```

> 启动脚本会自动释放 `3100` 端口上的旧进程，避免残留 Next dev 进程导致空白页或 500。

## 7. 访问地址
- Web: http://localhost:3100
- API: http://localhost:3101/health

## 8. AI provider 配置
### OpenAI 兼容接口
在 `.env` 中配置：
```bash
AI_PROVIDER=openai-compatible
AI_BASE_URL=https://your-api.example.com/v1
AI_API_KEY=your_real_key
AI_MODEL=gpt-4o-mini
```

### Ollama 本地模型
在 `.env` 中配置：
```bash
AI_PROVIDER=ollama
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b
```

未配置可用 provider 时，系统会自动回退到内置 fallback 展开逻辑。

## 9. 手动测试接口
```bash
curl -X POST http://localhost:3101/api/ideas \
  -H 'Content-Type: application/json' \
  -d '{"content":"做一个帮助用户复习灵感的工具","tags":["产品","AI"]}'
```
