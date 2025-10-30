// IPC API服务 - 使用Electron IPC进行前后端通讯

// 登录IPC API
export const loginIPC = {
  login: async (credentials) => {
    try {
      // 在实际的Electron应用中，这里应该通过IPC调用主进程的登录方法
      // 这里使用模拟数据作为替代
      
      // 预设的管理员账号
      const adminUser = {
        id: '1',
        username: 'admin',
        password: 'zh20050114',
        name: '管理员',
        role: 'admin'
      }

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))

      if (credentials.username === adminUser.username && credentials.password === adminUser.password) {
        return {
          success: true,
          data: {
            id: adminUser.id,
            username: adminUser.username,
            name: adminUser.name,
            role: adminUser.role
          }
        }
      } else {
        return {
          success: false,
          message: '账号或密码错误'
        }
      }
    } catch (error) {
      console.error('Electron登录失败:', error)
      throw error
    }
  }
}

// 检查是否在Electron环境中
const isElectron = () => {
  return window.electronAPI !== undefined;
};

// IPC请求函数
const ipcRequest = async (method, path, data = null) => {
  if (!isElectron()) {
    throw new Error('IPC API只能在Electron环境中使用');
  }
  
  try {
    const result = await window.electronAPI.apiRequest(method, path, data);
    
    if (!result.success) {
      throw new Error(result.error || 'IPC请求失败');
    }
    
    return result.data;
  } catch (error) {
    console.error('IPC API请求错误:', error);
    throw error;
  }
};

// 会员相关IPC API
export const memberIPC = {
  // 获取所有会员
  getAllMembers: () => ipcRequest('GET', '/members'),
  
  // 获取单个会员详情
  getMemberById: (memberId) => ipcRequest('GET', `/members/${memberId}`),
  
  // 创建新会员
  createMember: (memberData) => ipcRequest('POST', '/members', memberData),
  
  // 更新会员信息
  updateMember: (memberId, memberData) => ipcRequest('PUT', `/members/${memberId}`, memberData),
  
  // 删除会员
  deleteMember: (memberId) => ipcRequest('DELETE', `/members/${memberId}`),
};

// 充值相关IPC API
export const rechargeIPC = {
  // 执行充值操作
  recharge: (rechargeData) => ipcRequest('POST', '/recharge', rechargeData),
  
  // 获取充值记录
  getRechargeRecords: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ipcRequest('GET', `/recharge/records?${queryString}`);
  },
};

// 消费相关IPC API
export const consumeIPC = {
  // 执行消费操作
  consume: (consumeData) => ipcRequest('POST', '/consume', consumeData),
  
  // 获取消费记录
  getConsumeRecords: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return ipcRequest('GET', `/consume/records?${queryString}`);
  },
};

// 健康检查IPC API
export const healthIPC = {
  check: () => ipcRequest('GET', '/health'),
};

// 环境检测
export const checkEnvironment = () => {
  return {
    isElectron: isElectron(),
    hasElectronAPI: window.electronAPI !== undefined
  };
};