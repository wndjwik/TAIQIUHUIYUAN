const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
} = require('../controllers/memberController');

// 获取所有会员列表
router.get('/', getAllMembers);

// 获取单个会员详情
router.get('/:member_id', getMemberById);

// 创建新会员
router.post('/', createMember);

// 更新会员信息
router.put('/:member_id', updateMember);

// 删除会员
router.delete('/:member_id', deleteMember);

module.exports = router;