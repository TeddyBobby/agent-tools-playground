# Frontend & Fullstack Agent Skills 收集

> 持续追踪 2026 年活跃的前端/全栈 AI Agent Skills。不只是列清单——每个 skill 附使用场景、安装方式、为什么值得关注。

---

## 设计 & 反 AI 味

### hallmark — 反 AI-slop 设计

- **仓库**: Nutlope/hallmark · 11.9k stars · MIT
- **安装**: `npx skills add nutlope/hallmark`
- **做什么**: 20 套主题 + 57 道 slop 检测关卡 + 4 个动词（build/audit/redesign/study），让 AI 生成的 UI 不再千篇一律
- **为什么重要**: 2026 年最热的设计 skill，代表了"AI 设计不是模板换色"这一趋势
- **适合**: 任何需要 AI 生成前端的项目

### taste-skill — 设计品位注入

- **仓库**: Leonxlnx/taste-skill
- **安装**: `npx skills add Leonxlnx/taste-skill`
- **做什么**: 布局、字体、动效、间距、密度感——把"品位"变成可触发的工作流
- **为什么重要**: 解决"AI 做出来的东西功能对但看着难受"问题

### stop-slop — 去除 AI 写作味

- **仓库**: hardikpandya/stop-slop
- **安装**: `npx skills add hardikpandya/stop-slop`
- **做什么**: 识别并消除 AI 生成的文案中明显的机器写作痕迹
- **适合**: 产品文案、技术文档、README、博客

### ux-ui-agent-skills — 138 套设计系统

- **仓库**: plugin87/ux-ui-agent-skills
- **安装**: `git clone https://github.com/plugin87/ux-ui-agent-skills`
- **做什么**: DTCG design tokens、42 组件、WCAG 2.2 可访问性、任意框架代码生成
- **为什么重要**: 不是一套设计系统，而是 138 套——从 Stripe 到 Linear 到 Vercel

---

## 前端开发

### frontend-design (Anthropic 官方)

- **仓库**: anthropics/skills · 官方维护
- **安装**: `npx skills add anthropics/skills --skill frontend-design`
- **做什么**: 布局决策、间距系统、字体层级、视觉重心——帮 AI 做更强的 UI 决策
- **为什么重要**: Anthropic 官方出品，Claude Code 原生适配

### react-best-practices (Vercel 官方)

- **仓库**: vercel-labs/agent-skills
- **安装**: `npx skills add vercel-labs/agent-skills --skill react-best-practices`
- **做什么**: React/Next.js 性能优化、Server Components 最佳实践
- **为什么重要**: Vercel 官方维护，Next.js 项目必备

### web-perf (Cloudflare)

- **仓库**: cloudflare/skills
- **安装**: `npx skills add cloudflare/skills --skill web-perf`
- **做什么**: Core Web Vitals、性能审计、优化建议
- **适合**: 所有线上项目

### premium-frontend-ui

- **仓库**: awesome-copilot/premium-frontend-ui
- **做什么**: 生成"获奖级别"的 Web 应用界面——强烈意图、深度交互、极致细节
- **为什么重要**: 不是"能用就行"，而是追求视觉卓越

### awesome-frontend-skills — 70+ 精选库

- **仓库**: finfin/awesome-frontend-skills · 社区维护
- **内容**: 12 个分类、70+ 前端 skills，含 Angular、shadcn、Prisma、Supabase、Playwright 等官方 skill
- **为什么重要**: 最大的前端 agent skills 索引，持续更新

---

## 测试 & 质量

### webapp-testing (Anthropic)

- **仓库**: anthropics/skills
- **安装**: `npx skills add anthropics/skills --skill webapp-testing`
- **做什么**: 在浏览器中验证——启动本地应用、检查 UI、截图、看 console 日志
- **为什么重要**: 大多数 agent 能写代码但从不验证，这个 skill 补上了闭环

### tdd (Matt Pocock)

- **仓库**: mattpocock/skills
- **安装**: `npx skills add mattpocock/skills --skill tdd`
- **做什么**: 强制 RED-GREEN-REFACTOR 循环
- **为什么重要**: Matt Pocock（TypeScript 圈顶级讲师）的 TDD 方法论

### static-analysis (Trail of Bits)

- **仓库**: trailofbits/skills
- **做什么**: 安全审查 / SAST 工作流
- **适合**: 安全敏感项目

---

## 工作流 & 工程方法论

### superpowers — 可组合开发方法论

- **仓库**: obra/superpowers
- **安装**: `npx skills add obra/superpowers`
- **做什么**: 将软件工程流程（明确需求→计划→小步推进→TDD→Code Review→可审查变更）打包成可安装的 skill 链
- **为什么重要**: 从"vibe coding"到"工程纪律"的转变——开发流程本身成为可安装资产

### mcp-builder (Anthropic)

- **仓库**: anthropics/skills
- **安装**: `npx skills add anthropics/skills --skill mcp-builder`
- **做什么**: 教 agent 如何构建 MCP 服务器和工具集成
- **为什么重要**: MCP 是 agent 连接外部世界的标准协议

### ai-ready (GitHub)

- **仓库**: github/awesome-copilot
- **安装**: `npx skills add github/awesome-copilot --skill ai-ready`
- **做什么**: 评估并优化仓库，让 AI agent 更容易理解和操作
- **适合**: 给现有项目加 AGENTS.md、SKILL.md、结构化规则

---

## 全栈 & 后端

> 以下不是 agent skills，而是 2026 年全栈开发的标配工具/库——做项目时常用于性能优化和架构设计。

| 工具 | 用途 | 为什么在 2026 年重要 |
|------|------|---------------------|
| **Trigger.dev** | 后台任务/定时作业框架 | cron + workflow 的现代替代，Next.js 生态 |
| **Drizzle ORM** | TypeScript 优先数据库 ORM | 取代 Prisma 的趋势，更轻量、类型安全 |
| **Zod** | Schema 验证 | 已成为前端/全栈标配的 runtime type checking |
| **Motion (Framer Motion)** | React 动画库 | 2026 年真正爆发——"终于让我愿意加动效了" |
| **Biome** | 格式化和 linting | 替代 ESLint + Prettier，一个工具搞定，快 10x |
| **shadcn/ui** | 组件库 | 不再是"UI 库"，而是组件构建哲学——copy-paste 优于 npm install |
| **Tailwind CSS v4** | CSS 框架 | 仍是主流，v4 带来 CSS-first 配置 + 更好的性能 |

---

## 趋势观察 (2026)

1. **Agent Skills > Prompts** — 从一次性 prompt 变为可安装、可复用、可审查的工作方法
2. **设计品位可编程化** — hallmark、taste-skill、stop-slop 代表了"把质量标准变成 skill"的潮流
3. **开发流程资产化** — superpowers、ECC 把开发方法论打包成可安装链条
4. **MCP 生态爆发** — agent 通过 MCP 连接一切外部工具和服务
5. **全栈 TypeScript 一统** — Next.js + Drizzle + Zod + tRPC 成为标配组合

---

*最后更新: 2026-07-18 · 持续收集中*
