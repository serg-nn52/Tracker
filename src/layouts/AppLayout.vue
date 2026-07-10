<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useSessionsStore } from '../stores/sessionsStore'
import ThemeToggle from '../components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const sessionsStore = useSessionsStore()

onMounted(() => {
  sessionsStore.fetchSessions()
})

async function handleLogout() {
  await auth.signOut()
  router.push({ name: 'login' })
}

const tabs = [
  { name: 'timer', label: 'Таймер', icon: '⏱' },
  { name: 'today', label: 'Сегодня', icon: '📋' },
  { name: 'weekly', label: 'Неделя', icon: '📊' },
] as const

const userEmail = auth.user?.email ?? ''
</script>

<template>
  <div :class="$style.layout">
    <!-- Боковая панель -->
    <aside :class="$style.sidebar">
      <div :class="$style.sidebarHeader">
        <h2 :class="$style.logo">Tracker</h2>
      </div>

      <nav :class="$style.nav">
        <router-link
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          :class="[$style.navBtn, { [$style.active]: route.name === tab.name }]"
        >
          <span :class="$style.navIcon">{{ tab.icon }}</span>
          <span :class="$style.navLabel">{{ tab.label }}</span>
        </router-link>
      </nav>

      <div :class="$style.sidebarFooter">
        <div :class="$style.userSection" v-if="auth.user">
          <span :class="$style.userEmail">{{ userEmail }}</span>
          <button :class="$style.logoutBtn" @click="handleLogout">Выйти</button>
        </div>
        <ThemeToggle />
      </div>
    </aside>

    <!-- Основной контент -->
    <main :class="$style.main">
      <router-view />
    </main>
  </div>
</template>

<style module lang="scss">
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: var(--spacing-lg) 0;
  transition:
    background var(--transition-normal),
    border-color var(--transition-normal);
}

.sidebarHeader {
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.logo {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.5px;
}

.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-sm);
}

.navBtn {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  font-weight: 500;
  text-decoration: none;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}

.navBtn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.navIcon {
  font-size: 1.25rem;
  line-height: 1;
}

.navLabel {
  line-height: 1;
}

.sidebarFooter {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.userSection {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.userEmail {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logoutBtn {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  background: none;
  white-space: nowrap;
}

.logoutBtn:hover {
  text-decoration: underline;
}

.main {
  flex: 1;
  padding: var(--spacing-xl) var(--spacing-2xl);
  max-width: 800px;
}
</style>
