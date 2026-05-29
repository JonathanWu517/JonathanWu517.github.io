# CLAUDE.md

这是 JonathanWu517 个人主页项目的 AI 助手指引。基于 VitePress + GitHub Pages。

## 项目概述

- 用户是不懂代码的小白，所有交互和文档**必须使用中文**
- 页面内容、注释均使用中文
- 每次改动保持范围尽可能小，确保安全、可回滚

## i18n 说明

- 默认语言（root）：**简体中文** (`locales.root` → `lang: zh-CN`)，内容在 `src/`
- 第二语言：**English** (`locales.en` → `lang: en-US`, `dir: en`)，内容在 `src/en/`
- 语言切换按钮在导航栏，VitePress 自动生成
- 中文 URL 如 `/about/`、`/papers/`
- 英文 URL 如 `/en/about/`、`/en/papers/`

## 关键文件路径

| 用途 | 路径 |
|------|------|
| VitePress 配置 (i18n, nav, head) | `.vitepress/config.mts` |
| 全局样式/主题 (Tokyo Night) | `.vitepress/theme/style.css` |
| 主题入口 (组件注册) | `.vitepress/theme/index.ts` |
| 首页组件 (头像/统计/卡片) | `.vitepress/theme/components/CustomHome.vue` |
| 博客列表组件 | `.vitepress/theme/components/BlogList.vue` |
| 荣誉列表组件 | `.vitepress/theme/components/HonorList.vue` |
| 论文列表组件 | `.vitepress/theme/components/PaperList.vue` |
| 博客数据加载器 | `.vitepress/theme/posts.data.ts` |
| 荣誉数据加载器 | `.vitepress/theme/honors.data.ts` |
| 论文数据加载器 | `.vitepress/theme/papers.data.ts` |

### 中文内容 (root locale，src/)
| 用途 | 路径 |
|------|------|
| 首页 | `src/index.md` |
| 关于我 | `src/about.md` |
| 博客列表 | `src/posts/index.md` |
| 博客文章 | `src/posts/*.md` |
| 项目 | `src/projects/index.md` |
| 荣誉 | `src/honors/index.md` + `*.md` |
| 论文 | `src/papers/index.md` + `*.md` |

### 英文内容 (en locale，src/en/)
| 用途 | 路径 |
|------|------|
| 首页 | `src/en/index.md` |
| 关于我 | `src/en/about.md` |
| 博客列表 | `src/en/posts/index.md` |
| 博客文章 | `src/en/posts/*.md` |
| 项目 | `src/en/projects/index.md` |
| 荣誉 | `src/en/honors/index.md` + `*.md` |
| 论文 | `src/en/papers/index.md` + `*.md` |

### 静态资源
| 用途 | 路径 |
|------|------|
| 头像照片 | `src/public/证件照头像.jpg` |
| 学校背景图 | `src/public/school-bg.png` |
| 校徽 | `src/public/school-badge.png` |
| 论文配图 | `src/public/papers/drones.png` |
| 微信二维码 | `src/public/wechat-qr.jpg` |

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

## 用户如何修改内容

### 修改个人信息
编辑 `src/index.md`（中文）和 `src/en/index.md`（英文）的 frontmatter：
- `hero.avatar`: 头像路径
- `hero.name`: 名字
- `hero.title`: 头衔/邮箱
- `hero.bio`: 个人简介

编辑 `src/about.md` 和 `src/en/about.md` 修改关于页面。

### 写博客
在 `src/posts/` 下新建 `.md` 文件，格式：
```markdown
---
title: 文章标题
titleEn: English Title
date: 2026-05-30
tags: [标签1, 标签2]
tagsEn: [tag1, tag2]
description: 简短摘要
descriptionEn: Brief summary
---
```
英文博客同步在 `src/en/posts/` 下创建。

### 添加荣誉
在 `src/honors/` 下新建 `.md` 文件，格式：
```markdown
---
title: 奖项名称
date: 2025-11
organization: 国家二等奖
description: 简要描述
---
```
英文同步在 `src/en/honors/` 下创建。

### 添加论文
在 `src/papers/` 下新建 `.md` 文件，格式：
```markdown
---
title: 论文标题
date: 2026-03-08
authors: 作者1; 作者2
journal: 期刊名
link: https://doi.org/xxx
image: /papers/xxx.png
abstract: 摘要
---
```
英文同步在 `src/en/papers/` 下创建。

## 当前网站状态（截至 2026-05-30）
- 博客文章：1篇
- 荣誉：7项
- 论文：1篇 (Drones, 2026)
- 教育背景：江苏科技大学 2023-2027 自动化专业
- 用户姓名：邬昱豪 (Yuhao Wu)
