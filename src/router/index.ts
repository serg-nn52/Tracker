import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import AppLayout from '../layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'timer' } },
        {
          path: 'timer',
          name: 'timer',
          component: () => import('../views/TimerView.vue'),
        },
        {
          path: 'today',
          name: 'today',
          component: () => import('../views/TodayView.vue'),
        },
        {
          path: 'weekly',
          name: 'weekly',
          component: () => import('../views/WeeklyView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Dev-режим: env-флаг или runtime-кнопка в интерфейсе
  if (auth.devBypass) return

  if (to.meta.requiresAuth && !auth.user) {
    return { name: 'login' }
  }

  if (to.name === 'login' && auth.user) {
    return { name: 'timer' }
  }
})

export default router
