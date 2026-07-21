# Agent Tools Playground 🔧 / Agent 工具调试器

AI Agent 工具调用可视化调试面板 —— 时间线、输入输出对比、性能分析，一目了然。

> A visual debugger for AI agent tool calls — timeline view, input/output diff, and performance stats.

![Agent Tools Playground](public/screenshot.png)

## ✨ 功能 Features

- **时间线视图 Timeline** — 按时间顺序展示每次工具调用，带耗时进度条
- **详情面板 Detail Panel** — 点击任意调用，查看完整 JSON 输入/输出
- **Diff 对比 Diff View** — 并排对比输入和输出的差异
- **性能统计 Stats** — 成功率、平均耗时、工具调用频率分布
- **Demo 模式** — 预置真实调试场景数据，开箱即用
- **导入导出 Import/Export** — 支持 JSON 格式的 trace 数据导入
- **暗色模式 Dark Mode**

## 🚀 快速开始 Quick Start

```bash
git clone https://github.com/TeddyBobby/agent-tools-playground.git
cd agent-tools-playground
npm install
npm run dev
```

打开 http://localhost:3000 即可看到 demo 数据。

## 📥 数据导入格式 Import Format

接受 JSON 数组格式的 tool trace：

```json
[
  {
    "id": "tc-1",
    "name": "read_file",
    "status": "success",
    "input": { "path": "src/app.tsx", "offset": 1 },
    "output": { "content": "export default..." },
    "startTime": 1700000000000,
    "endTime": 1700000000200,
    "duration": 200
  }
]
```

## 📊 使用场景 Use Cases

- **调试卡住的 Agent** — 快速定位哪个工具调用失败
- **性能优化** — 找出慢查询和瓶颈
- **理解 Agent 行为** — 逐步回放工具调用序列
- **团队协作** — 导出 trace 分享给同事

## 🏗️ 技术栈 Tech Stack

| 层 Layer | 技术 Technology |
|----------|---------------|
| 框架 Framework | Next.js 16 (App Router) |
| 语言 Language | TypeScript |
| 样式 Styling | Tailwind CSS |
| 可视化 Visualization | 纯 CSS/SVG 时间线（零图表库依赖） |
| 状态 State | React useState |

## 🤝 贡献 Contributing

欢迎 PR！大改动请先开 issue。

## 📄 许可 License

MIT © [TeddyBobby](https://github.com/TeddyBobby)
