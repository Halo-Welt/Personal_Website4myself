# 个人网站 - Desigineer

刘新煜（Desigineer）的个人作品集网站 - AI 产品经理、设计师 & 工程师。使用原生 HTML/CSS/JS 和 Express 后端构建。

## 网站页面

- **首页** - 个人介绍、统计数据和留言功能
- **简历** - 专业简历，包含教育背景、工作经历和技能
- **聊天** - AI 驱动的聊天功能（两种模式：顾问模式 & 简历模式）
- **实验** - 交互式粒子实验和视觉效果

## 项目结构

```
Personal_Website4myself/
├── backend/              # 后端代码
│   ├── data/             # 数据文件
│   │   ├── analysis.json # 留言分析结果
│   │   └── messages.json # 留言数据
│   ├── prompts/          # AI 提示词文件
│   │   ├── analysis.md   # 留言分析提示词
│   │   ├── consultant.md # 顾问模式提示词
│   │   └── resume.md     # 简历模式提示词
│   └── server.js         # Express 后端服务器
├── frontend/             # 前端代码
│   ├── css/              # CSS 样式文件
│   │   ├── chat.css      # 聊天页面样式
│   │   ├── cool.css      # 实验页面样式
│   │   ├── home-new.css  # 首页样式
│   │   ├── resume.css    # 简历页面样式
│   │   └── style.css     # 全局样式
│   ├── images/           # 图片资源
│   │   ├── favicon.svg   # 网站图标
│   │   ├── og-image.svg  # 社交媒体分享图片
│   │   └── profile.JPG   # 个人头像
│   ├── js/               # JavaScript 文件
│   │   ├── components/   # 组件文件
│   │   │   ├── footer.js # 页脚组件
│   │   │   └── navbar.js # 导航栏组件
│   │   ├── chat.js       # 聊天功能
│   │   ├── config.js     # 环境配置
│   │   ├── cool.js       # 实验页面逻辑
│   │   └── home-new.js   # 首页逻辑
│   ├── chat.html         # 聊天页面
│   ├── cool.html         # 实验页面
│   ├── index.html        # 首页
│   └── resume.html       # 简历页面
├── .gitignore            # Git 忽略规则
├── CLAUDE.md             # 项目说明文件
├── README.md             # 本文档
├── package-lock.json     # 依赖版本锁定文件
├── package.json          # Node.js 依赖配置
└── vercel.json           # Vercel 部署配置
```

## 环境要求

- Node.js 18+（支持原生 fetch）
- npm 或 yarn

## 环境设置

### 1. 克隆仓库

```bash
git clone https://github.com/Halo-Welt/Personal_Website4myself.git
cd Personal_Website4myself
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在根目录创建 `.env.local` 文件：

```env
# 聊天功能所需的 API 密钥
DEEPSEEK_API_KEY=your_api_key_here

# 服务器端口（可选，默认为 3000）
PORT=3000
```

### 4. 获取 API 密钥

1. 访问 DeepSeek API 提供商网站
2. 注册账户
3. 生成 API 密钥
4. 将密钥添加到 `.env.local` 文件中

## 开发

### 仅前端开发（静态文件）

直接在浏览器中打开 `frontend/index.html`，或使用本地服务器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve frontend
```

### 完整开发（前端 + 后端）

启动后端服务器：

```bash
npm start
```

服务器运行在 `http://localhost:3000`。

开发模式（自动重启）：

```bash
npm run dev
```

## 部署

### 完整部署（前端 + 聊天 API）

要在 GitHub Pages 上使用聊天功能，需要将 API 单独部署到 Vercel：

#### 步骤 1：将 API 部署到 Vercel

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 登录 Vercel：
   ```bash
   vercel login
   ```

3. 部署 API：
   ```bash
   vercel
   ```

4. 在 Vercel 控制台添加环境变量：
   - 进入项目设置
   - 添加 `DEEPSEEK_API_KEY` 环境变量

5. 获取 Vercel 部署 URL（例如：`https://your-project.vercel.app`）

#### 步骤 2：更新 API URL

编辑 `frontend/js/config.js` 并更新生产环境 URL：
```javascript
return 'https://your-project.vercel.app';  // 替换为你的 Vercel URL
```

#### 步骤 3：将前端部署到 GitHub Pages

1. 将代码推送到 GitHub
2. 进入仓库设置 > Pages
3. 选择 "main" 分支作为源
4. 你的网站将在以下地址可用：`https://halo-welt.github.io/Personal_Website4myself/`

### 本地部署

对于本地部署，你可以运行后端服务器：

```bash
npm install
npm start
```

服务器将在 `http://localhost:3000` 运行

## 聊天功能

AI 聊天功能支持两种模式：

1. **顾问模式**：设计和工程专家
2. **简历模式**：了解刘新煜背景的 AI 助手

### 配置

聊天功能通过 `frontend/js/config.js` 使用环境感知的 URL：
- 开发环境：`http://localhost:3000/api/chat`
- 生产环境：在 `js/config.js` 中更新生产 URL

## 浏览器支持

- Chrome（最新版本）
- Firefox（最新版本）
- Safari（最新版本）
- Edge（最新版本）

## 性能

- Lighthouse 性能评分：>90
- Lighthouse SEO 评分：100
- Lighthouse 可访问性评分：>90
- 响应式设计

## 可访问性

- 跳过导航链接
- 交互元素上的 ARIA 标签
- 语义化 HTML
- 键盘可导航
- 屏幕阅读器友好

## 许可证

© 2026 刘新煜。保留所有权利。