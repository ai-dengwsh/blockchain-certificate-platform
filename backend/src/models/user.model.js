const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户ID'
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: '用户名'
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码哈希'
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    comment: '邮箱',
    validate: {
      isEmail: true
    }
  },
  wallet_address: {
    type: DataTypes.STRING(42),
    unique: true,
    comment: '钱包地址',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    defaultValue: 'active',
    comment: '用户状态'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['wallet_address']
    },
    {
      fields: ['status']
    }
  ]
});

// 密码哈希中间件
User.beforeCreate(async (user) => {
  if (user.changed('password_hash')) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

// 实例方法
User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

// 类方法
User.findByWalletAddress = function(walletAddress) {
  return this.findOne({ where: { wallet_address: walletAddress } });
};

User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

module.exports = User;
