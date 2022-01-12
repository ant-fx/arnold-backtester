import {format} from 'date-fns';
import {StaticPool} from 'node-worker-threads-pool';
import numeral from 'numeral';
import path from 'path';

import {profileExists, loadProfile} from '../utils/profile';
import {BackTestWorkerErrorCode} from '../backtest/worker';

const baseFolder = path.parse(__filename).dir;
const filePath = path.join(baseFolder, '../bin/worker.js');

type WorkerResult = {
  error?: BackTestWorkerErrorCode;
};

export async function runBacktestController({
  log,
  profile,
}: {
  log: (message: string, ...args: any) => void;
  profile: string;
}) {
  log(`Loading profile '${profile}'`);

  if (!(await profileExists(profile))) {
    log(`${profile} does not appear to be a valid profile`);
    return;
  }

  const runProfile = await loadProfile(profile);

  // Run the profile
  log(
    `Running strategy '${
      runProfile.strategy
    }' for tickers ${runProfile.symbols.join(', ')} from ${format(
      runProfile.dates.from,
      'yyyy-MM-dd',
    )} to ${format(runProfile.dates.to, 'yyyy-MM-dd')}`,
  );

  log(`Starting ${runProfile.threads} threads`);

  const pool = new StaticPool({
    size: runProfile.threads,
    task: filePath,
    workerData: {
      profile: runProfile,
    },
  });

  const start = Date.now();

  const dateSymbolCombos = runProfile.dates.dates
    .map(date => {
      return runProfile.symbols.map(symbol => ({
        date,
        symbol,
      }));
    })
    .flat();

  const results = await Promise.all(
    dateSymbolCombos.map(async ({date, symbol}) => {
      // This will choose one idle worker in the pool
      // to execute your heavy task without blocking
      // the main thread!
      const result = (await pool.exec({
        symbol,
        date,
      })) as WorkerResult;

      switch (result.error) {
        case 'no-symbol-data':
          log('Some symbol data is missing, ignoring');
          break;

        case 'strategy-not-found':
          log('Strategy not found, ignoring');
          break;

        case 'unknown':
          log('An unknown error occurred');
          break;
      }

      return result;
    }),
  );

  log(`Finished in ${numeral(Date.now() - start).format(',')}ms`);
  log('Results', results);

  // Shutdown the pool
  pool.destroy();
}
