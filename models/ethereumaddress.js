'use strict';
module.exports = (sequelize, DataTypes) => {
  const EthereumAddress = sequelize.define('EthereumAddress', {
    publicKey: DataTypes.STRING,
    privateKey: DataTypes.STRING,
    address: DataTypes.STRING,
    addressIndex: DataTypes.INTEGER,
    seedPhraseId: DataTypes.INTEGER,
    fiatAmount: DataTypes.STRING,
    coinAmount: DataTypes.STRING,
    reference: DataTypes.STRING,
    paymentStatus: DataTypes.ENUM('unpaid', 'paid', 'underpaid', 'overpaid'),
    fromAddress: DataTypes.STRING,
  }, {});
  EthereumAddress.associate = function(models) {
    EthereumAddress.belongsTo(models.SeedPhrase, {
      as: 'SeedPhrase',
      foreignKey: 'seedPhraseId',
      onDelete: 'CASCADE',
      hooks: true,
    })
  };
  return EthereumAddress;
};
