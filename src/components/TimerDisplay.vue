<script setup lang="ts">
defineProps<{
  elapsed: number
}>()
</script>

<template>
  <div :class="$style.display">
    <span :class="$style.time">
      {{ String(Math.floor(elapsed / 3600000)).padStart(2, '0') }}:{{
        String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0')
      }}:{{
        String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0')
      }}
    </span>
  </div>
</template>

<style module lang="scss">
.display {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.time {
  font-family: var(--font-mono);
  font-size: var(--font-size-display);
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 4px;
  user-select: none;
}
</style>
