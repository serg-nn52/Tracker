<script setup lang="ts">
import { ref } from 'vue'
import type { ViewName } from './types/session'
import ThemeToggle from './components/ThemeToggle.vue'
import TimerView from './views/TimerView.vue'
import TodayView from './views/TodayView.vue'
import WeeklyView from './views/WeeklyView.vue'

const currentView = ref<ViewName>('timer')

function setView(view: ViewName) {
  currentView.value = view
}

const tabs: { name: ViewName; label: string; icon: string }[] = [
  { name: 'timer', label: 'Таймер', icon: '⏱' },
  { name: 'today', label: 'Сегодня', icon: '📋' },
  { name: 'weekly', label: 'Неделя', icon: '📊' },
]
</script>

<template>
  <div :class="$style.layout">
    <!-- Боковая панель -->
    <aside :class="$style.sidebar">
      <div :class="$style.sidebarHeader">
        <h2 :class="$style.logo">Tracker</h2>
      </div>

      <nav :class="$style.nav">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          :class="[$style.navBtn, { [$style.active]: currentView === tab.name }]"
          @click="setView(tab.name)"
        >
          <span :class="$style.navIcon">{{ tab.icon }}</span>
          <span :class="$style.navLabel">{{ tab.label }}</span>
        </button>
      </nav>

      <div :class="$style.sidebarFooter">
        <ThemeToggle />
      </div>
    </aside>

    <!-- Основной контент -->
    <main :class="$style.main">
      <TimerView v-if="currentView === 'timer'" />
      <TodayView v-if="currentView === 'today'" />
      <WeeklyView v-if="currentView === 'weekly'" />
    </main>
  </div>
</template>

<style module>
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
  justify-content: flex-start;
}

.main {
  flex: 1;
  padding: var(--spacing-xl) var(--spacing-2xl);
  max-width: 800px;
}
</style>
