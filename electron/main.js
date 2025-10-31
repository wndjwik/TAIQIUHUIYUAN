const { app, BrowserWindow, ipcMain } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

let backendProcess = null
let mainWindow = null



// 启动后端服务函数
function startBackendServer() {
  const backendPath = path.join(__dirname, '../backend')
  
  // 检查backend目录是否存在
  if (!fs.existsSync(backendPath)) {
    console.error('Backend directory not found:', backendPath)
    return
  }

  // 检查后端端口是否可用
  const net = require('net')
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer()
      server.once('error', () => resolve(false))
      server.once('listening', () => {
        server.close()
        resolve(true)
      })
      server.listen(port)
    })
  }

  // 尝试启动后端服务
  const startBackend = async () => {
    const port = 3001
    
    // 检查端口是否可用
    if (!await isPortAvailable(port)) {
      console.log(`⚠️  端口 ${port} 已被占用，尝试使用备用端口...`)
      
      // 尝试其他端口
      for (let altPort = 3002; altPort <= 3010; altPort++) {
        if (await isPortAvailable(altPort)) {
          console.log(`✅ 使用备用端口 ${altPort}`)
          
          // 修改环境变量使用备用端口
          process.env.PORT = altPort.toString()
          backendPort = altPort.toString()
          break
        }
      }
    } else {
      backendPort = port.toString()
    }

    // 启动后端服务
    backendProcess = spawn('node', ['src/app.js'], {
      cwd: backendPath,
      stdio: 'pipe',
      env: { ...process.env, PORT: backendPort }
    })

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`)
    })

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`)
    })

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`)
    })
  }

  startBackend()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: '台球厅会员管理系统'
  })

  // 开发环境加载本地服务器，生产环境加载打包后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 隐藏菜单栏
  mainWindow.setMenuBarVisibility(false)
}

app.whenReady().then(() => {
  // 启动后端服务
  startBackendServer()
  
  // 等待后端服务启动（开发环境）
  setTimeout(() => {
    createWindow()
  }, process.env.NODE_ENV === 'development' ? 2000 : 0)
})

app.on('window-all-closed', () => {
  // 关闭后端服务
  if (backendProcess) {
    backendProcess.kill()
  }
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 存储实际使用的后端端口
let backendPort = process.env.PORT || '3001';

// 修改startBackend函数中的端口记录
function startBackendServer() {
  const backendPath = path.join(__dirname, '../backend')
  
  // 检查backend目录是否存在
  if (!fs.existsSync(backendPath)) {
    console.error('Backend directory not found:', backendPath)
    return
  }

  // 检查后端端口是否可用
  const net = require('net')
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer()
      server.once('error', () => resolve(false))
      server.once('listening', () => {
        server.close()
        resolve(true)
      })
      server.listen(port)
    })
  }

  // 尝试启动后端服务
  const startBackend = async () => {
    const port = 3001
    
    // 检查端口是否可用
    if (!await isPortAvailable(port)) {
      console.log(`⚠️  端口 ${port} 已被占用，尝试使用备用端口...`)
      
      // 尝试其他端口
      for (let altPort = 3002; altPort <= 3010; altPort++) {
        if (await isPortAvailable(altPort)) {
          console.log(`✅ 使用备用端口 ${altPort}`)
          
          // 修改环境变量使用备用端口
          process.env.PORT = altPort.toString()
          backendPort = altPort.toString()
          break
        }
      }
    } else {
      backendPort = port.toString()
    }

    // 启动后端服务
    backendProcess = spawn('node', ['src/app.js'], {
      cwd: backendPath,
      stdio: 'pipe',
      env: { ...process.env, PORT: backendPort }
    })

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`)
    })

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`)
    })

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`)
    })
  }

  startBackend()
}

// IPC通讯处理
ipcMain.handle('api-request', async (event, { method, path, data }) => {
  try {
    // 使用实际的后端端口
    const baseUrl = `http://localhost:${backendPort}`
    console.log(`发送API请求: ${baseUrl}/api${path}`)
    
    // 这里将请求转发到后端服务
    const response = await fetch(`${baseUrl}/api${path}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('IPC API请求错误:', error);
    return { success: false, error: error.message };
  }
});

// 应用退出时清理资源
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill()
  }
})