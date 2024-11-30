module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      tx_hash: {
        type: Sequelize.STRING(66),
        unique: true,
        allowNull: false
      },
      from_address: {
        type: Sequelize.STRING(42),
        allowNull: false
      },
      to_address: {
        type: Sequelize.STRING(42),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(65, 0),
        allowNull: true
      },
      token_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('transfer', 'mint', 'burn', 'list', 'buy', 'cancel'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      gas_used: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      gas_price: {
        type: Sequelize.BIGINT,
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

    await queryInterface.addIndex('transactions', ['from_address']);
    await queryInterface.addIndex('transactions', ['to_address']);
    await queryInterface.addIndex('transactions', ['status']);
    await queryInterface.addIndex('transactions', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
  }
};
