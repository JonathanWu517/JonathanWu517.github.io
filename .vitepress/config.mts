import { defineConfig } from 'vitepress'

export default defineConfig({
  srcDir: 'src',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  appearance: 'dark',

  head: [
    ['meta', { name: 'theme-color', content: '#1a1b26' }],
    ['meta', { property: 'og:title', content: 'JonathanWu517' }],
    ['meta', { property: 'og:description', content: 'Personal website, portfolio, and blog.' }]
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'JonathanWu517',
      description: 'Personal website, portfolio, and blog.',

      themeConfig: {
        siteTitle: 'JonathanWu517',

        nav: [
          { text: 'Home', link: '/' },
          { text: 'About', link: '/about' },
          { text: 'Projects', link: '/projects/' },
          { text: 'Blog', link: '/posts/' },
          { text: 'Honors', link: '/honors/' },
          { text: 'Papers', link: '/papers/' }
        ],

        socialLinks: [
          { icon: 'github', link: 'https://github.com/JonathanWu517' }
        ],

        search: { provider: 'local' },

        outline: { level: [2, 3] },

        footer: {
          message: 'Built with VitePress & GitHub Pages',
          copyright: '© 2026 JonathanWu517'
        }
      }
    },

    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      dir: 'zh',
      title: 'JonathanWu517',
      description: '个人主页、作品集与博客。',

      themeConfig: {
        siteTitle: 'JonathanWu517',

        nav: [
          { text: '首页', link: '/zh/' },
          { text: '关于', link: '/zh/about' },
          { text: '项目', link: '/zh/projects/' },
          { text: '博客', link: '/zh/posts/' },
          { text: '荣誉', link: '/zh/honors/' },
          { text: '论文', link: '/zh/papers/' }
        ],

        socialLinks: [
          { icon: 'github', link: 'https://github.com/JonathanWu517' }
        ],

        search: { provider: 'local' },

        outline: { level: [2, 3] },

        footer: {
          message: '使用 VitePress 和 GitHub Pages 构建',
          copyright: '© 2026 JonathanWu517'
        }
      }
    }
  }
})
