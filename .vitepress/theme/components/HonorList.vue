<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()

interface Honor {
  path: string
  title: string
  date: string
  organization: string
  description: string
}

const enModules = import.meta.glob<any>(
  '../../../src/honors/*.md',
  { eager: true }
)
const zhModules = import.meta.glob<any>(
  '../../../src/zh/honors/*.md',
  { eager: true }
)

function buildHonors(modules: Record<string, any>, base: string): Honor[] {
  return Object.entries(modules)
    .filter(([fp]) => !fp.endsWith('/index.md'))
    .map(([fp, mod]) => {
      const fm = mod.frontmatter || {}
      const slug = fp.replace(/.*\/honors\//, `${base}/`).replace(/\.md$/, '')
      return {
        path: slug,
        title: fm.title || 'Untitled',
        date: fm.date || '',
        organization: fm.organization || '',
        description: fm.description || ''
      }
    })
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
}

const honors = computed<Honor[]>(() => {
  if (lang.value === 'zh-CN') {
    return buildHonors(zhModules, '/zh/honors')
  }
  return buildHonors(enModules, '/honors')
})
</script>

<template>
  <div class="entry-list">
    <div class="post-list">
      <a v-for="honor in honors" :key="honor.path" class="post-card" :href="honor.path">
        <div class="post-card-header">
          <time v-if="honor.date" class="post-date">{{ honor.date }}</time>
          <h2 class="post-card-title">{{ honor.title }}</h2>
        </div>
        <p v-if="honor.organization" class="post-card-org">{{ honor.organization }}</p>
        <p v-if="honor.description" class="post-card-desc">{{ honor.description }}</p>
      </a>
    </div>

    <p v-if="honors.length === 0" class="post-empty">
      No honors yet. Create a <code>.md</code> file in <code>src/honors/</code>.
    </p>
  </div>
</template>
