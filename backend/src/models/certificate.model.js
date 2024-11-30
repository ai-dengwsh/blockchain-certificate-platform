const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '凭证ID'
  },
  token_id: {
    type: DataTypes.BIGINT,
    unique: true,
    allowNull: false,
    comment: 'NFT Token ID'
  },
  owner_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    comment: '所有者钱包地址',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  ipfs_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'IPFS哈希值'
  },
  metadata: {
    type: DataTypes.JSON,
    comment: '凭证元数据'
  },
  status: {
    type: DataTypes.ENUM('valid', 'invalid'),
    defaultValue: 'valid',
    comment: '凭证状态'
  },
  tx_hash: {
    type: DataTypes.STRING(66),
    allowNull: false,
    comment: '交易哈希',
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  }
}, {
  tableName: 'certificates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['owner_address']
    },
    {
      fields: ['status']
    },
    {
      fields: ['token_id']
    }
  ]
});

// 类方法
Certificate.findByTokenId = function(tokenId) {
  return this.findOne({ where: { token_id: tokenId } });
};

Certificate.findByOwner = function(ownerAddress) {
  return this.findAll({ 
    where: { owner_address: ownerAddress },
    order: [['created_at', 'DESC']]
  });
};

Certificate.invalidate = function(tokenId) {
  return this.update(
    { status: 'invalid' },
    { where: { token_id: tokenId } }
  );
};

module.exports = Certificate;
