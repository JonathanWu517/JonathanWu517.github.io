---
name: project-overview
description: 项目整体情况与当前状态
metadata:
  type: project
---

个人主页项目，基于 VitePress + GitHub Pages，Tokyo Night 主题，支持中英双语。

**关键信息**：
- 默认语言：简体中文（root locale, `src/`），英文为第二语言（`src/en/`）
- 开发服务器：`npm run dev`
- 已发布论文：1篇 (Drones 期刊, 2026)
- 荣誉：7项（在 `src/honors/` 下）
- 博客文章：1篇

**如何理解语言配置**：
- Root locale = 中文（`lang: zh-CN`），内容在 `src/`
- `en` locale = 英文（`lang: en-US`, `dir: en`），内容在 `src/en/`
- 中文 URL: `/about/`, `/papers/`；英文 URL: `/en/about/`, `/en/papers/`

**Why**: 用户是不懂代码的新手，需要中文沟通，操作需保守、可回滚。
**How to apply**: 所有修改同步中英文版本，改动范围尽量小。
