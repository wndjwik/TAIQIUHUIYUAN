import { ref } from 'vue'

// 用户信息状态管理
const userInfo = ref(null)
const isLoggedIn = ref(false)

// 设置用户信息
export const setUserInfo = (user) => {
  userInfo.value = user
  isLoggedIn.value = true
  // 保存登录状态到本地存储，并添加过期时间（7天）
  const expireTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('userInfo', JSON.stringify(user))
  localStorage.setItem('loginExpireTime', expireTime.toString())
}

// 获取用户信息
export const getUserInfo = () => {
  return userInfo.value
}

// 检查是否已登录
export const checkLoginStatus = () => {
  // 从本地存储恢复登录状态
  const savedStatus = localStorage.getItem('isLoggedIn')
  const expireTimeStr = localStorage.getItem('loginExpireTime')
  
  if (savedStatus === 'true' && expireTimeStr) {
    const currentTime = new Date().getTime()
    const expireTime = parseInt(expireTimeStr)
    
    // 检查是否已过期
    if (currentTime < expireTime) {
      const savedUser = localStorage.getItem('userInfo')
      if (savedUser) {
        userInfo.value = JSON.parse(savedUser)
        isLoggedIn.value = true
      }
    } else {
      // 已过期，清除登录状态
      clearUserInfo()
    }
  }
  return isLoggedIn.value
}

// 清除用户信息
export const clearUserInfo = () => {
  userInfo.value = null
  isLoggedIn.value = false
  // 清除本地存储的登录状态
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('loginExpireTime')
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