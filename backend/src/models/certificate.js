const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  token_id: {
    type: DataTypes.BIGINT,
    unique: true,
    allowNull: false
  },
  owner_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  ipfs_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('valid', 'invalid'),
    defaultValue: 'valid'
  },
  tx_hash: {
    type: DataTypes.STRING(66),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  }
}, {
  tableName: 'certificates',
  timestamps: true,
  underscored: true
});

module.exports = Certificate;
