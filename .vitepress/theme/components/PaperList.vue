<script setup lang="ts">
import { data as papersRaw } from '../papers.data'

const papers = papersRaw.sort((a, b) => {
  if (!a.date) return 1
  if (!b.date) return -1
  return new Date(b.date).getTime() - new Date(a.date).getTime()
})
</script>

<template>
  <div class="entry-list">
    <div class="paper-list-page">
      <div v-for="paper in papers" :key="paper.url" class="paper-card">
        <img v-if="paper.image" class="paper-card-img" :src="paper.image" :alt="paper.title" />
        <div class="paper-card-body">
          <p class="paper-title">{{ paper.title }}</p>
          <p v-if="paper.authors" class="paper-authors">{{ paper.authors }}</p>
          <p v-if="paper.journal" class="paper-journal">{{ paper.journal }}</p>
        </div>
      </div>
    </div>

    <p v-if="papers.length === 0" class="post-empty">
      暂无论文。
    </p>
  </div>
</template>
