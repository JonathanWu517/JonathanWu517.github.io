<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter } = useData()
</script>

<template>
  <div class="custom-home">
    <!-- ===== Compact Profile Section ===== -->
    <section class="home-profile">
      <div class="profile-left">
        <img
          v-if="frontmatter.hero?.avatar"
          :src="frontmatter.hero.avatar"
          :alt="frontmatter.hero?.name"
          class="home-avatar"
        />
        <div v-else class="home-avatar-placeholder">Photo</div>

        <div class="profile-info">
          <h1 class="home-name">{{ frontmatter.hero?.name || 'Your Name' }}</h1>
          <p class="home-title">
            <span class="prompt">&gt;</span>
            {{ frontmatter.hero?.title || 'Software Developer' }}
          </p>
        </div>
      </div>

      <div class="profile-right">
        <p class="home-bio">{{ frontmatter.hero?.bio || '' }}</p>
        <div class="home-social">
          <a
            v-for="link in frontmatter.social || []"
            :key="link.text"
            :href="link.url"
            :target="link.url?.startsWith('http') ? '_blank' : undefined"
            :rel="link.url?.startsWith('http') ? 'noopener noreferrer' : undefined"
          >{{ link.text }}</a>
        </div>
      </div>
    </section>

    <!-- ===== About Me Card ===== -->
    <section class="home-about-callout">
      <div class="about-callout-card">
        <div class="callout-text">
          <h2>{{ frontmatter.aboutSection?.title || 'About Me' }}</h2>
          <p>{{ frontmatter.aboutSection?.description || '' }}</p>
        </div>
        <a class="callout-link" :href="frontmatter.aboutSection?.link || '/about'">
          {{ frontmatter.aboutSection?.linkText || 'Learn More →' }}
        </a>
      </div>
    </section>

    <!-- ===== Stats Row ===== -->
    <section class="home-stats-section" v-if="frontmatter.stats?.length">
      <div class="home-stats">
        <div class="home-stat" v-for="stat in frontmatter.stats" :key="stat.label">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- ===== Project Cards Grid ===== -->
    <section class="home-projects">
      <h2 class="section-heading">{{ frontmatter.projectsSection?.title || 'Projects' }}</h2>
      <p class="section-sub" v-if="frontmatter.projectsSection?.subtitle">
        {{ frontmatter.projectsSection.subtitle }}
      </p>

      <div class="projects-grid">
        <a
          v-for="item in frontmatter.projects || []"
          :key="item.title"
          class="project-card"
          :href="item.link || '#'"
          :target="item.link?.startsWith('http') ? '_blank' : undefined"
          :rel="item.link?.startsWith('http') ? 'noopener noreferrer' : undefined"
        >
          <div class="project-icon">
            <span v-if="item.iconText">{{ item.iconText }}</span>
            <img v-else-if="item.iconSrc" :src="item.iconSrc" :alt="item.title" />
            <span v-else>✦</span>
          </div>
          <div class="project-info">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>
