const fs = require('fs');
const path = require('path');
const Member = require('../models/Member');
const RechargeRecord = require('../models/RechargeRecord');
const ConsumeRecord = require('../models/ConsumeRecord');

class BackupService {
  constructor() {
    this.backupInterval = null;
    this.backupFrequency = 3600000; // 默认1小时备份一次（毫秒）
    this.backupDir = path.join(__dirname, '../../backups');
    
    // 确保备份目录存在
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // 初始化备份服务
  init() {
    console.log('本地备份服务已启动');
    
    // 立即执行一次备份
    this.performBackup().catch(error => {
      console.error('初始备份失败:', error);
    });

    // 设置定期备份
    this.startScheduledBackup();
  }

  // 开始定时备份
  startScheduledBackup() {
    if (this.backupInterval) {
      console.log('自动备份服务已经在运行');
      return;
    }

    this.backupInterval = setInterval(() => {
      this.performBackup().catch(error => {
        console.error('定时备份失败:', error);
      });
    }, this.backupFrequency);

    console.log(`自动备份服务已启动，备份频率: ${this.backupFrequency / 3600000}小时`);
  }

  // 停止定时备份
  stopScheduledBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('自动备份服务已停止');
    }
  }

  // 执行备份操作 - 本地文件备份
  async performBackup() {
    console.log('开始执行本地数据备份...');
    
    try {
      // 获取所有数据
      const members = await Member.findAll({
        attributes: ['member_id', 'name', 'phone', 'balance', 'gender', 'createdAt', 'updatedAt']
      });
      
      const rechargeRecords = await RechargeRecord.findAll({
        attributes: ['id', 'member_id', 'amount', 'operator', 'createdAt']
      });
      
      const consumeRecords = await ConsumeRecord.findAll({
        attributes: ['id', 'member_id', 'amount', 'operator', 'createdAt']
      });

      // 创建备份数据
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          members: members.map(m => m.toJSON()),
          rechargeRecords: rechargeRecords.map(r => r.toJSON()),
          consumeRecords: consumeRecords.map(c => c.toJSON())
        }
      };

      // 生成备份文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `backup-${timestamp}.json`;
      const backupPath = path.join(this.backupDir, backupFilename);

      // 写入备份文件
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

      console.log(`本地备份成功，共备份${members.length}条会员数据，备份文件: ${backupFilename}`);
      return { 
        success: true, 
        count: members.length,
        filename: backupFilename,
        path: backupPath
      };
    } catch (error) {
      console.error('备份执行失败:', error);
      return { 
        success: false, 
        message: `备份失败: ${error.message}`
      };
    }
  }

  // 手动触发备份
  async manualBackup() {
    return this.performBackup();
  }

  // 从本地备份文件恢复数据
  async restoreFromBackup() {
    console.log('开始从本地备份恢复数据...');
    
    try {
      // 获取最新的备份文件
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .sort((a, b) => {
          // 按时间戳排序，最新的在前
          return new Date(b.split('-')[1].replace(/\./g, ':')).getTime() - 
                 new Date(a.split('-')[1].replace(/\./g, ':')).getTime();
        });

      if (backupFiles.length === 0) {
        console.log('没有找到备份文件');
        return { success: false, message: '没有找到可用的备份文件' };
      }

      // 使用最新的备份文件
      const latestBackupFile = backupFiles[0];
      const backupPath = path.join(this.backupDir, latestBackupFile);
      
      // 读取备份数据
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

      if (!backupData.data) {
        throw new Error('备份文件格式无效');
      }

      // 获取所有模型的sequelize实例
      const { sequelize } = require('../config/sequelize');
      const transaction = await sequelize.transaction();

      try {
        // 清空现有数据
        await ConsumeRecord.destroy({ where: {}, transaction });
        await RechargeRecord.destroy({ where: {}, transaction });
        await Member.destroy({ where: {}, transaction });

        // 恢复会员数据
        await Member.bulkCreate(backupData.data.members || [], { transaction });
        
        // 恢复充值记录
        await RechargeRecord.bulkCreate(backupData.data.rechargeRecords || [], { transaction });
        
        // 恢复消费记录
        await ConsumeRecord.bulkCreate(backupData.data.consumeRecords || [], { transaction });

        // 提交事务
        await transaction.commit();

        console.log(`数据恢复成功，从文件 ${latestBackupFile} 恢复了${backupData.data.members?.length || 0}条会员数据`);
        return { 
          success: true, 
          count: backupData.data.members?.length || 0,
          filename: latestBackupFile
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('数据恢复失败:', error);
      return { 
        success: false, 
        message: `恢复失败: ${error.message}`
      };
    }
  }

  // 获取备份文件列表
  getBackupFiles() {
    try {
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .map(file => {
          const stats = fs.statSync(path.join(this.backupDir, file));
          return {
            filename: file,
            size: stats.size,
            mtime: stats.mtime.toISOString(),
            date: new Date(stats.mtime).toLocaleString('zh-CN')
          };
        })
        .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
      
      return backupFiles;
    } catch (error) {
      console.error('获取备份文件列表失败:', error);
      return [];
    }
  }
}

module.exports = new BackupService();
