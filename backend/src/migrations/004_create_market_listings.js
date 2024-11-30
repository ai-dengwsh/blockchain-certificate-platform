module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('market_listings', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      token_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      seller_address: {
        type: Sequelize.STRING(42),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(65, 0),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'sold', 'canceled'),
        defaultValue: 'active'
      },
      tx_hash: {
        type: Sequelize.STRING(66),
        allowNull: false
      },
      buyer_address: {
        type: Sequelize.STRING(42),
        allowNull: true
      },
      sold_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('market_listings', ['seller_address']);
    await queryInterface.addIndex('market_listings', ['token_id']);
    await queryInterface.addIndex('market_listings', ['status']);
    await queryInterface.addIndex('market_listings', ['price']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('market_listings');
  }
};
