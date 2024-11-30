const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MarketListing = sequelize.define('MarketListing', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '挂单ID'
  },
  token_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'NFT Token ID'
  },
  seller_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    comment: '卖家地址',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  price: {
    type: DataTypes.DECIMAL(65, 0),
    allowNull: false,
    comment: '售价'
  },
  status: {
    type: DataTypes.ENUM('active', 'sold', 'canceled'),
    defaultValue: 'active',
    comment: '挂单状态'
  },
  tx_hash: {
    type: DataTypes.STRING(66),
    allowNull: false,
    comment: '交易哈希',
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  buyer_address: {
    type: DataTypes.STRING(42),
    comment: '买家地址',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  sold_at: {
    type: DataTypes.DATE,
    comment: '售出时间'
  }
}, {
  tableName: 'market_listings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['seller_address']
    },
    {
      fields: ['token_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['price']
    }
  ]
});

// 类方法
MarketListing.findActiveListings = function(options = {}) {
  const { limit = 10, offset = 0, minPrice, maxPrice, sort = 'created_desc' } = options;

  const where = { status: 'active' };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price[sequelize.Op.gte] = minPrice;
    if (maxPrice !== undefined) where.price[sequelize.Op.lte] = maxPrice;
  }

  const order = [];
  switch (sort) {
    case 'price_asc':
      order.push(['price', 'ASC']);
      break;
    case 'price_desc':
      order.push(['price', 'DESC']);
      break;
    case 'created_asc':
      order.push(['created_at', 'ASC']);
      break;
    default:
      order.push(['created_at', 'DESC']);
  }

  return this.findAndCountAll({
    where,
    order,
    limit,
    offset
  });
};

MarketListing.findByToken = function(tokenId) {
  return this.findOne({
    where: {
      token_id: tokenId,
      status: 'active'
    }
  });
};

MarketListing.findBySeller = function(sellerAddress) {
  return this.findAll({
    where: { seller_address: sellerAddress },
    order: [['created_at', 'DESC']]
  });
};

MarketListing.markAsSold = function(id, buyerAddress) {
  return this.update(
    {
      status: 'sold',
      buyer_address: buyerAddress,
      sold_at: sequelize.literal('CURRENT_TIMESTAMP')
    },
    { where: { id } }
  );
};

MarketListing.cancelListing = function(id) {
  return this.update(
    { status: 'canceled' },
    { where: { id } }
  );
};

MarketListing.getMarketStats = async function() {
  const [[totalVolume], [floorPrice], [totalListings]] = await Promise.all([
    // 计算总交易量
    sequelize.query(`
      SELECT COALESCE(SUM(price), 0) as total_volume 
      FROM market_listings 
      WHERE status = 'sold'
    `),
    // 获取地板价
    sequelize.query(`
      SELECT MIN(price) as floor_price 
      FROM market_listings 
      WHERE status = 'active'
    `),
    // 获取活跃挂单数量
    sequelize.query(`
      SELECT COUNT(*) as total_listings 
      FROM market_listings 
      WHERE status = 'active'
    `)
  ]);

  return {
    totalVolume: totalVolume?.total_volume || '0',
    floorPrice: floorPrice?.floor_price || '0',
    totalListings: totalListings?.total_listings || 0
  };
};

module.exports = MarketListing;
