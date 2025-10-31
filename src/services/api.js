// API服务 - 统一管理后端接口调用

// 登录API
export const loginAPI = {
  login: async (credentials) => {
    try {
      // 调用真实的后端API，使用员工表进行验证
      const response = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      return response
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
export const request = async (url, options = {}) => {

  try {
    // 提取options中的params参数
    const { params, ...fetchOptions } = options;
    
    // 构建完整URL
    let fullUrl = `${API_BASE_URL}${url}`;
    
    // 如果有params参数，将其转换为查询字符串并附加到URL
    if (params && typeof params === 'object') {
      try {
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
          fullUrl += `?${queryString}`;
        }
      } catch (paramsError) {
        console.error('参数处理错误:', paramsError);
      }
    }
    

    
    let response;
    try {
      response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      });
      

    } catch (fetchError) {
      console.error('Fetch请求失败:', fetchError);
      throw new Error(`网络请求失败: ${fetchError.message}`);
    }

    try {
      const data = await response.json();

      return data;
    } catch (jsonError) {
      console.error('响应解析错误:', jsonError);
      throw new Error(`响应解析失败: ${jsonError.message}`);
    }
  } catch (error) {
    console.error('API请求处理异常:', error);
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
// 员工相关API
export const employeeAPI = {
  // 登录
  login: (loginData) => request('/employees/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  }),
  
  // 获取所有员工
  getAllEmployees: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/employees${queryString ? '?' + queryString : ''}`);
  },
  
  // 获取单个员工
  getEmployeeById: (id) => request(`/employees/${id}`),
  
  // 创建员工
  createEmployee: (employeeData) => request('/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  }),
  
  // 更新员工
  updateEmployee: (id, employeeData) => {
    return request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  },
  
  // 删除员工
  deleteEmployee: (id) => request(`/employees/${id}`, {
    method: 'DELETE',
  }),
  
  // 修改密码
  changePassword: (id, passwordData) => request(`/employees/${id}/password`, {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  }),
};

export const api = {
  // 会员相关
  getAllMembers: memberAPI.getAllMembers,
  getMemberById: memberAPI.getMemberById,
  createMember: memberAPI.createMember,
  updateMember: memberAPI.updateMember,
  deleteMember: memberAPI.deleteMember,
  
  // 员工相关
  login: employeeAPI.login,
  getAllEmployees: employeeAPI.getAllEmployees,
  getEmployeeById: employeeAPI.getEmployeeById,
  createEmployee: employeeAPI.createEmployee,
  updateEmployee: employeeAPI.updateEmployee,
  deleteEmployee: employeeAPI.deleteEmployee,
  changePassword: employeeAPI.changePassword,
  
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