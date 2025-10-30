const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const RechargeRecord = sequelize.define('RechargeRecord', {
  member_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  member_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  operator: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'recharge_records',
  timestamps: true, // 自动添加 createdAt (充值时间)
});

module.exports = RechargeRecord;