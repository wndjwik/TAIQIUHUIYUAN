<template>
  <div id="app" :class="{ 'dark-mode': appStore.isDarkMode }">
    <!-- 登录页面不需要显示导航布局 -->
    <template v-if="route.path === '/login'">
      <router-view />
    </template>
    <!-- 其他页面显示完整导航布局 -->
    <template v-else>
      <el-container class="app-container">
        <!-- 顶部导航栏 -->
        <el-header class="app-header">
            <el-row :gutter="20" type="flex" justify="space-between" align="middle">
              <el-col>
                <div class="app-title">{{ currentTitle }}</div>
              </el-col>
              <el-col>
                <div class="user-info">
                  <span class="operator-info">操作员：{{ operatorName }}</span>
                  <span style="margin: 0 10px;"></span>
                  <el-button type="danger" text @click="handleLogout" class="logout-btn">
                    退出登录
                  </el-button>
                </div>
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
                <el-icon><User /></el-icon>
                <span>员工管理</span>
              </el-menu-item>
              <el-menu-item index="5">
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from './stores/app'
import userStore, { clearUserInfo, getUserInfo } from './stores/user'
import {
  HomeFilled,
  User,
  Document,
  Setting,
  MoonNight,
  Sunny,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const activeMenu = ref('0')
const appStore = useAppStore()
const userInfo = ref(null)

// 添加一个新的响应式变量专门用于显示操作员名称
const operatorName = ref('张三')

const menuRoutes = ['/', '/members', '/recharge-records', '/consume-records', '/employees', '/settings']

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
    '/employees': '员工管理',
    '/settings': '系统设置'
  }
  return titles[route.path] || '台球厅会员管理系统'
})

const onMenuChange = (index) => {
  console.log(`菜单点击索引: ${index}`);
  activeMenu.value = index;
  const routePath = menuRoutes[parseInt(index)];
  console.log(`尝试导航到: ${routePath}`);
  
  try {
    // 使用replace方法替代push，避免可能的导航栈问题
    router.replace(routePath).then(() => {
      console.log(`成功导航到: ${routePath}`);
    }).catch(error => {
      console.error(`导航失败: ${error.message}`);
      // 如果导航失败，尝试直接设置路由
      router.push(routePath);
    });
  } catch (error) {
    console.error(`菜单处理错误: ${error.message}`);
    // 最后的备选方案：强制刷新页面
    if (routePath) {
      window.location.hash = `#${routePath}`;
    }
  }
}

// 强制刷新用户信息的函数
const forceRefreshUserInfo = () => {
  // 直接从sessionStorage读取并显示用户信息
  const savedUser = sessionStorage.getItem('userInfo')
  const isLoggedIn = sessionStorage.getItem('isLoggedIn')
  
  console.log('===== 强制刷新用户信息 =====')
  console.log('登录状态:', isLoggedIn)
  console.log('保存的用户信息:', savedUser)
  
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser)
      console.log('解析后的用户信息结构:', parsedUser)
      
      // 列出所有可用字段，帮助调试
      console.log('用户信息可用字段:', Object.keys(parsedUser))
      
      // 尝试所有可能的字段名，包括嵌套的可能
      const possibleFields = [
        'name', 'username', 'employee_name', 'realname', 'nickname', 
        'userName', 'employeeName', '真实姓名', 'fullname', 'FullName',
        'userinfo.name', 'userinfo.username', 'user.username', 'user.name'
      ]
      
      // 检查直接字段
      for (const field of possibleFields) {
        if (field.includes('.')) {
          // 处理嵌套字段
          const parts = field.split('.')
          let value = parsedUser
          let found = true
          
          for (const part of parts) {
            if (value && value[part] !== undefined) {
              value = value[part]
            } else {
              found = false
              break
            }
          }
          
          if (found && typeof value === 'string' && value.trim()) {
            operatorName.value = value
            console.log(`使用嵌套字段 ${field}:`, operatorName.value)
            return
          }
        } else if (parsedUser[field]) {
          operatorName.value = parsedUser[field]
          console.log(`使用字段 ${field}:`, operatorName.value)
          return
        }
      }
      
      // 如果没有找到任何已知字段，尝试使用第一个非空字符串字段
      for (const key in parsedUser) {
        if (typeof parsedUser[key] === 'string' && parsedUser[key].trim()) {
          operatorName.value = parsedUser[key]
          console.log(`使用第一个非空字符串字段 ${key}:`, operatorName.value)
          return
        }
      }
      
      // 如果仍然没有找到合适的字符串值，显示第一个可用字段的内容
      if (Object.keys(parsedUser).length > 0) {
        const firstKey = Object.keys(parsedUser)[0]
        operatorName.value = `[${firstKey}]: ${parsedUser[firstKey]}`
        console.log(`使用第一个可用字段 ${firstKey}:`, operatorName.value)
      }
    } catch (e) {
      console.error('解析用户信息失败:', e)
      operatorName.value = '用户信息格式错误'
    }
  } else if (isLoggedIn === 'true') {
    console.log('已登录但未找到用户信息')
    operatorName.value = '已登录'
  } else {
    console.log('未找到保存的用户信息')
    operatorName.value = '未登录'
  }
}

