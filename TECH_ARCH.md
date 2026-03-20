# 灵芽（ThoughtSeed）技术架构建议

## 1. 架构目标
- 快速启动 MVP
- 支持本地优先与自托管
- AI 模型可切换
- 后续可平滑扩展

---

## 2. 总体架构
系统建议分为四层：

1. 前端层
2. 应用服务层
3. AI 能力层
4. 数据存储层

---

## 3. 前端层
### 建议方案
- Next.js
- React
- Tailwind CSS
- PWA 支持

### 目标
- Web 端优先上线
- 移动端通过 PWA/H5 先覆盖基础使用场景
- 后续视情况补原生 App

---

## 4. 应用服务层
### 建议方案
- Node.js
- NestJS 或 Next.js API Routes

### 负责内容
- 用户管理
- 灵感记录 CRUD
- 标签管理
- 复习记录管理
- AI 请求编排
- 导出与导入能力

---

## 5. AI 能力层
### 初期目标
- 支持 OpenAI 兼容接口
- 支持本地 Ollama
- 支持多模型切换

### 主要能力
- 灵感展开
- 自动标签生成
- 摘要提取
- 相似灵感推荐

### 演进方向
- Embedding 向量检索
- 语义相似度关联
- 个性化复习推荐

---

## 6. 数据存储层
### 初期
- SQLite

### 后续
- PostgreSQL

### 主要数据对象
- ideas
- idea_expansions
- tags
- review_records
- relations
- settings

---

## 7. 语音与附件处理
### 语音
- 第一版接第三方 STT
- 后续支持本地 Whisper

### 附件
- 支持图片和链接引用
- 附件元数据与灵感记录绑定

---

## 8. 部署建议
### 开发阶段
- 单体应用优先
- 前后端同仓库
- SQLite 本地运行

### 开源发布阶段
- Docker Compose 支持
- 环境变量配置模型接口
- 支持本地 AI 与云 API 混合配置

---

## 9. 配置建议
建议支持如下可配置项：
- BASE_URL
- API_KEY
- MODEL_NAME
- OLLAMA_HOST
- DATABASE_URL
- REVIEW_SCHEDULE

---

## 10. 演进路线
### 阶段 1
- 单体 Web 应用 + SQLite + OpenAI compatible

### 阶段 2
- 加 Ollama、本地语音、向量检索

### 阶段 3
- PostgreSQL、同步能力、多端适配、插件扩展
