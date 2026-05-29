<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as postsRaw } from '../posts.data'

const { lang } = useData()

interface Post {
  path: string
  title: string
  date: string
  tags: string[]
  description: string
}

const posts = computed<Post[]>(() => {
  const isEn = lang.value === 'en-US'
  return postsRaw.map(p => ({
    path: p.url,
    title: (isEn && p.titleEn) ? p.titleEn : p.title,
    date: p.date || '',
    tags: (isEn && p.tagsEn?.length) ? p.tagsEn : p.tags,
    description: (isEn && p.descriptionEn) ? p.descriptionEn : p.description
  }))
})
</script>

<template>
  <div class="blog-list">
    <div class="post-list">
      <a v-for="post in posts" :key="post.path" class="post-card" :href="post.path">
        <div class="post-card-header">
          <h2 class="post-card-title">{{ post.title }}</h2>
          <time v-if="post.date" class="post-date">{{ post.date }}</time>
        </div>
        <p v-if="post.description" class="post-card-desc">{{ post.description }}</p>
        <div v-if="post.tags.length > 0" class="post-card-tags">
          <span v-for="tag in post.tags" :key="tag" class="tag-badge tag-badge--sm">{{ tag }}</span>
        </div>
      </a>
    </div>

    <p v-if="posts.length === 0" class="post-empty">
      暂无博客文章。
    </p>
  </div>
</template>
