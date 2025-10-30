import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入暗黑模式样式
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// 配置 Element Plus 主题
app.use(ElementPlus, {
  dark: localStorage.getItem('app_theme') === 'dark'
})

// 全局配置
app.config.globalProperties.$formatAmount = (amount) => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0
  }
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

app.config.globalProperties.$formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

app.mount('#app')