<script setup lang="ts">
import { useSessionsStore } from '../stores/sessionsStore'
import { storeToRefs } from 'pinia'
import { formatDuration, formatWeekRange, getWeekRange } from '../utils/formatters'

const sessionsStore = useSessionsStore()
const { weeklySummary, weeklyTotal } = storeToRefs(sessionsStore)

const { start, end } = getWeekRange()
const weekRange = formatWeekRange(start, end)

const DAILY_GOAL_MS = 8 * 60 * 60 * 1000 // 8 часов в день

function progressPercent(total: number): number {
  return Math.min(100, Math.round((total / DAILY_GOAL_MS) * 100))
}
</script>

<template>
  <div :class="$style.weeklyView">
    <h1 :class="$style.pageTitle">Неделя</h1>
    <p :class="$style.pageSubtitle">{{ weekRange }}</p>

    <div :class="$style.totalCard">
      <span :class="$style.totalLabel">Всего за неделю</span>
      <span :class="$style.totalValue">{{ formatDuration(weeklyTotal) }}</span>
    </div>

    <div :class="$style.daysList">
      <div
        v-for="day in weeklySummary"
        :key="day.iso"
        :class="$style.dayRow"
      >
        <span :class="$style.dayLabel">{{ day.dayLabel }}</span>

        <div :class="$style.progressTrack">
          <div
            :class="$style.progressFill"
            :style="{ width: progressPercent(day.total) + '%' }"
          />
        </div>

        <span :class="$style.dayValue">{{ formatDuration(day.total) }}</span>
      </div>
    </div>

    <p
      v-if="weeklyTotal === 0"
      :class="$style.emptyHint"
    >
      Нет данных за эту неделю
    </p>
  </div>
</template>

<style module lang="scss">
.weeklyView {
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

.daysList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.dayRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.dayRow:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
}

.dayLabel {
  min-width: 100px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

.progressTrack {
  flex: 1;
  height: 10px;
  background: var(--color-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.dayValue {
  min-width: 70px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.emptyHint {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
