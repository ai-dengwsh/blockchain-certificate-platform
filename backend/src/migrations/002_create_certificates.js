module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('certificates', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      token_id: {
        type: Sequelize.BIGINT,
        unique: true,
        allowNull: false
      },
      owner_address: {
        type: Sequelize.STRING(42),
        allowNull: false
      },
      ipfs_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('valid', 'invalid'),
        defaultValue: 'valid'
      },
      tx_hash: {
        type: Sequelize.STRING(66),
        allowNull: false
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

    await queryInterface.addIndex('certificates', ['owner_address']);
    await queryInterface.addIndex('certificates', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('certificates');
  }
};
