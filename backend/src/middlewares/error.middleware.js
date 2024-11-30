const { ValidationError } = require('sequelize');
const {
  BaseError,
  AuthenticationError,
  NotFoundError,
  ValidationError: CustomValidationError,
  BlockchainError
} = require('../utils/errors');

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 自定义错误处理
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // Sequelize验证错误
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: '数据验证失败',
        details: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    });
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: '认证失败'
      }
    });
  }

  // Web3错误
  if (err.message && err.message.includes('Web3')) {
    return res.status(500).json({
      error: {
        code: 'BLOCKCHAIN_ERROR',
        message: '区块链交互失败',
        details: err.message
      }
    });
  }

  // 默认错误处理
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误'
    }
  });
};

/**
 * 404错误处理中间件
 */
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError('请求的资源不存在'));
};

/**
 * 请求验证中间件
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        throw new CustomValidationError('请求数据验证失败', {
          details: error.details.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * 异步错误处理包装器
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  validateRequest,
  asyncHandler
};
