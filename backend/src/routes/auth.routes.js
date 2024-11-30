const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');
const { body } = require('express-validator');

// 输入验证中间件
const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度必须至少为6个字符'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('请输入有效的钱包地址')
];

const validateLogin = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
];

// 注册
router.post('/register', validateRegister, authController.register);

// 登录
router.post('/login', validateLogin, authController.login);

// 获取用户信息
router.get('/profile', auth, authController.getProfile);

// 更新用户信息
router.put('/profile', auth, authController.updateProfile);

// 修改密码
router.post('/change-password', auth, authController.changePassword);

module.exports = router;
