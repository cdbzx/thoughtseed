# 灵芽（ThoughtSeed）多角色协作工作流

## 1. 总体原则
参考 agency-agents 的“多专家协作”思路，以及 superpowers 的“先设计、再计划、再执行、再审查”流程。

工作方式不是一上来写代码，而是：

1. 明确问题
2. 形成规格
3. 拆分任务
4. 分角色执行
5. 审查与收敛
6. 再进入下一轮

---

## 2. 阶段一：Brainstorming
### 参与角色
- Product Manager
- UX Architect
- Software Architect

### 目标
- 明确产品目标
- 收敛 MVP 范围
- 明确主要用户与场景

### 产物
- PRODUCT.md
- PRD.md
- MVP.md

---

## 3. 阶段二：Specification
### 参与角色
- Product Manager
- UX Architect
- AI Engineer
- Software Architect

### 目标
- 明确页面结构
- 明确数据结构
- 明确 AI 场景与输出格式

### 产物
- IA.md
- PAGES.md
- USER_FLOW.md
- SCHEMA.md
- TECH_ARCH.md

---

## 4. 阶段三：Planning
### 参与角色
- Product Manager
- Software Architect
- Frontend Developer
- AI Engineer

### 目标
- 把 MVP 拆成一批可执行任务
- 明确先后顺序
- 定义第一周开发内容

### 产物
- TODO.md
- TASKS.md
- ROADMAP.md

---

## 5. 阶段四：Execution
### 参与角色
- Frontend Developer
- AI Engineer
- Software Architect

### 目标
- 按任务清单实现 MVP
- 每完成一块就可验证

### 执行策略
- 先做快速记录主链路
- 再做列表与详情
- 再做 AI 展开
- 再做复习系统
- 最后做设置与导出

---

## 6. 阶段五：Review
### 参与角色
- Code Reviewer
- Product Manager
- Technical Writer

### 目标
- 检查是否偏离 MVP
- 检查是否过度设计
- 检查文档是否跟实现一致

### 输出
- Review 结论
- 问题列表
- 下一轮调整建议

---

## 7. 阶段六：Release Prep
### 参与角色
- Technical Writer
- Software Architect
- Code Reviewer

### 目标
- 准备开源发布材料
- 确保本地启动方式清晰
- 确保项目目录、文档、环境变量齐全

### 输出
- README
- 部署说明
- 环境变量说明
- 版本发布说明

---

## 8. 当前推荐执行顺序
1. 先以 Product + UX + Architect 继续收紧第一版
2. 再开始建项目结构
3. 然后按 Frontend / AI 两条主线并行开发
4. 每一轮后都由 Reviewer 审查
5. 最后由 Technical Writer 补文档
