<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()

interface Post {
  path: string
  title: string
  date: string
  tags: string[]
  description: string
}

const enModules = import.meta.glob<any>(
  '../../../src/posts/*.md',
  { eager: true }
)
const zhModules = import.meta.glob<any>(
  '../../../src/zh/posts/*.md',
  { eager: true }
)

function buildPosts(modules: Record<string, any>, base: string): Post[] {
  return Object.entries(modules)
    .filter(([fp]) => !fp.endsWith('/index.md'))
    .map(([fp, mod]) => {
      const fm = mod.frontmatter || {}
      const slug = fp.replace(/.*\/posts\//, `${base}/`).replace(/\.md$/, '')
      return {
        path: slug,
        title: fm.title || 'Untitled',
        date: fm.date || '',
        tags: fm.tags || [],
        description: fm.description || ''
      }
    })
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
}

const posts = computed<Post[]>(() => {
  if (lang.value === 'zh-CN') {
    return buildPosts(zhModules, '/zh/posts')
  }
  return buildPosts(enModules, '/posts')
})

const allTags = computed(() => {
  const set = new Set<string>()
  posts.value.forEach(p => p.tags.forEach((t: string) => set.add(t)))
  return Array.from(set).sort()
})
</script>

<template>
  <div class="blog-list">
    <div v-if="allTags.length > 0" class="tag-filter">
      <span v-for="tag in allTags" :key="tag" class="tag-badge">{{ tag }}</span>
    </div>

    <div class="post-list">
      <a v-for="post in posts" :key="post.path" class="post-card" :href="post.path">
        <div class="post-card-header">
          <time v-if="post.date" class="post-date">{{ post.date }}</time>
          <h2 class="post-card-title">{{ post.title }}</h2>
        </div>
        <p v-if="post.description" class="post-card-desc">{{ post.description }}</p>
        <div v-if="post.tags.length > 0" class="post-card-tags">
          <span v-for="tag in post.tags" :key="tag" class="tag-badge tag-badge--sm">{{ tag }}</span>
        </div>
      </a>
    </div>

    <p v-if="posts.length === 0" class="post-empty">
      No posts yet. Create a <code>.md</code> file in <code>src/posts/</code>.
    </p>
  </div>
</template>
