'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('EthereumAddresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      publicKey: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      privateKey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      addressIndex: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      seedPhraseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SeedPhrases',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fiatAmount: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      coinAmount: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      paymentStatus: {
        type: Sequelize.ENUM('unpaid', 'paid', 'underpaid', 'overpaid'),
        allowNull: false,
        defaultValue: 'unpaid'
      },
      fromAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('EthereumAddresses');
  }
};
