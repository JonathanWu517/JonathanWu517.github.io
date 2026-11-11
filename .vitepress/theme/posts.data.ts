import { createContentLoader } from 'vitepress'

function columnOf(url: string) {
  if (url.startsWith('/posts/notes/') && url !== '/posts/notes/') return 'notes'
  if (url.startsWith('/posts/internship/') && url !== '/posts/internship/') return 'internship'
  return ''
}

function formatDate(value: unknown) {
  if (value == null || value === '') return ''
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const matched = String(value).match(/^(\d{4}-\d{2}-\d{2})/)
  return matched ? matched[1] : String(value)
}

export default createContentLoader('posts/**/*.md', {
  transform(raw) {
    return raw
      .map(page => ({ page, column: columnOf(page.url) }))
      .filter(item => item.column)
      .map(({ page, column }) => ({
        url: page.url,
        title: page.frontmatter.title,
        titleEn: page.frontmatter.titleEn,
        date: formatDate(page.frontmatter.date),
        tags: page.frontmatter.tags || [],
        tagsEn: page.frontmatter.tagsEn || page.frontmatter.tags || [],
        description: page.frontmatter.description,
        descriptionEn: page.frontmatter.descriptionEn,
        category: column
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
})
