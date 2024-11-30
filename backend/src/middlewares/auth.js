const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, config.app.jwtSecret);
    
    const user = await User.findOne({
      where: { id: decoded.id, status: 'active' }
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: '认证失败'
    });
  }
};

module.exports = auth;
