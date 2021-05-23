'use strict';
module.exports = (sequelize, DataTypes) => {
  const SeedPhrase = sequelize.define('SeedPhrase', {
    mnemonic: DataTypes.STRING
  }, {});
  SeedPhrase.associate = function(models) {
    SeedPhrase.hasMany(models.EthereumAddress, {
      as: 'EthereumAddress',
      foreignKey: 'seedPhraseId',
      onDelete: 'CASCADE',
      hooks: true,
    })
  };
  return SeedPhrase;
};