// 退出登录处理
const handleLogout = () => {
  // 清除用户信息
  clearUserInfo()
  // 重置操作员名称
  operatorName.value = '张三'
  // 跳转到登录页面
  router.push('/login')
}

// 监听路由变化
watch(() => route.path, updateActiveMenu)

// 更新操作员名称的函数
const updateOperatorName = () => {
  console.log('开始更新操作员名称...')
  
  // 首先尝试从store获取
  const storeUserInfo = getUserInfo()
  console.log('从store获取的用户信息:', storeUserInfo)
  userInfo.value = storeUserInfo
  
  // 如果store中没有，从sessionStorage直接获取
  if (!storeUserInfo) {
    const savedUser = sessionStorage.getItem('userInfo')
    console.log('从sessionStorage获取的用户信息:', savedUser)
    if (savedUser) {
      try {
        userInfo.value = JSON.parse(savedUser)
        console.log('解析后的sessionStorage用户信息:', userInfo.value)
      } catch (e) {
        console.error('解析用户信息失败:', e)
      }
    }
  }
  
  // 调试：打印用户信息结构，帮助识别正确的字段名
  console.log('当前用户信息:', userInfo.value)
  
  // 尝试从用户信息中提取名称，检查所有可能的字段
  if (userInfo.value) {
    // 遍历所有可能的字段名
    const possibleFields = ['name', 'username', 'employee_name', 'realname', 'nickname', 'userName', 'employeeName', '真实姓名']
    
    for (const field of possibleFields) {
      if (userInfo.value[field]) {
        operatorName.value = userInfo.value[field]
        console.log(`使用字段 ${field} 作为操作员名称:`, operatorName.value)
        return
      }
    }
    
    // 如果没有找到任何已知字段，尝试使用第一个非空字符串字段
    for (const key in userInfo.value) {
      if (typeof userInfo.value[key] === 'string' && userInfo.value[key].trim()) {
        operatorName.value = userInfo.value[key]
        console.log(`使用字段 ${key} 作为操作员名称:`, operatorName.value)
        return
      }
    }
  }
  
  // 如果仍然没有找到，保持默认值
  console.log('未找到有效用户信息，使用默认名称: 张三')
}

// 初始化时设置菜单状态、应用主题和用户信息
onMounted(() => {
  console.log('组件挂载，初始化用户信息...')
  updateActiveMenu()
  appStore.applyTheme()
  
  // 立即更新操作员名称
  updateOperatorName()
  
  // 监听用户信息变化
  window.addEventListener('storage', (event) => {
    console.log('检测到storage变化:', event.key)
    if (event.key === 'userInfo' || event.key === 'isLoggedIn') {
      updateOperatorName()
    }
  })
  
  // 每3秒检查一次用户信息，确保实时更新
  setInterval(() => {
    console.log('定时刷新用户信息')
    updateOperatorName()
  }, 3000)
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

/* 用户信息显示样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.operator-info {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
  min-width: 120px;
}

.logout-btn {
  font-size: 14px;
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
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-size: 14px;
  color: #ffffff;
}

.logout-btn {
  color: #ffffff;
  font-size: 14px;
}

.logout-btn .el-icon {
  margin-right: 4px;
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