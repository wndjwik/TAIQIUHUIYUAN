const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

/**
 * @route   GET /api/employees
 * @desc    获取所有员工列表
 * @access  Private
 */
router.get('/', employeeController.getAllEmployees);

/**
 * @route   GET /api/employees/:id
 * @desc    根据ID获取单个员工信息
 * @access  Private
 */
router.get('/:id', employeeController.getEmployeeById);

/**
 * @route   POST /api/employees
 * @desc    创建新员工
 * @access  Private (需要管理员权限)
 */
router.post('/', employeeController.createEmployee);

/**
 * @route   PUT /api/employees/:id
 * @desc    更新员工信息
 * @access  Private (需要管理员权限或本人)
 */
router.put('/:id', employeeController.updateEmployee);

/**
 * @route   PUT /api/employees/:id/password
 * @desc    修改员工密码
 * @access  Private
 */
router.put('/:id/password', employeeController.changePassword);

/**
 * @route   DELETE /api/employees/:id
 * @desc    删除员工
 * @access  Private (需要管理员权限)
 */
router.delete('/:id', employeeController.deleteEmployee);

/**
 * @route   POST /api/employees/login
 * @desc    员工登录
 * @access  Public
 */
router.post('/login', employeeController.login);

module.exports = router;