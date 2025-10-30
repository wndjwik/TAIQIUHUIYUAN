import { defineStore } from 'pinia'

// 单独的用户信息管理函数
export const getUserInfo = () => {
  try {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      return JSON.parse(storedUserInfo)
    }
  } catch (e) {
    console.error('解析用户信息失败:', e)
  }
  return null
}

export const setUserInfo = (user) => {
  localStorage.setItem('userInfo', JSON.stringify(user))
}

export const clearUserInfo = () => {
  localStorage.removeItem('userInfo')
}

export const useAppStore = defineStore('app', {
  state: () => ({
    // 系统配置
    theme: localStorage.getItem('app_theme') || 'light',
    language: 'zh-CN',
    
    // 用户信息
    userInfo: getUserInfo() || {
      name: '管理员',
      role: 'admin'
    },
    
    // 系统状态
    loading: false,
    sidebarCollapsed: false,
    
    // 自定义仪表盘配置
    dashboardConfig: JSON.parse(localStorage.getItem('dashboard_config') || JSON.stringify({
      modules: [
        { id: 'totalRecharge', enabled: true, order: 1 },
        { id: 'totalConsume', enabled: true, order: 2 },
        { id: 'memberCount', enabled: true, order: 3 },
        { id: 'trendChart', enabled: true, order: 4 }
      ],
      timeRange: '7d' // 默认显示7天
    }))
  }),
  
  getters: {
    isAdmin: (state) => state.userInfo.role === 'admin',
    isDarkMode: (state) => state.theme === 'dark',
    
    // 获取启用的仪表盘模块（按顺序）
    enabledDashboardModules: (state) => {
      return state.dashboardConfig.modules
        .filter(module => module.enabled)
        .sort((a, b) => a.order - b.order)
    }
  },
  
  actions: {
    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('app_theme', this.theme)
      this.applyTheme()
    },
    
    // 应用主题到DOM
    applyTheme() {
      const html = document.documentElement
      if (this.theme === 'dark') {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    },
    
    // 更新仪表盘配置
    updateDashboardConfig(config) {
      this.dashboardConfig = { ...this.dashboardConfig, ...config }
      localStorage.setItem('dashboard_config', JSON.stringify(this.dashboardConfig))
    },
    
    // 更新模块显示状态
    toggleDashboardModule(moduleId) {
      const module = this.dashboardConfig.modules.find(m => m.id === moduleId)
      if (module) {
        module.enabled = !module.enabled
        localStorage.setItem('dashboard_config', JSON.stringify(this.dashboardConfig))
      }
    },
    
    // 更新模块顺序
    updateModuleOrder(moduleId, newOrder) {
      const module = this.dashboardConfig.modules.find(m => m.id === moduleId)
      if (module) {
        module.order = newOrder
        // 重新排序所有模块
        this.dashboardConfig.modules.forEach((m, index) => {
          m.order = index + 1
        })
        localStorage.setItem('dashboard_config', JSON.stringify(this.dashboardConfig))
      }
    },
    
    // 设置仪表盘时间范围
    setDashboardTimeRange(timeRange) {
      this.dashboardConfig.timeRange = timeRange
      localStorage.setItem('dashboard_config', JSON.stringify(this.dashboardConfig))
    }
  }
})