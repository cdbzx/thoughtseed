# 灵芽（ThoughtSeed）API Spec v0.1

## 1. POST /api/ideas
### 说明
创建一条灵感。

### Request Body
```json
{
  "content": "做一个帮助人复习灵感的工具",
  "sourceType": "text",
  "tags": ["产品", "灵感"]
}
```

### Response
```json
{
  "id": "idea_001",
  "content": "做一个帮助人复习灵感的工具",
  "sourceType": "text",
  "createdAt": "2026-03-18T00:00:00Z"
}
```

---

## 2. GET /api/ideas
### 说明
获取灵感列表。

### Query
- q: 搜索关键词
- tag: 标签
- favorite: 是否收藏

### Response
```json
{
  "items": [
    {
      "id": "idea_001",
      "content": "做一个帮助人复习灵感的工具",
      "tags": ["产品"],
      "createdAt": "2026-03-18T00:00:00Z"
    }
  ]
}
```

---

## 3. GET /api/ideas/:id
### 说明
获取灵感详情。

### Response
```json
{
  "id": "idea_001",
  "content": "做一个帮助人复习灵感的工具",
  "sourceType": "text",
  "tags": ["产品"],
  "createdAt": "2026-03-18T00:00:00Z",
  "expansion": {
    "title": "灵感复习工具",
    "summary": "一个帮助用户记录和复习灵感的产品",
    "problem": "灵感易丢失",
    "audience": "创作者 / 产品经理",
    "value": "帮助灵感沉淀",
    "nextSteps": "先做 MVP"
  }
}
```

---

## 4. POST /api/ideas/:id/expand
### 说明
对某条灵感进行 AI 展开。

### Response
```json
{
  "title": "灵感复习工具",
  "summary": "一个帮助用户记录和复习灵感的产品",
  "problem": "灵感容易丢失且难以回顾",
  "audience": "创作者、独立开发者、产品经理",
  "value": "提升灵感复用率",
  "nextSteps": "定义 MVP 并做原型"
}
```

---

## 5. GET /api/review/today
### 说明
获取今日推荐复习内容。

### Response
```json
{
  "items": [
    {
      "id": "idea_001",
      "content": "做一个帮助人复习灵感的工具"
    }
  ]
}
```
