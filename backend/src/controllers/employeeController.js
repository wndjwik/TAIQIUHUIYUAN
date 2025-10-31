const Employee = require('../models/Employee');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt'); // 假设项目已经安装了bcrypt

// 获取所有员工
const getAllEmployees = async (req, res) => {
  console.log('收到获取员工列表请求:', req.query);
  try {
    const employees = await Employee.findAll({
      order: [['createdAt', 'DESC']]
    });
    console.log('查询到员工数量:', employees.length);
    res.json({ 
      success: true, 
      data: employees,
      message: '获取员工列表成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '获取员工列表失败: ' + error.message 
    });
  }
};

// 获取单个员工
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: '员工不存在'
      });
    }
    
    res.json({ 
      success: true, 
      data: employee,
      message: '获取员工信息成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '获取员工信息失败: ' + error.message 
    });
  }
};

// 创建新员工
const createEmployee = async (req, res) => {
  try {
    const { name, phone, password, role = 'employee' } = req.body;
    
    // 验证必填字段
    if (!name || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '姓名、手机号和密码不能为空'
      });
    }
    
    // 验证角色
    const validRoles = ['admin', 'employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: '无效的角色，只能设置为管理员或员工'
      });
    }
    
    // 自动生成员工编号，从0开始自增
    // 查找当前最大的员工编号
    const maxEmployee = await Employee.findOne({
      order: [["employee_id", "DESC"]]
    });
    
    // 确保生成有效的数字ID
    let nextId = 0;
    if (maxEmployee && maxEmployee.employee_id) {
      // 安全地转换为数字
      const currentMaxId = parseInt(maxEmployee.employee_id, 10);
      nextId = isNaN(currentMaxId) ? 0 : currentMaxId + 1;
    }
    
    const employee_id = nextId.toString();
    
    // 检查手机号是否已存在
    // 注意：员工编号已经通过生成逻辑保证唯一性，但为了双重保险，这里也可以添加检查
    const existingEmployee = await Employee.findOne({
      where: { phone }
    });
    
    if (existingEmployee) {
      return res.status(400).json({ 
        success: false, 
        message: '手机号已存在'
      });
    }
    
    // 密码加密（如果bcrypt可用）
    let hashedPassword = password;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.warn('密码加密失败，使用原始密码（仅用于开发环境）:', hashError.message);
    }
    
    // 创建员工
    const employee = await Employee.create({
      employee_id,
      name,
      phone,
      password: hashedPassword,
      role,
      status: 'active' // 明确设置状态为激活
    });
    
    // 不返回密码信息
    const { password: _, ...employeeData } = employee.dataValues;
    
    res.json({ 
      success: true, 
      data: employeeData,
      message: '创建员工成功'
    });
  } catch (error) {
    // 记录详细错误信息
    console.error('创建员工失败详情:', error);
    // 处理Sequelize验证错误
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message).join(', ');
      res.status(400).json({ 
        success: false, 
        message: '创建员工失败: ' + validationErrors 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: '创建员工失败: ' + error.message 
      });
    }
  }
};

// 更新员工信息
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, status } = req.body;
    
    // 验证角色
    if (role) {
      const validRoles = ['admin', 'employee'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          success: false, 
          message: '无效的角色，只能设置为管理员或员工'
        });
      }
    }
    
    const employee = await Employee.findByPk(id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: '员工不存在'
      });
    }
    
    // 如果更新手机号，检查是否与其他员工重复
    if (phone && phone !== employee.phone) {
      const existingPhone = await Employee.findOne({
        where: { phone, employee_id: { [Op.ne]: id } }
      });
      
      if (existingPhone) {
        return res.status(400).json({ 
          success: false, 
          message: '手机号已被其他员工使用'
        });
      }
    }
    
    // 更新员工信息
    await employee.update({
      name: name || employee.name,
      phone: phone || employee.phone,
      role: role || employee.role,
      status: status !== undefined ? status : employee.status
    });
    
    // 不返回密码信息
    const { password: _, ...employeeData } = employee.dataValues;
    
    res.json({ 
      success: true, 
      data: employeeData,
      message: '更新员工信息成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '更新员工信息失败: ' + error.message 
    });
  }
};

// 修改员工密码
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '原密码和新密码不能为空'
      });
    }
    
    const employee = await Employee.findByPk(id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: '员工不存在'
      });
    }
    
    // 验证原密码
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(oldPassword, employee.password);
    } catch (compareError) {
      // 如果加密验证失败，尝试直接比较（用于开发环境）
      isPasswordValid = oldPassword === employee.password;
    }
    
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: '原密码错误'
      });
    }
    
    // 加密新密码
    let hashedPassword = newPassword;
    try {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    } catch (hashError) {
      console.warn('密码加密失败，使用原始密码（仅用于开发环境）:', hashError.message);
    }
    
    // 更新密码
    await employee.update({ password: hashedPassword });
    
    res.json({ 
      success: true, 
      message: '密码修改成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '修改密码失败: ' + error.message 
    });
  }
};

// 删除员工
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 使用employee_id查询，而不是id
    const employee = await Employee.findOne({ where: { employee_id: id } });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: '员工不存在'
      });
    }
    
    await employee.destroy();
    
    res.json({ 
      success: true, 
      message: '删除员工成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '删除员工失败: ' + error.message 
    });
  }
};

// 员工登录
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '手机号和密码不能为空'
      });
    }
    
    // 查找员工
    const employee = await Employee.findOne({ where: { phone } });
    
    if (!employee || employee.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: '员工不存在或已停用'
      });
    }
    
    // 验证密码
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, employee.password);
    } catch (compareError) {
      // 如果加密验证失败，尝试直接比较（用于开发环境）
      isPasswordValid = password === employee.password;
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: '密码错误'
      });
    }
    
    // 不返回密码信息
    const { password: _, ...employeeData } = employee.dataValues;
    
    res.json({ 
      success: true, 
      data: employeeData,
      message: '登录成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '登录失败: ' + error.message 
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  changePassword,
  deleteEmployee,
  login
};