# Personal Website with AI Chat

这是一个个人网站项目，包含主页、作品展示、GitHub项目展示以及AI聊天功能。网站采用现代简约的设计风格，具有响应式布局，支持移动端访问。

## 功能特点

- **主页 (Home)**
  - 个人简介展示
  - 3D模型展示
  - 音频可视化效果
  - 社交媒体链接

- **卡巴拉生命之树 (Kabbalah)**
  - 交互式生命之树展示
  - 设计理念阐述
  - 动态光标效果

- **GitHub项目展示**
  - 个人仓库展示
  - Star项目展示
  - 项目统计信息
  - 动态聚光灯效果

- **AI聊天 (Chat)**
  - 实时AI对话功能
  - 支持代码块显示
  - 优雅的加载动画
  - 自动调整文本框大小

## 技术栈

- **前端**
  - HTML5
  - CSS3 (动画、过渡效果、响应式设计)
  - JavaScript (原生JS)
  - Three.js (3D模型渲染)
  - Font Awesome (图标)

- **后端**
  - Node.js
  - Express
  - DeepSeek API (AI对话)

## 项目结构

```
Personal_Website4myself/
├── css/
│   ├── style.css          # 全局样式
│   ├── chat.css           # 聊天界面样式
│   ├── github.css         # GitHub页面样式
│   ├── person.css         # 个人页面样式
│   ├── audio-visualizer.css # 音频可视化样式
│   └── cursor-glow.css    # 光标效果样式
├── js/
│   ├── main.js           # 主要JavaScript文件
│   ├── chat.js           # 聊天功能
│   ├── model-viewer.js   # 3D模型查看器
│   ├── audio-visualizer.js # 音频可视化
│   ├── cursor-glow.js    # 光标效果
│   └── spotlight.js      # 聚光灯效果
├── images/               # 图片资源
├── index.html           # 主页
├── Kabbalah.html        # 卡巴拉页面
├── github.html          # GitHub项目展示
├── chat.html           # AI聊天页面
├── server.js           # 后端服务器
├── package.json        # 项目依赖
├── vercel.json         # Vercel部署配置
└── README.md           # 项目文档
```

## 部署说明

### 前端部署
网站前端部署在 GitHub Pages：
```bash
https://halo-welt.github.io/Personal_Website4myself/
```

### 后端部署
聊天功能后端部署在 Vercel：
1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
- 创建 `.env` 文件
- 添加 DeepSeek API密钥：
```
DEEPSEEK_API_KEY=your_api_key
PORT=3000
```

3. 本地运行：
```bash
npm start
```

4. Vercel部署：
```bash
vercel
```

## 开发指南

### 添加新页面
1. 创建新的HTML文件
2. 复制导航栏和页脚代码
3. 链接必要的CSS文件
4. 在其他页面的导航栏中添加链接

### 修改样式
- 全局样式在 `css/style.css`
- 页面特定样式在对应的CSS文件中
- 颜色变量定义在 `:root` 选择器中

### AI聊天功能
- 使用 DeepSeek API
- 支持markdown格式的代码块
- 自动保存最近10条对话历史

## 注意事项

- 确保 `.env` 文件不被提交到Git仓库
- 本地开发时需要运行后端服务器
- 部署时需要在Vercel中配置环境变量

## 作者

LIU Xinyu (Desigineer)

## 许可证

© 2025 LIU Xinyu. All rights reserved.
