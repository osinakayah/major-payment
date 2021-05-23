export interface CoinAddressDto {
  publicKey: string;
  privateKey: string;
  address: string;
  addressIndex: number;
  seedPhraseId: number;
}

export interface InitiatedTransaction {
  address: string;
  fiatAmount: number;
  coinAmount: number;
  reference: string;
  paymentStatus: string;
}

export interface ICoin {
  name: string;
  code: string;
  initiateTransaction: (
    reference: string,
    fiatAmount: number,
    fiatCurrency: string,
    rate: number,
  ) => Promise<InitiatedTransaction>;
  generateAddress: () => Promise<CoinAddressDto>;
  getAddressIndex: () => Promise<number>;
  confirmDeposit: (reference: string) => Promise<boolean>;
  queryExplorer: (address: string) => void;
}
