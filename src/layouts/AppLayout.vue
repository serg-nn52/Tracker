<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useSessionsStore } from '../stores/sessionsStore'
import ThemeToggle from '../components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const sessionsStore = useSessionsStore()

// Отслеживаем пользователя, чтобы загружать его сессии
watch(() => auth.user, (user, prevUser) => {
  if (prevUser === undefined) {
    // Первый вызов (immediate): загружаем, если есть пользователь или bypass
    if (user || auth.devBypass) {
      sessionsStore.fetchSessions()
    }
    return
  }
  if (user) {
    // Сменился пользователь — загружаем его сессии
    sessionsStore.fetchSessions()
  } else {
    // Пользователь вышел — очищаем сессии
    sessionsStore.reset()
  }
}, { immediate: true })

async function handleLogout() {
  try {
    await auth.signOut()
  } catch {
    // signOut может упасть, если нет сессии
  }
  sessionsStore.reset()
  auth.devBypass = false
  router.replace({ name: 'login' })
}

function handleToggleDev() {
  auth.toggleDevBypass()
  if (!auth.devBypass) {
    // Если выключили bypass — переходим на логин
    router.replace({ name: 'login' })
  }
}

const tabs = [
  { name: 'timer', label: 'Таймер', icon: '⏱' },
  { name: 'today', label: 'Сегодня', icon: '📋' },
  { name: 'weekly', label: 'Неделя', icon: '📊' },
] as const

const userEmail = auth.user?.email ?? ''
const isDev = import.meta.env.DEV
</script>

<template>
  <div :class="[$style.layout, auth.devBypass && $style.devBypassActive]">
    <!-- Боковая панель -->
    <aside :class="$style.sidebar">
      <div :class="$style.sidebarHeader">
        <h2 :class="$style.logo">
          Tracker
          <span v-if="auth.devBypass" :class="$style.devBadge">DEV</span>
        </h2>
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
        <div :class="$style.userSection" v-if="auth.user || auth.devBypass">
          <span :class="$style.userEmail" v-if="auth.user">{{ userEmail }}</span>
          <span :class="$style.userEmail" v-else>Без авторизации</span>
          <button :class="$style.logoutBtn" @click="handleLogout">Выйти</button>
        </div>
        <div :class="$style.devSection" v-if="isDev">
          <button :class="$style.devToggle" @click="handleToggleDev">
            <template v-if="auth.devBypass">🔓 Без авторизации</template>
            <template v-else>🔒 С авторизацией</template>
          </button>
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

.devBypassActive {
  border-top: 3px solid #f59e0b;
}

.devBypassActive .sidebar {
  border-top: none;
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
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.5px;
}

.devBadge {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 1px 5px;
  border-radius: 4px;
  background: #f59e0b;
  color: #1a1a2e;
  vertical-align: middle;
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

.devSection {
  display: flex;
  align-items: center;
  justify-content: center;
}

.devToggle {
  width: 100%;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  text-align: center;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.devToggle:hover {
  color: var(--color-text);
  border-color: var(--color-primary);
}

.main {
  flex: 1;
  padding: var(--spacing-xl) var(--spacing-2xl);
  max-width: 800px;
}
</style>
