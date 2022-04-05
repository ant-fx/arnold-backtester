import mongoose from 'mongoose';

import {BacktestResults} from '../../backtest/controller';
import {
  connect,
  disconnect,
  getBacktest,
  getBacktests,
  resetDatabase,
  storeBacktestResults,
  listAvailablePeriodsForSymbolAndDate,
} from '../../utils/db';

import {DbTimeSeriesBar} from '../../models/models';

import {getTestDate} from '../test-utils/tick';

describe('mongo db tests', () => {
  beforeAll(async () => {
    // Reset the test database
    await resetDatabase();

    // Connect again
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  test('connecting to test database', async () => {
    // Load some results
    const backtests = await getBacktests();

    // No tests have been saved yet
    expect(backtests.length).toBe(0);
  });

  test('storing backtest results', async () => {
    const symbol = 'ZZZZ';

    const results: BacktestResults = {
      createdAt: getTestDate(),
      positions: [
        {
          symbol,
          closeReason: 'test',
          isClosing: false,
          size: 0,
          data: {
            data1: '123',
          },
          orders: [
            {
              id: 1,
              type: 'MKT',
              symbol,
              action: 'BUY',
              shares: 100,
              state: 'FILLED',
              avgFillPrice: 123,
              openedAt: getTestDate(),
              filledAt: getTestDate(),
            },
          ],
        },
      ],
      profile: {
        strategy: {
          name: 'hod',
          source: 'test',
        },
        threads: 1,
        dates: {
          from: getTestDate(),
          to: getTestDate(),
          dates: [getTestDate()],
        },
        symbols: ['MSFT'],
        initialBalance: 1000,
        commissionPerOrder: 1,
      },
    };

    // Store the results
    await storeBacktestResults(results);

    // Make sure the results are the same
    const [storedBacktest] = await getBacktests();

    expect(storedBacktest).toMatchObject(results);

    // get an individual backtest
    const storedSingleBacktest = await getBacktest(
      storedBacktest._id?.toString() || '',
    );
    expect(storedSingleBacktest).toMatchObject(results);
  });

  test('check available bar data for symbol', async () => {
    const periods1 = await listAvailablePeriodsForSymbolAndDate(
      'ZZZZ',
      getTestDate(),
    );
    expect(periods1).toMatchInlineSnapshot(`Array []`);

    // Insert some test data
    const TimeSeriesBar = mongoose.model<DbTimeSeriesBar>('TimeSeriesBar');

    await TimeSeriesBar.create({
      symbol: 'ZZZZ',
      time: getTestDate(),
      period: 'm1',
      open: 1,
      high: 1,
      low: 1,
      close: 1,
      volume: 1,
    });

    await TimeSeriesBar.create({
      symbol: 'ZZZZ',
      time: getTestDate(),
      period: 'daily',
      open: 1,
      high: 1,
      low: 1,
      close: 1,
      volume: 1,
    });

    const periods2 = await listAvailablePeriodsForSymbolAndDate(
      'ZZZZ',
      getTestDate(),
    );

    expect(periods2).toMatchInlineSnapshot(`
      Array [
        "daily",
        "m1",
      ]
    `);
  });
});
