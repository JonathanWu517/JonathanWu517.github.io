import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Jonathan Wu',
  description: 'Personal portfolio, projects, notes, and blog.',
  srcDir: 'src',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,

  head: [
    ['meta', { name: 'theme-color', content: '#11131a' }],
    ['meta', { property: 'og:title', content: 'Jonathan Wu Personal Website' }],
    ['meta', { property: 'og:description', content: 'Projects, posts, and personal portfolio.' }]
  ],

  themeConfig: {
    logo: '',
    siteTitle: 'Jonathan Wu',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' },
      { text: 'Projects', link: '/projects/' },
      { text: 'Posts', link: '/posts/' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/JonathanWu517' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Built with VitePress and GitHub Pages.',
      copyright: '© 2026 Jonathan Wu'
    }
  }
})
