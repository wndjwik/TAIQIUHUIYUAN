import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members.vue')
  },
  {
    path: '/recharge-records',
    name: 'RechargeRecords',
    component: () => import('@/views/RechargeRecords.vue')
  },
  {
    path: '/consume-records',
    name: 'ConsumeRecords',
    component: () => import('@/views/ConsumeRecords.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue')
  },
  // 404页面重定向到首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 简化的导航守卫，直接允许所有访问
router.beforeEach((to, from, next) => {
  next()
})

export default router