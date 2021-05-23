import { mnemonicToSeed } from 'bip39';
import { payments, Network } from 'bitcoinjs-lib';
import { ICoin, InitiatedTransaction } from '../interface/i.coin';
import { CoinAddressDto } from '../interface/i.coin';
import axios, { AxiosResponse } from 'axios';
import { assets, currencyToUnit } from '@liquality/cryptoassets';
import BigNumber from 'bignumber.js';

const SeedPhrase = require('../../models').SeedPhrase;
const BitcoinAddress = require('../../models').BitcoinAddress;
const bip32 = require('bip32');

export class Bitcoin implements ICoin {
  public code: string = 'BTC';
  public name: string = 'Bitcoin';

  async generateAddress(): Promise<CoinAddressDto> {
    const seedPhrase = await SeedPhrase.findOne({});

    if (seedPhrase) {
      const seed = await mnemonicToSeed(seedPhrase.mnemonic);
      const root = bip32.fromSeed(seed);
      const masterPrivateKey = root.privateKey.toString('hex');
      const masterPublicKey = root.publicKey.toString('hex');

      const i = await this.getAddressIndex();
      const child1 = root.derivePath(`m/44'/0'/0'/0/${i}`);
      const address = Bitcoin.getAddress(child1);

      return {
        publicKey: child1.publicKey.toString('hex'),
        privateKey: child1.privateKey.toString('hex'),
        address: address,
        addressIndex: i,
        seedPhraseId: seedPhrase.id,
      };
    }
    throw new Error('Error generating BTC address');
  }

  async getAddressIndex(): Promise<number> {
    const lastBtcAddress = await BitcoinAddress.findOne({
      order: [['createdAt', 'desc']],
    });
    if (lastBtcAddress) {
      return lastBtcAddress.addressIndex + 1;
    }
    return 0;
  }

  public async initiateTransaction(
    reference: string,
    fiatAmount: number,
    fiatCurrency: string,
    rate: number,
  ): Promise<InitiatedTransaction> {
    const existingBitcoinPayment = await BitcoinAddress.findOne({
      where: {
        reference,
      },
    });
    if (existingBitcoinPayment) {
      return {
        address: existingBitcoinPayment.address,
        fiatAmount: existingBitcoinPayment.fiatAmount,
        coinAmount: existingBitcoinPayment.coinAmount,
        reference: existingBitcoinPayment.reference,
        paymentStatus: existingBitcoinPayment.paymentStatus,
      };
    }

    const coinAmount = currencyToUnit(assets.BTC, fiatAmount / rate).toString();
    const addressData = await this.generateAddress();

    const bitcoinAddress = await BitcoinAddress.create({
      ...addressData,
      fiatAmount,
      coinAmount,
      reference,
    });
    return {
      address: bitcoinAddress.address,
      fiatAmount: bitcoinAddress.fiatAmount,
      coinAmount: bitcoinAddress.coinAmount,
      reference: bitcoinAddress.reference,
      paymentStatus: bitcoinAddress.paymentStatus,
    };
  }

  private static getAddress(node: any, network?: Network): string {
    const address = payments.p2pkh({ pubkey: node.publicKey, network }).address;
    if (address) {
      return address;
    }
    throw new Error('Error generating BTC address');
  }

  async confirmDeposit(reference: string): Promise<boolean> {
    const existingBitcoinPayment = await BitcoinAddress.findOne({
      where: {
        reference,
      },
    });
    if (existingBitcoinPayment) {
      if (existingBitcoinPayment.paymentStatus === 'paid' || existingBitcoinPayment.paymentStatus === 'overpaid') {
        return true;
      }
    }
    return false;
  }

  async queryExplorer(reference: string): Promise<boolean> {
    try {
      const existingPayment = await BitcoinAddress.findOne({
        where: {
          reference,
        },
      });
      if (existingPayment && existingPayment.paymentStatus === 'unpaid') {
        const address: string = existingPayment.address;
        const endpoint = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`;
        const response: AxiosResponse = await axios.get(endpoint);
        const { data } = response;
        const bnFinalBalance = new BigNumber(data.final_balance);
        if (bnFinalBalance.gte(existingPayment.coinAmount)) {
          await BitcoinAddress.update(
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
