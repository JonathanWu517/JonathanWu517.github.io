<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter } = useData()
</script>

<template>
  <main class="custom-home">
    <section class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">{{ frontmatter.hero?.eyebrow }}</p>
        <h1>
          <span>{{ frontmatter.hero?.name }}</span>
          {{ frontmatter.hero?.text }}
        </h1>
        <p class="tagline">{{ frontmatter.hero?.tagline }}</p>
        <div class="hero-actions">
          <a
            v-for="action in frontmatter.hero?.actions || []"
            :key="action.text"
            class="action"
            :class="action.theme"
            :href="action.link"
          >
            {{ action.text }}
          </a>
        </div>
      </div>

      <div class="hero-panel" aria-label="Profile summary card">
        <div class="panel-mark">{{ frontmatter.hero?.monogram }}</div>
        <p>{{ frontmatter.hero?.summary }}</p>
        <div class="mini-stats">
          <div v-for="stat in frontmatter.stats || []" :key="stat.label">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="home-section">
      <div class="section-title">
        <p>{{ frontmatter.featureSection?.eyebrow }}</p>
        <h2>{{ frontmatter.featureSection?.title }}</h2>
      </div>

      <div class="feature-grid">
        <a
          v-for="feature in frontmatter.features || []"
          :key="feature.title"
          class="feature-card"
          :href="feature.link"
        >
          <span class="feature-icon">{{ feature.icon }}</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.details }}</p>
          <small>{{ feature.meta }}</small>
        </a>
      </div>
    </section>
  </main>
</template>
