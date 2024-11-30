const User = require('./user.model');
const Certificate = require('./certificate.model');
const Transaction = require('./transaction.model');
const MarketListing = require('./market-listing.model');

// 定义模型关联关系
User.hasMany(Certificate, {
  foreignKey: 'owner_address',
  sourceKey: 'wallet_address',
  as: 'certificates'
});
Certificate.belongsTo(User, {
  foreignKey: 'owner_address',
  targetKey: 'wallet_address',
  as: 'owner'
});

User.hasMany(MarketListing, {
  foreignKey: 'seller_address',
  sourceKey: 'wallet_address',
  as: 'listings'
});
MarketListing.belongsTo(User, {
  foreignKey: 'seller_address',
  targetKey: 'wallet_address',
  as: 'seller'
});

Certificate.hasMany(MarketListing, {
  foreignKey: 'token_id',
  sourceKey: 'token_id',
  as: 'listings'
});
MarketListing.belongsTo(Certificate, {
  foreignKey: 'token_id',
  targetKey: 'token_id',
  as: 'certificate'
});

User.hasMany(Transaction, {
  foreignKey: 'from_address',
  sourceKey: 'wallet_address',
  as: 'sentTransactions'
});
User.hasMany(Transaction, {
  foreignKey: 'to_address',
  sourceKey: 'wallet_address',
  as: 'receivedTransactions'
});
Transaction.belongsTo(User, {
  foreignKey: 'from_address',
  targetKey: 'wallet_address',
  as: 'sender'
});
Transaction.belongsTo(User, {
  foreignKey: 'to_address',
  targetKey: 'wallet_address',
  as: 'receiver'
});

Certificate.hasMany(Transaction, {
  foreignKey: 'token_id',
  sourceKey: 'token_id',
  as: 'transactions'
});
Transaction.belongsTo(Certificate, {
  foreignKey: 'token_id',
  targetKey: 'token_id',
  as: 'certificate'
});

module.exports = {
  User,
  Certificate,
  Transaction,
  MarketListing
};
