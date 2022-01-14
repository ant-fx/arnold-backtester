// Access the workerData by requiring it.
import {format} from 'date-fns';
import numeral from 'numeral';

import {loadTsForSymbolAndDate} from '../utils/data';
import {Profile} from '../utils/profile';
import {loadStrategy} from '../utils/module';
import {mergeSortedArrays} from '../utils/data-structures';
import {initTracker, updateTracker, Tracker} from '../utils/tracker';
import {getMarketOpen, getMarketClose} from '../utils/market';
import {Tick, LoggerCallback} from '../core';
import {initBroker, placeOrder, handleTick} from './broker';

export type BackTestWorkerErrorCode =
  | 'strategy-not-found'
  | 'no-symbol-data'
  | 'invalid-symbol-data'
  | 'unknown';

export class BacktestWorkerError extends Error {
  constructor(public code: BackTestWorkerErrorCode) {
    super(code);
    Object.setPrototypeOf(this, BacktestWorkerError.prototype);
  }
}

function marketSortFn(row1: Tick, row2: Tick) {
  // Sort on both index and time so we don't loose th original order
  // if we have multiple values per second
  const val1 = row1.time * 1000000 + row1.index;
  const val2 = row2.time * 1000000 + row1.index;

  return val1 - val2;
}

async function loadJsOrTsStrategy(strategy: string) {
  return (
    (await loadStrategy(`../strategies/${strategy}.js`)) ||
    (await loadStrategy(`../strategies/${strategy}.ts`))
  );
}

export async function runBacktest({
  profile,
  symbol,
  date,
  log,
}: {
  profile: Profile;
  symbol: string;
  date: Date;
  log: LoggerCallback;
}) {
  // Make sure the module exists
  const strategy = await loadJsOrTsStrategy(profile.strategy);

  if (!strategy) {
    throw new BacktestWorkerError('strategy-not-found');
  }

  const symbols = Array.from(new Set([symbol, ...strategy.extraSymbols]));

  const start = Date.now();

  log(
    `Loading TS data for ${symbols.join(', ')} on ${format(
      date,
      'yyyy-MM-dd',
    )}`,
  );

  // Load the main symbol data
  const symbolData = await Promise.all(
    symbols.map(async symbol => await loadTsForSymbolAndDate(symbol, date)),
  );

  if (symbolData.some(data => !data)) {
    throw new BacktestWorkerError('no-symbol-data');
  }

  // Merge all the data
  const marketData = mergeSortedArrays<Tick>(
    symbolData as Array<Tick[]>,
    marketSortFn,
  );

  // Iterate the data..
  log(
    `Loaded ${numeral(marketData.length).format(
      '0,0',
    )} ticks for ${symbol} and ${strategy.extraSymbols.join(', ')}`,
  );

  const trackers = symbols.reduce(
    (acc, symbol) => ({
      ...acc,
      [symbol]: initTracker(),
    }),
    {} as Record<string, Tracker>,
  );

  const marketOpen = getMarketOpen(date);
  const marketClose = getMarketClose(date);

  const currentMarketTime: {
    current: Date;
  } = {
    current: date,
  };

  const brokerState = initBroker({
    getMarketTime: () => {
      return currentMarketTime.current;
    },
  });

  marketData.forEach(tick => {
    if (!trackers[tick.symbol]) {
      throw new BacktestWorkerError('invalid-symbol-data');
    }

    currentMarketTime.current = tick.dateTime;

    const tracker = trackers[tick.symbol];

    // If this is an update for our symbol then call the strategy
    if (tick.symbol === symbol) {
      strategy.onTick({
        log,
        tick,
        symbol,
        tracker,
        trackers,
      });
    }

    // Update the tracker data
    updateTracker({
      data: tracker,
      tick,
      marketOpen,
      marketClose,
    });

    // Update broker, open orders, etc
    handleTick(brokerState, tick.symbol, tracker);
  });

  log(`Finished ${symbol} in ${numeral(Date.now() - start).format(',')}ms`);

  return [];
}