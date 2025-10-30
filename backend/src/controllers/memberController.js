const Member = require('../models/Member');

// 获取所有会员
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ 
      success: true, 
      data: members,
      message: '获取会员列表成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '获取会员列表失败: ' + error.message 
    });
  }
};

// 获取单个会员详情
const getMemberById = async (req, res) => {
  try {
    const { member_id } = req.params;
    const member = await Member.findByPk(member_id);
    
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: '会员不存在' 
      });
    }
    
    res.json({ 
      success: true, 
      data: member,
      message: '获取会员详情成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '获取会员详情失败: ' + error.message 
    });
  }
};

// 创建新会员
const createMember = async (req, res) => {
  try {
    const { member_id, name, phone, gender } = req.body;
    
    // 检查会员编号是否已存在
    const existingMember = await Member.findByPk(member_id);
    if (existingMember) {
      return res.status(400).json({ 
        success: false, 
        message: '会员编号已存在' 
      });
    }
    
    const member = await Member.create({ 
      member_id, 
      name, 
      phone,
      gender,
      balance: 0.00
    });
    
    res.status(201).json({ 
      success: true, 
      data: member,
      message: '创建会员成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '创建会员失败: ' + error.message 
    });
  }
};

// 更新会员信息
const updateMember = async (req, res) => {
  try {
    const { member_id } = req.params;
    const { name, phone, gender } = req.body;
    
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: '会员不存在' 
      });
    }
    
    await member.update({ name, phone, gender });
    
    res.json({ 
      success: true, 
      data: member,
      message: '更新会员信息成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '更新会员信息失败: ' + error.message 
    });
  }
};

// 删除会员
const deleteMember = async (req, res) => {
  try {
    const { member_id } = req.params;
    
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: '会员不存在' 
      });
    }
    
    await member.destroy();
    
    res.json({ 
      success: true, 
      message: '删除会员成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '删除会员失败: ' + error.message 
    });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
};