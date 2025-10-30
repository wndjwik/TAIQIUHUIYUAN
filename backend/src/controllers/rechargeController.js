const Member = require('../models/Member');
const RechargeRecord = require('../models/RechargeRecord');
const sequelize = require('../config/sequelize');

// 执行充值操作
const recharge = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { member_id, amount, operator = '管理员' } = req.body;
    
    // 验证参数
    if (!member_id || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: '会员编号和充值金额不能为空' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: '充值金额必须大于0' 
      });
    }
    
    // 查找会员
    const member = await Member.findByPk(member_id, { transaction });
    if (!member) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '会员不存在' 
      });
    }
    
    // 更新会员余额
    const newBalance = parseFloat(member.balance) + parseFloat(amount);
    await member.update({ balance: newBalance }, { transaction });
    
    // 创建充值记录
    await RechargeRecord.create({
      member_id,
      member_name: member.name,
      amount,
      operator
    }, { transaction });
    
    // 提交事务
    await transaction.commit();
    
    res.json({ 
      success: true, 
      data: {
        member_id,
        name: member.name,
        amount,
        new_balance: newBalance,
        operator
      },
      message: `充值成功：¥${amount.toFixed(2)}`
    });
    
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ 
      success: false, 
      message: '充值失败: ' + error.message 
    });
  }
};

// 获取充值记录列表
const getRechargeRecords = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, member_id, search } = req.query;
    const offset = (page - 1) * pageSize;
    
    let whereCondition = {};
    if (member_id) {
      whereCondition.member_id = member_id;
    }
    
    let options = {
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    };
    
    // 如果有搜索条件，需要关联查询
    if (search) {
      options.include = [
        {
          model: Member,
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { phone: { [Op.like]: `%${search}%` } }
            ]
          }
        }
      ];
    }
    
    const { count, rows } = await RechargeRecord.findAndCountAll(options);
    
    res.json({ 
      success: true, 
      data: {
        records: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / pageSize)
      },
      message: '获取充值记录成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '获取充值记录失败: ' + error.message 
    });
  }
};

module.exports = {
  recharge,
  getRechargeRecords
};