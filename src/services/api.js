// API服务 - 统一管理后端接口调用

// 模拟后端登录验证
const mockLogin = async (credentials) => {
  // 预设的管理员账号
  const adminUser = {
    id: '1',
    username: 'admin',
    password: 'zh20050114', // 注意：实际项目中密码应该加密存储
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
}

// 登录API
export const loginAPI = {
  login: async (credentials) => {
    try {
      // 在实际项目中，这里应该调用真实的后端API
      // const response = await axios.post('/api/auth/login', credentials)
      // return response.data
      
      // 使用模拟数据
      return await mockLogin(credentials)
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }
}

// 动态获取API基础URL
const getApiBaseUrl = () => {
  // 开发环境使用代理，生产环境使用相对路径
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  } else {
    // 生产环境使用当前窗口的URL
    const port = window.location.port || (window.location.protocol === 'https:' ? 443 : 80);
    return `http://localhost:${port}/api`;
  }
};

const API_BASE_URL = getApiBaseUrl();

// 统一的请求函数
const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 会员相关API
export const memberAPI = {
  // 获取所有会员
  getAllMembers: () => request('/members'),
  
  // 获取单个会员详情
  getMemberById: (memberId) => request(`/members/${memberId}`),
  
  // 创建新会员
  createMember: (memberData) => request('/members', {
    method: 'POST',
    body: JSON.stringify(memberData),
  }),
  
  // 更新会员信息
  updateMember: (memberId, memberData) => request(`/members/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify(memberData),
  }),
  
  // 删除会员
  deleteMember: (memberId) => request(`/members/${memberId}`, {
    method: 'DELETE',
  }),
};

// 充值相关API
export const rechargeAPI = {
  // 执行充值操作
  recharge: (rechargeData) => request('/recharge', {
    method: 'POST',
    body: JSON.stringify(rechargeData),
  }),
  
  // 获取充值记录
  getRechargeRecords: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/recharge/records?${queryString}`);
  },
};

// 消费相关API
export const consumeAPI = {
  // 执行消费操作
  consume: (consumeData) => request('/consume', {
    method: 'POST',
    body: JSON.stringify(consumeData),
  }),
  
  // 获取消费记录
  getConsumeRecords: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/consume/records?${queryString}`);
  },
};

// 健康检查
export const healthAPI = {
  check: () => request('/health'),
};

// 数据备份与恢复API
export const backupAPI = {
  // 手动备份数据
  backupData: () => request('/data/backup', {
    method: 'POST',
  }),
  
  // 从备份恢复数据
  restoreData: () => request('/data/restore', {
    method: 'POST',
  }),
  
  // 获取备份文件列表
  getBackupFiles: () => request('/data/backup-files'),
  
  // 获取数据库统计信息
  getStats: () => request('/data/stats'),
};

// 导出统一的API对象
export const api = {
  // 会员相关
  getAllMembers: memberAPI.getAllMembers,
  getMemberById: memberAPI.getMemberById,
  createMember: memberAPI.createMember,
  updateMember: memberAPI.updateMember,
  deleteMember: memberAPI.deleteMember,
  
  // 充值相关
  recharge: rechargeAPI.recharge,
  getRechargeRecords: rechargeAPI.getRechargeRecords,
  
  // 消费相关
  consume: consumeAPI.consume,
  getConsumeRecords: consumeAPI.getConsumeRecords,
  
  // 健康检查
  healthCheck: healthAPI.check,
  
  // 数据备份与恢复
  backupData: backupAPI.backupData,
  restoreData: backupAPI.restoreData,
  getBackupFiles: backupAPI.getBackupFiles,
  getStats: backupAPI.getStats,
};