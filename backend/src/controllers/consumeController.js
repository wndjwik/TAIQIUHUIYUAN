const Member = require('../models/Member');
const ConsumeRecord = require('../models/ConsumeRecord');
const sequelize = require('../config/sequelize');

// 执行消费操作
const consume = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { member_id, amount, operator = '管理员' } = req.body;
    
    // 验证参数
    if (!member_id || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: '会员编号和消费金额不能为空' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: '消费金额必须大于0' 
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
    
    // 检查余额是否充足
    if (parseFloat(member.balance) < parseFloat(amount)) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: '余额不足' 
      });
    }
    
    // 更新会员余额
    const newBalance = parseFloat(member.balance) - parseFloat(amount);
    await member.update({ balance: newBalance }, { transaction });
    
    // 创建消费记录
    await ConsumeRecord.create({
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
      message: `消费成功：¥${amount.toFixed(2)}`
    });
    
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ 
      success: false, 
      message: '消费失败: ' + error.message 
    });
  }
};

// 获取消费记录列表
const getConsumeRecords = async (req, res) => {
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
            [sequelize.Op.or]: [
              { name: { [sequelize.Op.like]: `%${search}%` } },
              { phone: { [sequelize.Op.like]: `%${search}%` } }
            ]
          }
        }
      ];
    }
    
    const { count, rows } = await ConsumeRecord.findAndCountAll(options);
    
    res.json({ 
      success: true, 
      data: {
        records: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / pageSize)
      },
      message: '获取消费记录成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '获取消费记录失败: ' + error.message 
    });
  }
};

module.exports = {
  consume,
  getConsumeRecords
};