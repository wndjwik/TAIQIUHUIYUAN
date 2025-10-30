const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ConsumeRecord = sequelize.define('ConsumeRecord', {
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
  tableName: 'consume_records',
  timestamps: true, // 自动添加 createdAt (消费时间)
});

module.exports = ConsumeRecord;