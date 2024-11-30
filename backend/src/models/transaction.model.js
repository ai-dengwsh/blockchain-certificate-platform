const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '交易ID'
  },
  tx_hash: {
    type: DataTypes.STRING(66),
    unique: true,
    allowNull: false,
    comment: '交易哈希',
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  from_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    comment: '发送方地址',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  to_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    comment: '接收方地址',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  amount: {
    type: DataTypes.DECIMAL(65, 0),
    comment: '交易金额'
  },
  token_id: {
    type: DataTypes.BIGINT,
    comment: '相关Token ID'
  },
  type: {
    type: DataTypes.ENUM('transfer', 'mint', 'burn', 'list', 'buy', 'cancel'),
    allowNull: false,
    comment: '交易类型'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
    comment: '交易状态'
  },
  gas_used: {
    type: DataTypes.BIGINT,
    comment: 'Gas消耗'
  },
  gas_price: {
    type: DataTypes.BIGINT,
    comment: 'Gas价格'
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['from_address']
    },
    {
      fields: ['to_address']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    }
  ]
});

// 类方法
Transaction.findByHash = function(txHash) {
  return this.findOne({ where: { tx_hash: txHash } });
};

Transaction.findByAddress = function(address) {
  return this.findAll({
    where: {
      [sequelize.Op.or]: [
        { from_address: address },
        { to_address: address }
      ]
    },
    order: [['created_at', 'DESC']]
  });
};

Transaction.findByToken = function(tokenId) {
  return this.findAll({
    where: { token_id: tokenId },
    order: [['created_at', 'DESC']]
  });
};

Transaction.updateStatus = function(txHash, status) {
  return this.update(
    { status },
    { where: { tx_hash: txHash } }
  );
};

module.exports = Transaction;
