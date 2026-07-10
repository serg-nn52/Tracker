<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()
const isDev = import.meta.env.DEV

// При включении bypass со страницы логина — переходим на таймер
watch(() => auth.devBypass, (val) => {
  if (val) router.push({ name: 'timer' })
})

const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const formError = ref('')
const successMsg = ref('')

async function handleSubmit() {
  formError.value = ''
  successMsg.value = ''

  if (!email.value || !password.value) {
    formError.value = 'Заполните email и пароль'
    return
  }

  if (password.value.length < 6) {
    formError.value = 'Пароль должен быть минимум 6 символов'
    return
  }

  try {
    if (isSignUp.value) {
      const result = await auth.signUp(email.value, password.value)
      if (result?.user?.identities?.length === 0) {
        successMsg.value = 'Этот email уже зарегистрирован. Войдите.'
        isSignUp.value = false
      } else {
        successMsg.value = 'Регистрация успешна! Проверьте email для подтверждения.'
      }
    } else {
      await auth.signIn(email.value, password.value)
      router.push({ name: 'timer' })
    }
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Произошла ошибка'
  }
}
</script>

<template>
  <div :class="[$style.page, auth.devBypass && $style.devBypassActive]">
    <div :class="$style.card">
      <h1 :class="$style.title">
        Tracker
        <span v-if="auth.devBypass" :class="$style.devBadge">DEV</span>
      </h1>
      <p :class="$style.subtitle">
        {{ isSignUp ? 'Создайте аккаунт' : 'Войдите в аккаунт' }}
      </p>

      <form :class="$style.form" @submit.prevent="handleSubmit">
        <div :class="$style.field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="example@mail.com"
            autocomplete="email"
          />
        </div>

        <div :class="$style.field">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Минимум 6 символов"
            autocomplete="current-password"
          />
        </div>

        <p v-if="formError" :class="$style.error">{{ formError }}</p>
        <p v-if="successMsg" :class="$style.success">{{ successMsg }}</p>

        <button
          type="submit"
          :class="$style.submitBtn"
          :disabled="auth.loading"
        >
          {{ auth.loading ? 'Загрузка…' : isSignUp ? 'Зарегистрироваться' : 'Войти' }}
        </button>
      </form>

      <button :class="$style.switchBtn" @click="isSignUp = !isSignUp; formError = ''; successMsg = ''">
        {{ isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться' }}
      </button>

      <button
        v-if="isDev"
        :class="$style.devToggle"
        @click="auth.toggleDevBypass()"
      >
        {{ auth.devBypass ? '🔓 Без авторизации' : '🔒 С авторизацией' }}
      </button>
    </div>
  </div>
</template>

<style module lang="scss">
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-lg);
}

.devBypassActive {
  border-top: 3px solid #f59e0b;
}

.card {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-2xl);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  margin-bottom: var(--spacing-xs);
}

.devBadge {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 1px 5px;
  border-radius: 4px;
  background: #f59e0b;
  color: #1a1a2e;
}

.subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-md);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.field label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

.field input {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  background: var(--color-bg);
  color: var(--color-text);
  transition: border-color var(--transition-fast);
}

.field input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.submitBtn {
  padding: var(--spacing-md);
  background: var(--color-primary);
  color: #ffffff;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-md);
  transition: background var(--transition-fast);
}

.submitBtn:hover {
  background: var(--color-primary-hover);
}

.submitBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switchBtn {
  margin-top: var(--spacing-lg);
  width: 100%;
  text-align: center;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  background: none;
}

.switchBtn:hover {
  text-decoration: underline;
}

.error {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.success {
  color: var(--color-success);
  font-size: var(--font-size-sm);
}

.devToggle {
  margin-top: var(--spacing-lg);
  width: 100%;
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.devToggle:hover {
  color: var(--color-text);
  border-color: var(--color-primary);
}
</style>
