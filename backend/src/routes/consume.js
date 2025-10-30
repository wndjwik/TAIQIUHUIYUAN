const express = require('express');
const router = express.Router();
const {
  consume,
  getConsumeRecords
} = require('../controllers/consumeController');

// 执行消费操作
router.post('/', consume);

// 获取消费记录列表
router.get('/records', getConsumeRecords);

module.exports = router;