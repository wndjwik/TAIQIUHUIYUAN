import { createRouter, createWebHashHistory } from 'vue-router'
import { checkLoginStatus } from '@/stores/user.js'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recharge-records',
    name: 'RechargeRecords',
    component: () => import('@/views/RechargeRecords.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/consume-records',
    name: 'ConsumeRecords',
    component: () => import('@/views/ConsumeRecords.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('@/views/Employees.vue'),
    meta: { requiresAuth: true }
  },
  // 404页面重定向到登录页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 导航守卫，控制访问权限
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    console.log(`尝试访问受保护页面: ${to.path}`);
    // 临时禁用登录检查以便调试
    // if (checkLoginStatus()) {
    //   next()
    // } else {
    //   // 未登录或登录已过期则跳转到登录页
    //   next('/login')
    // }
    
    // 临时允许所有页面访问
    console.log('临时允许访问所有页面进行调试');
    next();
  } else {
    // 不需要登录的页面直接访问
    next()
  }
})

export default router