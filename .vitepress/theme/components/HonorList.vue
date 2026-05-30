<script setup lang="ts">
import { data as honorsRaw } from '../honors.data'

const honors = honorsRaw.sort((a, b) => {
  if (!a.date) return 1
  if (!b.date) return -1
  return new Date(b.date).getTime() - new Date(a.date).getTime()
})
</script>

<template>
  <div class="honor-list">
    <a v-for="honor in honors" :key="honor.url" class="honor-item" :href="honor.url">
      <span class="honor-bullet">&#8226;</span>
      <span class="honor-title">{{ honor.title }}</span>
      <span v-if="honor.organization" class="honor-award">{{ honor.organization }}</span>
    </a>

    <p v-if="honors.length === 0" class="post-empty">
      No honors yet. Add <code>.md</code> files to <code>src/honors/</code>.
    </p>
  </div>
</template>
