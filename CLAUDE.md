# CLAUDE.md

这是 JonathanWu517 个人主页项目的 AI 助手指引。基于 VitePress + GitHub Pages。

## 项目概述

- 用户是不懂代码的小白，所有交互和文档**必须使用中文**
- 页面内容、注释均使用中文
- 每次改动保持范围尽可能小，确保安全、可回滚

## 关键文件路径

| 用途 | 路径 |
|------|------|
| VitePress 配置 (i18n, nav) | `.vitepress/config.mts` |
| 全局样式/主题 (Tokyo Night) | `.vitepress/theme/style.css` |
| 主题入口 (组件注册) | `.vitepress/theme/index.ts` |
| 首页组件 | `.vitepress/theme/components/CustomHome.vue` |
| 博客列表组件 | `.vitepress/theme/components/BlogList.vue` |
| 荣誉列表组件 | `.vitepress/theme/components/HonorList.vue` |
| 论文列表组件 | `.vitepress/theme/components/PaperList.vue` |

### 英文内容 (默认 locale)
| 用途 | 路径 |
|------|------|
| 首页 | `src/en/index.md` |
| 关于我 | `src/en/about.md` |
| 博客列表 | `src/en/posts/index.md` |
| 博客文章 | `src/en/posts/*.md` |
| 项目 | `src/en/projects/index.md` |
| 荣誉 | `src/en/honors/index.md` + `*.md` |
| 论文 | `src/en/papers/index.md` + `*.md` |

### 中文内容
| 用途 | 路径 |
|------|------|
| 首页 | `src/zh/index.md` |
| 关于我 | `src/zh/about.md` |
| 博客列表 | `src/zh/posts/index.md` |
| 博客文章 | `src/zh/posts/*.md` |
| 其他页面 | `src/zh/...` |

### 静态资源
| 用途 | 路径 |
|------|------|
| 头像照片 | `src/public/avatar.jpg` |

## 标准文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 开发需求 | `docs/requirements.md` | 功能和非功能需求 |
| 技术规范 | `docs/technical-spec.md` | 技术栈、项目结构、CSS 变量 |
| 设计规范 | `docs/design-spec.md` | 色彩系统、排版、组件规范 |
| 开发指南 | `docs/development-guide.md` | 环境搭建、内容修改指南 |
| 开发日记 | `diary/` | 每日开发记录 |

## 常用命令

```bash
npm run dev      # 开发服务器 (热更新)
npm run build    # 构建生产版本
npm run preview  # 预览构建产物
```

## 设计系统 (Tokyo Night)

**深色模式 (默认)**：背景 `#1a1b26`，主文字 `#c0caf5`，主强调蓝 `#7aa2f7`，次强调紫 `#bb9af7`
**浅色模式**：背景 `#ffffff`，主文字 `#1a1b26`，主强调 `#3d59a1`

额外点缀：绿 `#9ece6a` / 黄 `#e0af68` / 橙 `#ff9e64`

## i18n 说明

- 默认语言：英文 (`locales.root`)
- 第二语言：中文 (`locales.zh`)
- 语言切换按钮在导航栏，VitePress 自动生成
- 英文内容 → `src/en/`，URL 如 `/posts/`
- 中文内容 → `src/zh/`，URL 如 `/zh/posts/`

## 用户如何修改内容

### 修改个人信息
编辑 `src/en/index.md`（英文）和 `src/zh/index.md`（中文）的 frontmatter：
- `hero.avatar`: 头像路径（放 `src/public/avatar.jpg`）
- `hero.name`: 名字
- `hero.title`: 头衔
- `hero.bio`: 个人简介
- `social`: 社交链接列表

编辑 `src/en/about.md` 和 `src/zh/about.md` 修改关于页面。

### 写博客
在 `src/zh/posts/` 下新建 `.md` 文件，格式：
```markdown
---
title: 文章标题
date: 2026-05-29
tags: [标签1, 标签2]
description: 简短摘要
---
```
如需英文博客，在 `src/en/posts/` 下创建。

### 添加荣誉/论文
分别在 `src/en/honors/`、`src/zh/honors/`、`src/en/papers/`、`src/zh/papers/` 下新建 `.md` 文件。
