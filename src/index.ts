require('dotenv').config();

import { Ethereum } from './ethereum';
import { generateMnemonic, validateMnemonic } from 'bip39';

const SeedPhrase = require('../models').SeedPhrase;
export { Ethereum };

export const saveMnemonic = async (mnemonicPhrase?: string) => {
  const data = {
    mnemonic: '',
  };
  if (typeof mnemonicPhrase === 'undefined') {
    data.mnemonic =  generateMnemonic()
  }
  else if (mnemonicPhrase && validateMnemonic(mnemonicPhrase)) {
    data.mnemonic = mnemonicPhrase
  } else {
    throw new Error('Error generating mnemonic')
  }

  const existingMnemonic = await SeedPhrase.findOne({
    where: {
      mnemonic: data.mnemonic,
    },
  });
  if (existingMnemonic) {
    return existingMnemonic;
  }
  return SeedPhrase.create(data);
};
