'use strict';
module.exports = (sequelize, DataTypes) => {
  const BitcoinAddress = sequelize.define('BitcoinAddress', {
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
  BitcoinAddress.associate = function(models) {
    // associations can be defined here
  };
  return BitcoinAddress;
};
