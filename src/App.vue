<template>
  <div id="app" :class="{ 'dark-mode': appStore.isDarkMode }">
    <el-container class="app-container">
      <!-- 顶部导航栏 -->
      <el-header class="app-header">
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="app-title">{{ currentTitle }}</div>
            </el-col>
          </el-row>
        </el-header>
      
      <el-container>
        <!-- 左侧菜单 -->
        <el-aside width="200px" class="app-sidebar">
          <el-menu
            :default-active="activeMenu"
            @select="onMenuChange"
            background-color="#2E86AB"
            text-color="#fff"
            active-text-color="#ffd04b"
          >
            <el-menu-item index="0">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="1">
              <el-icon><User /></el-icon>
              <span>会员管理</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><Document /></el-icon>
              <span>充值记录</span>
            </el-menu-item>
            <el-menu-item index="3">
              <el-icon><Document /></el-icon>
              <span>消费记录</span>
            </el-menu-item>
            <el-menu-item index="4">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </el-menu-item>

          </el-menu>
        </el-aside>
        
        <!-- 主内容区 -->
        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 悬浮球主题切换按钮 -->
    <div 
      class="floating-theme-toggle"
      @click="appStore.toggleTheme()"
      :class="{ 'dark-mode': appStore.isDarkMode }"
      title="切换主题"
    >
      <el-icon class="theme-icon">
        <Sunny v-if="appStore.isDarkMode" />
        <MoonNight v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from './stores/app'
import {
  HomeFilled,
  User,
  Document,
  Setting,
  MoonNight,
  Sunny
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const activeMenu = ref('0')
const appStore = useAppStore()

const menuRoutes = ['/', '/members', '/recharge-records', '/consume-records', '/settings']

// 根据当前路由设置激活菜单
const updateActiveMenu = () => {
  const index = menuRoutes.indexOf(route.path)
  activeMenu.value = index >= 0 ? index.toString() : '0'
}

const currentTitle = computed(() => {
  const titles = {
    '/': '首页',
    '/members': '会员管理',
    '/recharge-records': '充值记录',
    '/consume-records': '消费记录',
    '/settings': '系统设置'
  }
  return titles[route.path] || '台球厅会员管理系统'
})

const onMenuChange = (index) => {
  activeMenu.value = index
  router.push(menuRoutes[parseInt(index)])
}

// 监听路由变化
watch(() => route.path, updateActiveMenu)

// 初始化时设置菜单状态和应用主题
onMounted(() => {
  updateActiveMenu()
  appStore.applyTheme()
})

// 主题配置
const themeVars = {
  '--el-color-primary': '#2E86AB',
  '--el-color-success': '#67C23A',
  '--el-color-warning': '#E6A23C',
  '--el-color-danger': '#F56C6C',
  '--el-text-color-primary': '#303133',
  '--el-text-color-regular': '#606266',
  '--el-text-color-secondary': '#909399'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}

/* 深色模式基础样式 */
html.dark, body.dark {
  background-color: #1a1a1a;
}

#app {
  height: 100%;
}

#app.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  background-color: #2E86AB;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 18px;
  font-weight: bold;
}

.app-sidebar {
  background-color: #2E86AB;
  transition: width 0.3s ease;
  overflow: hidden;
}

/* 深色模式下的侧边栏样式 */
#app.dark-mode .app-sidebar {
  background-color: #1f2937;
}

.app-main {
  padding: 20px;
  background-color: #f5f7fa;
  overflow: auto;
  flex: 1;
}

/* 深色模式下的主内容区样式 */
#app.dark-mode .app-main {
  background-color: #1a1a1a;
}

/* 悬浮球主题切换按钮 */
.floating-theme-toggle {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  border: none;
  outline: none;
}

.floating-theme-toggle:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.floating-theme-toggle.dark-mode {
  background: linear-gradient(135deg, #4158D0 0%, #C850C0 50%, #FFCC70 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.floating-theme-toggle.dark-mode:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.theme-icon {
  font-size: 24px;
  color: white;
  transition: transform 0.3s ease;
}

.floating-theme-toggle:hover .theme-icon {
  transform: rotate(360deg);
}

/* 响应式设计 - 移动设备 */
@media (max-width: 768px) {
  .app-main {
    padding: 10px;
  }
  
  .app-title {
    font-size: 16px;
  }
  
  /* 移动端隐藏文字，只显示图标 */
  .app-sidebar .el-menu-item span {
    display: none;
  }
  
  .app-sidebar .el-icon {
    margin-right: 0 !important;
  }
}

/* 响应式设计 - 平板设备 */
@media (min-width: 769px) and (max-width: 1024px) {
  .app-main {
    padding: 15px;
  }
}

/* 深色模式下的Element Plus组件样式调整 */
#app.dark-mode .el-table {
  background-color: #1f2937;
  color: #e5e7eb;
}

#app.dark-mode .el-card {
  background-color: #1f2937;
  border-color: #374151;
}

#app.dark-mode .el-input__wrapper {
  background-color: #374151;
}

#app.dark-mode .el-button--primary {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

#app.dark-mode .el-dialog {
  background-color: #1f2937;
  color: #e5e7eb;
}

#app.dark-mode .el-dialog__header {
  border-bottom-color: #374151;
}
</style>