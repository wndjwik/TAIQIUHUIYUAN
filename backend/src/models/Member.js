const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Member = sequelize.define('Member', {
  member_id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: '男',
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
}, {
  tableName: 'members',
  timestamps: true, // 自动添加 createdAt 和 updatedAt
});

module.exports = Member;