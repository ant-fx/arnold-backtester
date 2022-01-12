// Access the workerData by requiring it.
import {parentPort, workerData, threadId} from 'worker_threads';

import Logger from '../utils/logger';
import {runBacktest, BacktestWorkerError} from '../backtest/worker';
import {Profile} from '../utils/profile';

const log = Logger(`Worker#${threadId}`);

if (parentPort) {
  parentPort.on('message', async (param: {symbol: string; date: Date}) => {
    if (!parentPort) {
      return;
    }

    const {profile}: {profile: Profile} = workerData;

    try {
      const results = await runBacktest({
        profile,
        symbol: param.symbol,
        date: param.date,
        log,
      });

      // Let it log some stuff
      await new Promise(resolve => setTimeout(resolve, 0));

      // Send the results to the parent
      parentPort.postMessage({
        results,
      });
    } catch (err) {
      parentPort.postMessage({
        error: err instanceof BacktestWorkerError ? err.code : 'unknown',
      });
    }
  });
}
