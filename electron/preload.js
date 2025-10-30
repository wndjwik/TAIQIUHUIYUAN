const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // API请求方法
  apiRequest: async (method, path, data = null) => {
    return await ipcRenderer.invoke('api-request', { method, path, data });
  },
  
  // 健康检查
  healthCheck: async () => {
    return await ipcRenderer.invoke('api-request', { method: 'GET', path: '/health' });
  },
  
  // 会员管理API
  members: {
    getAll: async () => await ipcRenderer.invoke('api-request', { method: 'GET', path: '/members' }),
    getById: async (memberId) => await ipcRenderer.invoke('api-request', { method: 'GET', path: `/members/${memberId}` }),
    create: async (memberData) => await ipcRenderer.invoke('api-request', { method: 'POST', path: '/members', data: memberData }),
    update: async (memberId, memberData) => await ipcRenderer.invoke('api-request', { method: 'PUT', path: `/members/${memberId}`, data: memberData }),
    delete: async (memberId) => await ipcRenderer.invoke('api-request', { method: 'DELETE', path: `/members/${memberId}` }),
  },
  
  // 充值API
  recharge: {
    execute: async (rechargeData) => await ipcRenderer.invoke('api-request', { method: 'POST', path: '/recharge', data: rechargeData }),
    getRecords: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return await ipcRenderer.invoke('api-request', { method: 'GET', path: `/recharge/records?${queryString}` });
    },
  },
  
  // 消费API
  consume: {
    execute: async (consumeData) => await ipcRenderer.invoke('api-request', { method: 'POST', path: '/consume', data: consumeData }),
    getRecords: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return await ipcRenderer.invoke('api-request', { method: 'GET', path: `/consume/records?${queryString}` });
    },
  },
});