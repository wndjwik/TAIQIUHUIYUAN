const sequelize = require('./database');

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite 数据库连接成功！');
  } catch (error) {
    console.error('❌ SQLite 数据库连接失败:', error);
  }
};

testConnection();

module.exports = sequelize;