import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Your Name',
  description: 'Personal website, portfolio, projects, and notes.',
  srcDir: 'src',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,

  head: [
    ['meta', { name: 'theme-color', content: '#f7f2e8' }],
    ['meta', { property: 'og:title', content: 'Your Name Personal Website' }],
    ['meta', { property: 'og:description', content: 'Portfolio, projects, notes, and personal profile.' }]
  ],

  themeConfig: {
    logo: '',
    siteTitle: 'Your Name',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' },
      { text: 'Projects', link: '/projects/' },
      { text: 'Posts', link: '/posts/' }
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'About Me', link: '/about' }
          ]
        },
        {
          text: 'Work',
          items: [
            { text: 'Projects', link: '/projects/' },
            { text: 'Posts', link: '/posts/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/YOUR_GITHUB_USERNAME' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/' }
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3]
    },

    footer: {
      message: 'Built with VitePress and GitHub Pages.',
      copyright: '© 2026 Your Name'
    }
  }
})
