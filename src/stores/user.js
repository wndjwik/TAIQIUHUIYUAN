import { ref } from 'vue'

// 用户信息状态管理
const userInfo = ref(null)
const isLoggedIn = ref(false)

// 设置用户信息
export const setUserInfo = (user) => {
  userInfo.value = user
  isLoggedIn.value = true
  // 保存登录状态到会话存储，关闭服务后自动清除
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('userInfo', JSON.stringify(user))
}

// 获取用户信息
export const getUserInfo = () => {
  return userInfo.value
}

// 检查是否已登录
export const checkLoginStatus = () => {
  // 从会话存储恢复登录状态
  const savedStatus = sessionStorage.getItem('isLoggedIn')
  
  if (savedStatus === 'true') {
    const savedUser = sessionStorage.getItem('userInfo')
    if (savedUser) {
      userInfo.value = JSON.parse(savedUser)
      isLoggedIn.value = true
    } else {
      // 没有用户信息，清除登录状态
      clearUserInfo()
    }
  }
  return isLoggedIn.value
}

// 清除用户信息
export const clearUserInfo = () => {
  userInfo.value = null
  isLoggedIn.value = false
  // 清除会话存储的登录状态
  sessionStorage.removeItem('isLoggedIn')
  sessionStorage.removeItem('userInfo')
}

// 导出默认对象，用于在模板中使用
export default {
  userInfo,
  isLoggedIn,
  setUserInfo,
  getUserInfo,
  checkLoginStatus,
  clearUserInfo
}