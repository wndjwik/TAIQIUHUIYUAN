// IPC通讯测试脚本
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 模拟后端API响应
const mockBackendAPI = {
  '/health': () => ({
    success: true,
    message: '台球厅会员管理系统后端服务运行正常',
    timestamp: new Date().toISOString()
  }),
  
  '/members': () => ({
    success: true,
    data: [
      {
        member_id: '800001',
        name: '测试会员1',
        phone: '13800138001',
        balance: 100.00
      },
      {
        member_id: '800002',
        name: '测试会员2',
        phone: '13800138002',
        balance: 200.00
      }
    ]
  })
};

// IPC处理程序
ipcMain.handle('api-request', async (event, { method, path, data }) => {
  console.log(`IPC请求: ${method} ${path}`, data || '');
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (mockBackendAPI[path]) {
      const response = mockBackendAPI[path]();
      console.log('IPC响应:', response);
      return { success: true, data: response };
    } else {
      throw new Error(`API路径不存在: ${path}`);
    }
  } catch (error) {
    console.error('IPC请求错误:', error);
    return { success: false, error: error.message };
  }
});

// 创建测试窗口
function createTestWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron', 'preload.js')
    }
  });

  // 加载测试页面
  win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>IPC通讯测试</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        button { margin: 5px; padding: 10px; }
        .result { margin-top: 10px; padding: 10px; border: 1px solid #ccc; }
      </style>
    </head>
    <body>
      <h1>IPC通讯测试</h1>
      <button onclick="testHealth()">测试健康检查</button>
      <button onclick="testMembers()">测试会员列表</button>
      <div id="result" class="result"></div>
      
      <script>
        function testHealth() {
          if (!window.electronAPI) {
            showResult('错误: electronAPI未定义');
            return;
          }
          
          window.electronAPI.healthCheck()
            .then(result => {
              showResult('健康检查成功: ' + JSON.stringify(result, null, 2));
            })
            .catch(error => {
              showResult('健康检查失败: ' + error.message);
            });
        }
        
        function testMembers() {
          if (!window.electronAPI) {
            showResult('错误: electronAPI未定义');
            return;
          }
          
          window.electronAPI.members.getAll()
            .then(result => {
              showResult('会员列表获取成功: ' + JSON.stringify(result, null, 2));
            })
            .catch(error => {
              showResult('会员列表获取失败: ' + error.message);
            });
        }
        
        function showResult(message) {
          document.getElementById('result').innerText = message;
        }
        
        // 检查环境
        if (window.electronAPI) {
          console.log('IPC通讯环境正常');
        } else {
          console.log('IPC通讯环境异常');
        }
      </script>
    </body>
    </html>
  `));

  // 打开开发者工具便于调试
  win.webContents.openDevTools();
}

// 应用准备就绪后创建窗口
app.whenReady().then(() => {
  createTestWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createTestWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('IPC通讯测试脚本已启动');