<script setup lang="ts">
import type { TimeSession } from '../types/session'
import { formatTime, formatDuration } from '../utils/formatters'

const props = defineProps<{
  session: TimeSession
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

function handleDelete() {
  emit('delete', props.session.id)
}
</script>

<template>
  <div :class="$style.card">
    <div :class="$style.info">
      <div :class="$style.time">
        <span :class="$style.label">С</span>
        <span :class="$style.value">{{ formatTime(session.startTime) }}</span>
      </div>
      <span :class="$style.separator">—</span>
      <div :class="$style.time">
        <span :class="$style.label">До</span>
        <span :class="$style.value">{{ session.endTime ? formatTime(session.endTime) : '…' }}</span>
      </div>
      <div :class="$style.duration">
        <span :class="$style.badge">{{ formatDuration(session.duration) }}</span>
      </div>
    </div>
    <button :class="$style.deleteBtn" title="Удалить сессию" @click="handleDelete">
      ✕
    </button>
  </div>
</template>

<style module>
.card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.card:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-family: var(--font-mono);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.separator {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border-radius: var(--radius-sm);
}

.deleteBtn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}

.deleteBtn:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}
</style>
