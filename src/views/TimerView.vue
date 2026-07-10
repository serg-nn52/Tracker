<script setup lang="ts">
import { useTimerStore } from '../stores/timerStore'
import { storeToRefs } from 'pinia'
import TimerDisplay from '../components/TimerDisplay.vue'

const timerStore = useTimerStore()
const { isRunning, currentElapsed } = storeToRefs(timerStore)
</script>

<template>
  <div :class="$style.timerView">
    <h1 :class="$style.pageTitle">Таймер</h1>

    <TimerDisplay :elapsed="currentElapsed" />

    <div :class="$style.controls">
      <button
        v-if="!isRunning && currentElapsed === 0"
        :class="[$style.btn, $style.btnPrimary, $style.btnLarge]"
        @click="timerStore.start()"
      >
        ▶ Старт
      </button>

      <button
        v-if="isRunning"
        :class="[$style.btn, $style.btnWarning, $style.btnLarge]"
        @click="timerStore.pause()"
      >
        ⏸ Пауза
      </button>

      <button
        v-if="!isRunning && currentElapsed > 0"
        :class="[$style.btn, $style.btnPrimary, $style.btnLarge]"
        @click="timerStore.start()"
      >
        ▶ Продолжить
      </button>

      <button
        v-if="currentElapsed > 0"
        :class="[$style.btn, $style.btnDanger, $style.btnLarge]"
        @click="timerStore.stop()"
      >
        ⏹ Стоп
      </button>
    </div>

    <p
      v-if="isRunning"
      :class="[$style.status, $style.statusRunning]"
    >
      ● Запись…
    </p>
    <p
      v-else-if="currentElapsed > 0"
      :class="[$style.status, $style.statusPaused]"
    >
      ⏸ На паузе
    </p>
    <p
      v-else
      :class="[$style.status, $style.statusIdle]"
    >
      Нажмите «Старт» чтобы начать
    </p>
  </div>
</template>

<style module lang="scss">
.timerView {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-2xl) 0;
}

.pageTitle {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
}

.controls {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-md);
  transition:
    background var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.btn:active {
  transform: scale(0.97);
}

.btnLarge {
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: var(--font-size-lg);
}

.btnPrimary {
  background: var(--color-primary);
  color: #ffffff;
}

.btnPrimary:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

.btnWarning {
  background: var(--color-surface);
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.btnWarning:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.btnDanger {
  background: var(--color-danger);
  color: #ffffff;
}

.btnDanger:hover {
  background: var(--color-danger-hover);
  box-shadow: var(--shadow-md);
}

.status {
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.statusRunning {
  color: var(--color-success);
}

.statusPaused {
  color: var(--color-text-secondary);
}

.statusIdle {
  color: var(--color-text-secondary);
}
</style>
