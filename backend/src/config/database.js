const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite 配置 - 数据存储在项目根目录的 database.sqlite 文件中
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'), // 数据库文件路径
  logging: false, // 关闭SQL日志输出（生产环境可开启）
});

module.exports = sequelize;