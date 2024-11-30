const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  tx_hash: {
    type: DataTypes.STRING(66),
    unique: true,
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  from_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  to_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  amount: {
    type: DataTypes.DECIMAL(65, 0),
    allowNull: true
  },
  token_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('transfer', 'mint', 'burn', 'list', 'buy', 'cancel'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  gas_used: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  gas_price: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true
});

module.exports = Transaction;
