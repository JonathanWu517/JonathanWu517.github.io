<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()

interface Paper {
  path: string
  title: string
  date: string
  authors: string
  journal: string
  abstract: string
  link: string
}

const enModules = import.meta.glob<any>(
  '../../../src/papers/*.md',
  { eager: true }
)
const zhModules = import.meta.glob<any>(
  '../../../src/zh/papers/*.md',
  { eager: true }
)

function buildPapers(modules: Record<string, any>, base: string): Paper[] {
  return Object.entries(modules)
    .filter(([fp]) => !fp.endsWith('/index.md'))
    .map(([fp, mod]) => {
      const fm = mod.frontmatter || {}
      const slug = fp.replace(/.*\/papers\//, `${base}/`).replace(/\.md$/, '')
      return {
        path: slug,
        title: fm.title || 'Untitled',
        date: fm.date || '',
        authors: fm.authors || '',
        journal: fm.journal || '',
        abstract: fm.abstract || '',
        link: fm.link || ''
      }
    })
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
}

const papers = computed<Paper[]>(() => {
  if (lang.value === 'zh-CN') {
    return buildPapers(zhModules, '/zh/papers')
  }
  return buildPapers(enModules, '/papers')
})
</script>

<template>
  <div class="entry-list">
    <div class="post-list">
      <a
        v-for="paper in papers"
        :key="paper.path"
        class="post-card"
        :href="paper.link || paper.path"
        :target="paper.link ? '_blank' : undefined"
        :rel="paper.link ? 'noopener noreferrer' : undefined"
      >
        <div class="post-card-header">
          <time v-if="paper.date" class="post-date">{{ paper.date }}</time>
          <h2 class="post-card-title">{{ paper.title }}</h2>
        </div>
        <p v-if="paper.authors" class="post-card-org">{{ paper.authors }}</p>
        <p v-if="paper.journal" class="post-card-meta">{{ paper.journal }}</p>
        <p v-if="paper.abstract" class="post-card-desc">{{ paper.abstract }}</p>
      </a>
    </div>

    <p v-if="papers.length === 0" class="post-empty">
      No papers yet. Create a <code>.md</code> file in <code>src/papers/</code>.
    </p>
  </div>
</template>
