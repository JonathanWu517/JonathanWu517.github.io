import { createContentLoader } from 'vitepress'

export default createContentLoader('honors/*.md', {
  transform(raw) {
    return raw
      .filter(page => page.url !== '/honors/')
      .map(page => ({
        url: page.url,
        title: page.frontmatter.title,
        date: page.frontmatter.date,
        organization: page.frontmatter.organization,
        description: page.frontmatter.description
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
})
