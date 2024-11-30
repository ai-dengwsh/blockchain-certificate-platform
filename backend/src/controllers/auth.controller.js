const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const config = require('../config/config');

class AuthController {
  // 用户注册
  async register(req, res, next) {
    try {
      const { username, password, email, walletAddress } = req.body;

      // 验证用户名和邮箱是否已存在
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          code: 400,
          message: '用户名或邮箱已存在'
        });
      }

      // 创建新用户
      const user = await User.create({
        username,
        password_hash: password,
        email,
        wallet_address: walletAddress,
        status: 'active'
      });

      // 生成JWT令牌
      const token = jwt.sign(
        { id: user.id },
        config.app.jwtSecret,
        { expiresIn: config.app.jwtExpiresIn }
      );

      res.status(201).json({
        code: 201,
        message: '注册成功',
        data: {
          userId: user.id,
          username: user.username,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 用户登录
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // 查找用户
      const user = await User.findOne({
        where: { username }
      });

      if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({
          code: 401,
          message: '用户名或密码错误'
        });
      }

      if (user.status !== 'active') {
        return res.status(403).json({
          code: 403,
          message: '账户已被禁用'
        });
      }

      // 生成JWT令牌
      const token = jwt.sign(
        { id: user.id },
        config.app.jwtSecret,
        { expiresIn: config.app.jwtExpiresIn }
      );

      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          userInfo: {
            userId: user.id,
            username: user.username,
            walletAddress: user.wallet_address
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取用户信息
  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'email', 'wallet_address', 'status', 'created_at']
      });

      res.json({
        code: 200,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新用户信息
  async updateProfile(req, res, next) {
    try {
      const { email, walletAddress } = req.body;
      const user = req.user;

      // 更新用户信息
      await user.update({
        email: email || user.email,
        wallet_address: walletAddress || user.wallet_address
      });

      res.json({
        code: 200,
        message: '更新成功',
        data: {
          userId: user.id,
          username: user.username,
          email: user.email,
          walletAddress: user.wallet_address
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 修改密码
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = req.user;

      // 验证旧密码
      if (!(await user.validatePassword(oldPassword))) {
        return res.status(400).json({
          code: 400,
          message: '旧密码错误'
        });
      }

      // 更新密码
      user.password_hash = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({
        code: 200,
        message: '密码修改成功'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
