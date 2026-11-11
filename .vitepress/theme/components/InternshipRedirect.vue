<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'
import { data as posts } from '../posts.data'

const latest = posts.find(p => p.category === 'internship')
const router = useRouter()

onMounted(() => {
  if (latest?.url) router.go(latest.url)
})
</script>

<template>
  <div class="simple-page">
    <p class="blog-heading">实习记录</p>
    <p v-if="latest">
      <a :href="latest.url">{{ latest.title }}</a>
    </p>
  </div>
</template>
