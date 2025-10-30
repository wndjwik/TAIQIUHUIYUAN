// 简化的Electron测试脚本
const { app, BrowserWindow } = require('electron')
const path = require('path')

// 禁用安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    show: false // 初始不显示，等页面加载完成
  })

  // 加载本地文件
  mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  
  // 页面加载完成后显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    console.log('✅ Electron窗口已加载')
  })

  // 开发工具（可选）
  mainWindow.webContents.openDevTools()

  return mainWindow
}

app.whenReady().then(() => {
  console.log('🚀 Electron应用启动中...')
  
  const mainWindow = createWindow()
  
  // 处理窗口关闭
  mainWindow.on('closed', () => {
    console.log('📱 Electron应用已关闭')
    app.quit()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

console.log('🔧 测试脚本已加载，等待Electron启动...')