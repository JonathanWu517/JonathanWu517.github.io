import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/**/*.md', {
  transform(raw) {
    return raw
      .filter(page => page.url !== '/posts/')
      .map(page => ({
        url: page.url,
        title: page.frontmatter.title,
        titleEn: page.frontmatter.titleEn,
        date: page.frontmatter.date,
        tags: page.frontmatter.tags || [],
        tagsEn: page.frontmatter.tagsEn || page.frontmatter.tags || [],
        description: page.frontmatter.description,
        descriptionEn: page.frontmatter.descriptionEn
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
})
