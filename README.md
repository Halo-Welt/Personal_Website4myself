# 个人网站 - Desigineer

刘新煜（Desigineer）的个人作品集网站，定位为 AI 产品经理 / 设计师 / 工程师的个人展示与交互站点。  
项目采用原生 HTML/CSS/JavaScript 构建前端，Node.js + Express 提供 API 能力。

## 项目定位

这是一个个人品牌网站项目，核心目标是展示个人经历与能力，并通过 AI 交互提升访客沟通效率。

## 页面与功能

- 首页：个人介绍、动态统计、留言墙与留言洞察
- 简历页：教育背景、实习经历、技能信息、GitHub 动态展示
- 聊天页：双模式 AI 对话（简历模式 / 顾问模式）
- 实验页：交互式生成艺术与可视化实验

## 技术栈

- 前端：Vanilla HTML / CSS / JavaScript
- 后端：Node.js, Express
- 第三方服务：
- DeepSeek Chat Completions（聊天与留言分析）
- JsonBin（留言数据存储）

## 项目结构

```text
Personal_Website4myself/
├── backend/
│   ├── prompts/
│   │   ├── analysis.md
│   │   ├── consultant.md
│   │   └── resume.md
│   └── server.js
├── frontend/
│   ├── css/
│   ├── images/
│   ├── js/
│   │   ├── components/
│   │   ├── chat.js
│   │   ├── config.js
│   │   ├── cool.js
│   │   └── home-new.js
│   ├── chat.html
│   ├── cool.html
│   ├── index.html
│   └── resume.html
├── package.json
└── vercel.json
```

## 版权

© 2026 刘新煜。保留所有权利。
