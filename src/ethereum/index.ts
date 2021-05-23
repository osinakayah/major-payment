import { mnemonicToSeed } from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import { ICoin, InitiatedTransaction } from '../interface/i.coin';
import { CoinAddressDto } from '../interface/i.coin';
import { assets, currencyToUnit } from '@liquality/cryptoassets';
import axios, { AxiosResponse } from 'axios';
import BigNumber from 'bignumber.js';

const SeedPhrase = require('../../models').SeedPhrase;
const EthereumAddress = require('../../models').EthereumAddress;

export class Ethereum implements ICoin {
  public code: string = 'ETH';
  public name: string = 'Ethereum';

  async generateAddress(): Promise<CoinAddressDto> {
    const seedPhrase = await SeedPhrase.findOne({});

    if (seedPhrase) {
      const seed = await mnemonicToSeed(seedPhrase.mnemonic);

      const hdwallet = hdkey.fromMasterSeed(seed);

      const masterPrivateKey = hdwallet.privateExtendedKey();
      const masterPublicKey = hdwallet.publicExtendedKey();

      const lastIndex: number = await this.getAddressIndex();
      const wallet = hdwallet.derivePath(`m/44'/60'/0'/0/${lastIndex}`).getWallet();

      return {
        publicKey: wallet.getPublicKeyString(),
        privateKey: wallet.getPrivateKeyString(),
        address: wallet.getAddressString(),
        addressIndex: lastIndex,
        seedPhraseId: seedPhrase.id,
      };
    }
    throw new Error('No seed phrase found');
  }

  async getAddressIndex(): Promise<number> {
    const lastEthAddress = await EthereumAddress.findOne({
      order: [['createdAt', 'desc']],
    });
    if (lastEthAddress) {
      return lastEthAddress.addressIndex + 1;
    }
    return 0;
  }

  async initiateTransaction(
    reference: string,
    fiatAmount: number,
    fiatCurrency: string,
    rate: number,
  ): Promise<InitiatedTransaction> {
    const existingEthereumPayment = await EthereumAddress.findOne({
      where: {
        reference,
      },
    });
    if (existingEthereumPayment) {
      return {
        address: existingEthereumPayment.address,
        fiatAmount: existingEthereumPayment.fiatAmount,
        coinAmount: existingEthereumPayment.coinAmount,
        reference: existingEthereumPayment.reference,
        paymentStatus: existingEthereumPayment.paymentStatus,
      };
    }
    const coinAmount = currencyToUnit(assets.ETH, fiatAmount / rate).toString();
    const addressData = await this.generateAddress();

    const ethereumTransaction = await EthereumAddress.create({
      ...addressData,
      fiatAmount,
      coinAmount,
      reference,
    });
    return {
      address: ethereumTransaction.address,
      fiatAmount: ethereumTransaction.fiatAmount,
      coinAmount: ethereumTransaction.coinAmount,
      reference: ethereumTransaction.reference,
      paymentStatus: ethereumTransaction.paymentStatus,
    };
  }
  async confirmDeposit(reference: string): Promise<boolean> {
    const existingEthereumPayment = await EthereumAddress.findOne({
      where: {
        reference,
      },
    });
    if (existingEthereumPayment) {
      if (existingEthereumPayment.paymentStatus === 'paid' || existingEthereumPayment.paymentStatus === 'overpaid') {
        return true;
      }
    }
    return false;
  }

  async queryExplorer(reference: string): Promise<boolean> {
    try {
      const existingPayment = await EthereumAddress.findOne({
        where: {
          reference,
        },
      });
      if (existingPayment && existingPayment.paymentStatus === 'unpaid') {
        // const address:string = existingPayment.address;

        const address: string = '0xb5367dC03381e33c61457134C1ddeafF97BB15Fe';
        const endpoint = `https://api.blockcypher.com/v1/eth/main/addrs/${address}/balance`;
        const response: AxiosResponse = await axios.get(endpoint);
        const { data } = response;
        const bnFinalBalance = new BigNumber(data.total_received);
        console.log(data.total_received, 'data.total_received');
        if (bnFinalBalance.gte(existingPayment.coinAmount)) {
          await EthereumAddress.update(
            {
              paymentStatus: 'paid',
            },
            {
              where: {
                reference,
              },
            },
          );
          return true;
        }
      } else if (
        existingPayment &&
        (existingPayment.paymentStatus === 'paid' || existingPayment.paymentStatus === 'overpaid')
      ) {
        return true;
      }
      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
