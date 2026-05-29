import { createContentLoader } from 'vitepress'

export default createContentLoader('papers/*.md', {
  transform(raw) {
    return raw
      .filter(page => page.url !== '/papers/')
      .map(page => ({
        url: page.url,
        title: page.frontmatter.title,
        date: page.frontmatter.date,
        authors: page.frontmatter.authors,
        journal: page.frontmatter.journal,
        abstract: page.frontmatter.abstract,
        link: page.frontmatter.link,
        image: page.frontmatter.image
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
})
