const { spawn } = require('child_process')
const path = require('path')

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development'

// 启动前端开发服务器
function startFrontend() {
  return new Promise((resolve) => {
    if (isDev) {
      console.log('🚀 启动前端开发服务器...')
      const frontend = spawn('npm', ['run', 'dev'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
      })
      
      // 等待前端服务器启动
      setTimeout(resolve, 3000)
    } else {
      resolve()
    }
  })
}

// 启动后端服务
function startBackend() {
  console.log('🔧 启动后端服务...')
  const backend = spawn('node', ['src/app.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  })
  
  return backend
}

// 启动Electron应用
function startElectron() {
  console.log('💻 启动Electron应用...')
  const electron = spawn('electron', ['.'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  })
  
  return electron
}

// 主启动函数
async function startApp() {
  try {
    // 启动前端（开发环境）
    await startFrontend()
    
    // 启动后端
    const backendProcess = startBackend()
    
    // 等待后端启动
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 启动Electron
    const electronProcess = startElectron()
    
    // 进程退出处理
    electronProcess.on('close', () => {
      console.log('📱 Electron应用已关闭')
      backendProcess.kill()
      process.exit(0)
    })
    
    electronProcess.on('error', (err) => {
      console.error('❌ Electron启动失败:', err)
      backendProcess.kill()
      process.exit(1)
    })
    
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    process.exit(1)
  }
}

// 启动应用
startApp()