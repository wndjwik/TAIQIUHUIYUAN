<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-title">台球厅会员管理系统</div>
      </template>
      
      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="80px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入账号" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { setUserInfo } from '../stores/user.js'
import { loginAPI } from '../services/api.js'
import { loginIPC, checkEnvironment } from '../services/ipc-api.js'

const router = useRouter()
const loginFormRef = ref(null)
const loginForm = ref({
  username: '',
  password: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 智能API选择器 - 根据环境自动选择HTTP API或IPC API
const getAPI = () => {
  const env = checkEnvironment();
  
  if (env.isElectron && env.hasElectronAPI) {
    console.log('使用IPC API进行登录');
    return loginIPC;
  } else {
    console.log('使用HTTP API进行登录');
    return loginAPI;
  }
};

// 处理登录
const handleLogin = async () => {
  // 表单验证
  if (!loginFormRef.value.validate()) {
    return;
  }
  
  try {
    // 管理员账号密码验证（硬编码）
    if (loginForm.value.username === 'admin' && loginForm.value.password === 'zh20050114') {
      const userInfo = {
        name: '管理员',
        role: 'admin',
        account: loginForm.value.username
      }
      setUserInfo(userInfo)
      ElMessage.success('登录成功')
      router.push('/')
      return
    }
    
    // 尝试使用API进行登录验证
    const api = getAPI()
    const response = await api.login({
      username: loginForm.value.username,
      password: loginForm.value.password
    })
    
    if (response.success) {
      setUserInfo(response.data)
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(response.message || '账号或密码错误')
    }
  } catch (error) {
    ElMessage.error('登录失败: ' + (error.message || '请重试'))
    console.error('登录失败:', error)
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #2E86AB 0%, #60A3BC 100%);
}

.login-card {
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

.login-btn {
  width: 100%;
}
</style>