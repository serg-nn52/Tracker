<script setup lang="ts">
import { useSessionsStore } from '../stores/sessionsStore'
import { storeToRefs } from 'pinia'
import { formatDate, formatDuration } from '../utils/formatters'
import SessionCard from '../components/SessionCard.vue'

const sessionsStore = useSessionsStore()
const { todaySessions, todayTotal } = storeToRefs(sessionsStore)

function onDelete(id: string) {
  sessionsStore.deleteSession(id)
}

const todayFormatted = formatDate(Date.now())
</script>

<template>
  <div :class="$style.todayView">
    <h1 :class="$style.pageTitle">Сегодня</h1>
    <p :class="$style.pageSubtitle">{{ todayFormatted }}</p>

    <div :class="$style.totalCard">
      <span :class="$style.totalLabel">Всего за день</span>
      <span :class="$style.totalValue">{{ formatDuration(todayTotal) }}</span>
    </div>

    <div v-if="todaySessions.length === 0" :class="$style.emptyState">
      <p>Сегодня ещё не было сессий</p>
      <p :class="$style.emptyHint">Запустите таймер на вкладке «Таймер»</p>
    </div>

    <div v-else :class="$style.sessionList">
      <SessionCard
        v-for="session in todaySessions"
        :key="session.id"
        :session="session"
        @delete="onDelete"
      />
    </div>
  </div>
</template>

<style module>
.todayView {
  padding: var(--spacing-2xl) 0;
  max-width: 600px;
  margin: 0 auto;
}

.pageTitle {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.pageSubtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

.totalCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.totalCard:hover {
  border-color: var(--color-primary);
}

.totalLabel {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.totalValue {
  font-family: var(--font-mono);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.sessionList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.emptyState {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  color: var(--color-text-secondary);
}

.emptyState p {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-sm);
}

.emptyHint {
  font-size: var(--font-size-sm) !important;
  opacity: 0.7;
}
</style>
