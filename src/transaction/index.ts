import { Ethereum } from '../ethereum';
import { Bitcoin } from '../bitcoin';
import axios, { AxiosResponse } from 'axios';
import * as Queue from 'bull';
import { Job } from 'bull';

export class Transaction {
  private transactionQueue: Queue.Queue;
  private bitcoin: Bitcoin;
  private ethereum: Ethereum;

  constructor() {
    this.bitcoin = new Bitcoin();
    this.ethereum = new Ethereum();

    // @ts-ignore
    const redisPort: string = process.env.REDIS_PORT ? process.env.REDIS_PORT : 6379;
    this.transactionQueue = new Queue('pendingTransaction', {
      redis: {
        port: parseInt(redisPort),
        host: process.env.REDIS_HOST,
      },
    });
    this.transactionQueue.on('completed', (job: Job) => {
      console.log(`Job with id ${job.id} has been completed`);
      job.remove();
    });
    this.transactionQueue.on('error', (error) => {
      console.log(error)
    });
    // this.transactionQueue.empty().then(()=>{
    //     this.transactionQueue.close()
    // });

    this.transactionQueue.process((job, doneCallback) => {
      console.log('processing started');
      const { reference } = job.data;
      doneCallback();
      this.bitcoin.queryExplorer(reference).then((isPaid: boolean) => {
        if (isPaid) {
          console.log('job ended');
          doneCallback();
        }
      });
      this.ethereum.queryExplorer(reference).then((isPaid: boolean) => {
        if (isPaid) {
          console.log('job ended');
          doneCallback();
        }
      });
    });
  }
  async addToQueue(reference: string) {
    console.log('addToQueue');
    await this.transactionQueue.add(
      {
        reference,
      },
      {
        jobId: reference,
        removeOnComplete: true,
        timeout: this.setMinutes(1),

        attempts: 3,
        backoff: this.setMinutes(1),
        delay: this.setMinutes(0),
      },
    );
  }
  setMinutes(minutes: number): number {
    return 60 * 1000 * minutes;
  }
  async initiateTransaction(reference: string, fiatAmount: number, fiatCurrency: string) {
    const supportedAssets: Array<string> = ['bitcoin', 'ethereum'];
    const endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${supportedAssets.join(
      ',',
    )}&vs_currencies=${fiatCurrency.toLowerCase()}`;
    const response: AxiosResponse = await axios.get(endpoint);

    const { data } = response;

    const bitcoinTransaction = await this.bitcoin.initiateTransaction(
      reference,
      fiatAmount,
      fiatCurrency,
      data.bitcoin[fiatCurrency.toLowerCase()],
    );
    const ethereumTransaction = await this.ethereum.initiateTransaction(
      reference,
      fiatAmount,
      fiatCurrency,
      data.ethereum[fiatCurrency.toLowerCase()],
    );

    await this.addToQueue(reference);
    return {
      bitcoinTransaction,
      ethereumTransaction,
    };
  }
}
