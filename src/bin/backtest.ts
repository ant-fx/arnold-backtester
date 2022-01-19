import Logger from '../utils/logger';
import {
  runBacktestController,
  BacktestControllerError,
} from '../backtest/controller';

import {connect, storeBacktestResults} from '../utils/db';

const log = Logger('backtest');

async function run() {
  const args = process.argv.slice(2);

  if (!args.length) {
    log('Please specify a profile');
    return;
  }

  try {
    log('Connecting to database');
    await connect();

    const results = await runBacktestController({
      log,
      profile: args[0],
    });

    await storeBacktestResults(results);

    log('Finished!');
  } catch (err) {
    const errorCode =
      err instanceof BacktestControllerError ? err.code : 'unknown';
    log(`Failed to run backtest: ${errorCode}`);
  }
}

run();
