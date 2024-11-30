const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // 自定义错误
  if (err.isCustom) {
    return res.status(err.status).json({
      code: err.status,
      message: err.message
    });
  }

  // Sequelize错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      code: 400,
      message: '数据验证错误',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      code: 400,
      message: '数据已存在',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Web3错误
  if (err.message.includes('Web3')) {
    return res.status(500).json({
      code: 500,
      message: '区块链交互错误',
      error: err.message
    });
  }

  // 默认错误
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
};

module.exports = errorHandler;
