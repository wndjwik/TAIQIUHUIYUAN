// 数据备份路由
const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

/**
 * @route   GET /api/data/stats
 * @desc    获取数据库统计信息
 * @access  Private
 */
router.get('/stats', dataController.getDatabaseStats);

/**
 * @route   POST /api/data/backup
 * @desc    手动触发数据备份到Supabase
 * @access  Private
 */
router.post('/backup', dataController.manualBackup);

/**
 * @route   POST /api/data/restore
 * @desc    从Supabase恢复数据到本地
 * @access  Private
 */
router.post('/restore', dataController.restoreFromBackup);

/**
 * @route   GET /api/data/backup-files
 * @desc    获取备份文件列表
 * @access  Private
 */
router.get('/backup-files', dataController.getBackupFiles);

module.exports = router;