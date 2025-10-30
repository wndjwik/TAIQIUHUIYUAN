const express = require('express');
const router = express.Router();
const {
  recharge,
  getRechargeRecords
} = require('../controllers/rechargeController');

// 执行充值操作
router.post('/', recharge);

// 获取充值记录列表
router.get('/records', getRechargeRecords);

module.exports = router;