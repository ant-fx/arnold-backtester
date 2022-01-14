import {fromUnixTime, parse, getUnixTime, endOfToday} from 'date-fns';
import {Tick, TickType} from '../../core';
import {flow} from 'fp-ts/lib/function';

import {Tracker, updateTracker, initTracker} from '../../utils/tracker';
import {getMarketOpen, getMarketClose} from '../../utils/market';
import {handleTick, initBroker, BrokerState} from '../../backtest/broker';

export function createTick({
  type,
  time,
  value,
  size,
}: {
  type: TickType;
  time: number;
  value: number;
  size: number;
}): Tick {
  return {
    type,
    time,
    value,
    size,
    dateTime: fromUnixTime(time),
    symbol: 'AAAA',
    index: 0,
  };
}

export function getTestDate() {
  return parse('2022-01-01', 'yyyy-MM-dd', new Date());
}

export function createTimeAsUnix(time: string) {
  return flow(parse, getUnixTime)(time, 'HH:mm', getTestDate());
}

export function createTimeAsDate(time: string) {
  return flow(parse)(time, 'HH:mm', getTestDate());
}

export type TestTickData = [string, number, number, number, number];

export function updateTestTracker(
  tracker: Tracker,
  state: BrokerState,
  ticks: Array<TestTickData>,
): Date {
  let lastDate: Date | null = null;

  ticks.forEach(tick => {
    const [timeString, bid, ask, price, volume] = tick;

    const time = flow(parse, getUnixTime)(
      timeString,
      'HH:mm:ss',
      getTestDate(),
    );

    const marketOpen = getMarketOpen(fromUnixTime(time));
    const marketClose = getMarketClose(fromUnixTime(time));

    // Update bid
    updateTracker({
      data: tracker,
      tick: createTick({
        type: 'BID',
        time,
        value: bid,
        size: 0,
      }),
      marketOpen,
      marketClose,
    });

    // Update ask
    updateTracker({
      data: tracker,
      tick: createTick({
        type: 'ASK',
        time,
        value: ask,
        size: 0,
      }),
      marketOpen,
      marketClose,
    });

    // Update last trade price/volume
    updateTracker({
      data: tracker,
      tick: createTick({
        type: 'TRADE',
        time,
        value: price,
        size: volume,
      }),
      marketOpen,
      marketClose,
    });

    lastDate = parse(timeString, 'HH:mm:ss', getTestDate());
  });

  if (!lastDate) {
    throw new Error('No ticks provided');
  }

  return lastDate;
}

type Market = {
  broker: BrokerState;
  time: Date;
  tracker: Tracker;
  symbol: string;
};

export function updateMarketDataAndBroker(
  market: Market,
  ticks: Array<TestTickData>,
) {
  market.time = updateTestTracker(market.tracker, market.broker, ticks);

  // Update the broker
  handleTick(market.broker, market.symbol, market.tracker);
}

export function createMarket(ticks: Array<TestTickData>) {
  if (!ticks.length) {
    throw new Error('No ticks provided');
  }

  const last = ticks[ticks.length - 1];

  const data: Market = {
    broker: initBroker({getMarketTime: () => data.time}),
    time: createTimeAsDate(last[0]),
    tracker: initTracker(),
    symbol: 'AAAA',
  };

  // Apply any initialization data
  updateMarketDataAndBroker(data, ticks);

  return data;
}
