/**
 * 基础错误类
 */
class BaseError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 认证错误
 */
class AuthenticationError extends BaseError {
  constructor(message = '认证失败') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * 授权错误
 */
class AuthorizationError extends BaseError {
  constructor(message = '没有权限') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * 资源未找到错误
 */
class NotFoundError extends BaseError {
  constructor(message = '资源不存在') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

/**
 * 验证错误
 */
class ValidationError extends BaseError {
  constructor(message = '数据验证失败', details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * 区块链错误
 */
class BlockchainError extends BaseError {
  constructor(message = '区块链交互失败', details = null) {
    super(message, 500, 'BLOCKCHAIN_ERROR');
    this.details = details;
  }
}

/**
 * 业务逻辑错误
 */
class BusinessError extends BaseError {
  constructor(message, code = 'BUSINESS_ERROR') {
    super(message, 400, code);
  }
}

module.exports = {
  BaseError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  BlockchainError,
  BusinessError
};
