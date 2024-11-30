const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MarketListing = sequelize.define('MarketListing', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  token_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  seller_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  price: {
    type: DataTypes.DECIMAL(65, 0),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'sold', 'canceled'),
    defaultValue: 'active'
  },
  tx_hash: {
    type: DataTypes.STRING(66),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  buyer_address: {
    type: DataTypes.STRING(42),
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  sold_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'market_listings',
  timestamps: true,
  underscored: true
});

module.exports = MarketListing;
