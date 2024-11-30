const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const { AuthenticationError } = require('../utils/errors');

/**
 * JWT认证中间件
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthenticationError('未提供认证令牌');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('无效的认证令牌格式');
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new AuthenticationError('用户不存在');
    }

    if (user.status !== 'active') {
      throw new AuthenticationError('用户账号已被禁用');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('无效的认证令牌'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('认证令牌已过期'));
    } else {
      next(error);
    }
  }
};

/**
 * 钱包地址验证中间件
 */
const validateWalletAddress = async (req, res, next) => {
  try {
    const { wallet_address } = req.body;
    if (!wallet_address) {
      throw new AuthenticationError('未提供钱包地址');
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      throw new AuthenticationError('无效的钱包地址格式');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 权限验证中间件
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('需要登录'));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AuthenticationError('没有足够的权限'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  validateWalletAddress,
  authorize
};
