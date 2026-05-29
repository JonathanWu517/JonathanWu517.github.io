# 技术规范

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | VitePress 1.6.3 |
| 运行时 | Node.js (Vite) |
| 语言 | TypeScript + Vue 3 (SFC) |
| 样式 | CSS Custom Properties |
| 部署 | GitHub Pages + GitHub Actions |
| 包管理 | npm |

## 项目结构

```
JonathanWu517.github.io/
├── .github/workflows/    # GitHub Actions 部署配置
├── .vitepress/
│   ├── config.mts        # VitePress 配置（导航、侧边栏）
│   └── theme/
│       ├── index.ts      # 主题入口（注册全局组件）
│       ├── style.css     # 全局样式和主题变量
│       └── components/
│           ├── CustomHome.vue   # 首页组件
│           ├── BlogList.vue     # 博客列表组件
│           ├── HonorList.vue    # 荣誉列表组件
│           └── PaperList.vue    # 论文列表组件
├── src/
│   ├── index.md          # 首页
│   ├── about.md          # 关于我
│   ├── posts/            # 博客文章目录
│   │   ├── index.md      # 博客列表页
│   │   └── *.md          # 单篇博客文章
│   ├── projects/         # 项目展示
│   │   └── index.md
│   ├── honors/           # 荣誉与奖项
│   │   ├── index.md      # 荣誉列表页
│   │   └── *.md          # 单项荣誉详情
│   └── papers/           # 论文与发表
│       ├── index.md      # 论文列表页
│       └── *.md          # 单篇论文详情
├── docs/                 # 项目文档
├── diary/                # 开发日记
├── package.json
└── CLAUDE.md             # AI 助手指引
```

## CSS 主题变量

### 深色模式（默认 `.dark`）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--vp-c-bg` | `#1e1e1e` | 页面背景 |
| `--vp-c-bg-alt` | `#252526` | 次要背景 |
| `--vp-c-bg-soft` | `#2d2d30` | 卡片/面板背景 |
| `--vp-c-text-1` | `#cccccc` | 主要文字 |
| `--vp-c-text-2` | `#9d9d9d` | 次要文字 |
| `--vp-c-text-3` | `#6a6a6a` | 辅助文字 |
| `--vp-c-brand-1` | `#60a5fa` | 主强调色（链接、按钮） |
| `--vp-c-brand-2` | `#3b82f6` | 次强调色（悬停、标签） |
| `--vp-c-brand-3` | `#93c5fd` | 浅强调色 |

### 浅色模式（`:root`）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--vp-c-bg` | `#ffffff` | 页面背景 |
| `--vp-c-text-1` | `#1f2937` | 主要文字 |
| `--vp-c-brand-1` | `#60a5fa` | 主强调色 |

## 组件数据流

```
Markdown 文件 (frontmatter)
    ↓ import.meta.glob (Vite 构建时)
Vue SFC 组件 (computed)
    ↓ 模板渲染
HTML 页面
```

每个列表组件（BlogList/HonorList/PaperList）使用 `import.meta.glob` 在构建时加载对应目录下所有 `.md` 文件，提取 frontmatter 数据，排序后渲染为卡片列表。
