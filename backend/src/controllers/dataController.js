// 数据备份控制器 - 用于本地文件备份

const backupService = require('../services/backupService');

/**
 * 获取数据库统计信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
exports.getDatabaseStats = async (req, res) => {
  try {
    const sequelize = require('../config/sequelize');
    const Member = require('../models/Member');
    const RechargeRecord = require('../models/RechargeRecord');
    const ConsumeRecord = require('../models/ConsumeRecord');
    
    const memberCount = await Member.count();
    const rechargeCount = await RechargeRecord.count();
    const consumeCount = await ConsumeRecord.count();
    
    // 获取最近的记录时间
    const latestRecharge = await RechargeRecord.findOne({
      order: [['createdAt', 'DESC']],
      raw: true
    });
    
    const latestConsume = await ConsumeRecord.findOne({
      order: [['createdAt', 'DESC']],
      raw: true
    });
    
    res.json({
      success: true,
      data: {
        memberCount,
        rechargeCount,
        consumeCount,
        latestRechargeTime: latestRecharge?.createdAt,
        latestConsumeTime: latestConsume?.createdAt
      }
    });
  } catch (error) {
    console.error('获取数据库统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据库统计信息失败: ' + error.message
    });
  }
};

/**
 * 手动触发数据备份到本地文件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
exports.manualBackup = async (req, res) => {
  try {
    const result = await backupService.manualBackup();
    if (result && result.success) {
      res.json({
        success: true,
        message: '手动备份成功',
        data: result
      });
    } else {
      res.json({
        success: false,
        message: result.message || '手动备份失败'
      });
    }
  } catch (error) {
    console.error('手动备份失败:', error);
    res.json({
      success: false,
      message: '手动备份失败: ' + error.message
    });
  }
};

/**
 * 从本地备份文件恢复数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
exports.restoreFromBackup = async (req, res) => {
  try {
    const result = await backupService.restoreFromBackup();
    if (result && result.success) {
      res.json({
        success: true,
        message: '数据恢复成功',
        data: result
      });
    } else {
      res.json({
        success: false,
        message: result.message || '数据恢复失败'
      });
    }
  } catch (error) {
    console.error('数据恢复失败:', error);
    res.json({
      success: false,
      message: '数据恢复失败: ' + error.message
    });
  }
};

/**
 * 获取备份文件列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
exports.getBackupFiles = async (req, res) => {
  try {
    const backupFiles = backupService.getBackupFiles();
    res.json({
      success: true,
      data: backupFiles,
      total: backupFiles.length
    });
  } catch (error) {
    console.error('获取备份文件列表失败:', error);
    res.json({
      success: false,
      message: '获取备份文件列表失败: ' + error.message
    });
  }
};