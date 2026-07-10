<script setup lang="ts">
import { useThemeStore } from '../stores/themeStore'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
</script>

<template>
  <button
    :class="$style.toggle"
    :title="theme === 'light' ? 'Тёмная тема' : 'Светлая тема'"
    @click="themeStore.toggleTheme()"
    aria-label="Переключить тему"
  >
    <span v-if="theme === 'light'" :class="$style.icon">☀️</span>
    <span v-else :class="$style.icon">🌙</span>
  </button>
</template>

<style module>
.toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.25rem;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.toggle:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.toggle:active {
  transform: scale(0.95);
}

.icon {
  line-height: 1;
}
</style>
