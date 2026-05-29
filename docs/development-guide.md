# 开发指南

## 环境准备

### 前提条件
- 安装 [Node.js](https://nodejs.org/) (推荐 v18 或更高版本)
- 安装 Git

### 首次运行

```bash
# 克隆项目
git clone https://github.com/JonathanWu517/JonathanWu517.github.io.git
cd JonathanWu517.github.io

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:5173` 即可预览。

## 开发流程

### 1. 启动开发服务器
```bash
npm run dev
```
修改文件后浏览器自动刷新。

### 2. 构建生产版本
```bash
npm run build
```
构建产物在 `.vitepress/dist/` 目录。

### 3. 预览生产版本
```bash
npm run preview
```

### 4. 提交代码
```bash
git add .
git commit -m "描述你的改动"
git push
```

推送到 GitHub 后，GitHub Actions 会自动构建并部署到 GitHub Pages。

## 修改内容指南

### 修改个人信息

编辑 `src/index.md` 的 frontmatter：
- `hero.name`: 你的名字
- `hero.text`: 个人主页
- `hero.tagline`: 一句话介绍
- `hero.monogram`: 姓名缩写（2个字母）
- `hero.summary`: 简短介绍

编辑 `src/about.md`：
- 修改自我介绍段落
- 修改研究兴趣和技能内容
- 修改联系方式

### 写博客

在 `src/posts/` 目录下新建 `.md` 文件，格式如下：

```markdown
---
title: 文章标题
date: 2026-05-29
tags: [标签1, 标签2]
description: 文章的简短摘要，显示在博客列表页。
---

# 文章标题

在这里用 Markdown 写正文内容...
```

### 添加荣誉

在 `src/honors/` 目录下新建 `.md` 文件，格式如下：

```markdown
---
title: 荣誉或奖项名称
date: 2025-06-01
organization: 颁发机构或组织
description: 简要描述。
---

# 荣誉名称

详细描述（可选）...
```

### 添加论文

在 `src/papers/` 目录下新建 `.md` 文件，格式如下：

```markdown
---
title: 论文标题
date: 2025-03-15
authors: 第一作者, 第二作者
journal: 期刊或会议名称 (2025)
abstract: 论文摘要。
link: https://doi.org/10.xxxx/example
---

# 论文标题

补充说明（可选）...
```

### 修改项目展示

编辑 `src/projects/index.md`，修改卡片内容和链接。

## 项目文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 开发需求 | [docs/requirements.md](docs/requirements.md) | 功能和非功能需求 |
| 技术规范 | [docs/technical-spec.md](docs/technical-spec.md) | 技术栈和架构 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 色彩、排版、组件 |
| 开发指南 | [docs/development-guide.md](docs/development-guide.md) | 本文档 |
| 开发日记 | [diary/](diary/) | 每日开发记录 |
