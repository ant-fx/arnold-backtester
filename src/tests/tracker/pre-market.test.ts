import {startOfToday, fromUnixTime} from 'date-fns';

import {initTracker, updateTracker} from '../../utils/tracker';
import {getMarketOpen, getMarketClose} from '../../utils/market';
import {Tick, TickType} from '../../utils/data';

function createTick({
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

test('pre-market high', () => {
  const data = initTracker();

  const marketOpen = getMarketOpen(startOfToday());
  const marketClose = getMarketClose(startOfToday());

  // Make sure we don't update on a bid
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'BID',
      value: 1,
      size: 100,
    }),
  });

  expect(data.preMarketHigh).toBe(0);

  // Update the first value
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'TRADE',
      value: 1,
      size: 100,
    }),
  });

  expect(data.preMarketHigh).toBe(1);

  // Make sure it updates with a second
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'TRADE',
      value: 2,
      size: 100,
    }),
  });

  expect(data.preMarketHigh).toBe(2);

  // Don't go back down
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'TRADE',
      value: 1.4,
      size: 100,
    }),
  });

  expect(data.preMarketHigh).toBe(2);

  // Don't update after the market is open
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen + 1,
      type: 'TRADE',
      value: 3,
      size: 100,
    }),
  });

  expect(data.preMarketHigh).toBe(2);
});

test('pre-market low', () => {
  const data = initTracker();

  const marketOpen = getMarketOpen(startOfToday());
  const marketClose = getMarketClose(startOfToday());

  // Make sure we don't update on a bid
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'BID',
      value: 1,
      size: 100,
    }),
  });

  expect(data.preMarketLow).toBe(0);

  // Update the first value
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'TRADE',
      value: 1,
      size: 100,
    }),
  });

  expect(data.preMarketLow).toBe(1);

  // Make sure it updates with a second
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'TRADE',
      value: 0.8,
      size: 100,
    }),
  });

  expect(data.preMarketLow).toBe(0.8);

  // Don't go back down
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'TRADE',
      value: 1.2,
      size: 100,
    }),
  });

  expect(data.preMarketLow).toBe(0.8);

  // Don't update after the market is open
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen + 1,
      type: 'TRADE',
      value: 0.4,
      size: 100,
    }),
  });

  expect(data.preMarketLow).toBe(0.8);
});

test('pre-market volume', () => {
  const data = initTracker();

  const marketOpen = getMarketOpen(startOfToday());
  const marketClose = getMarketClose(startOfToday());

  // Make sure we don't update on a bid
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'BID',
      value: 1,
      size: 100,
    }),
  });

  // Don't update in pre-market
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen - 1,
      type: 'TRADE',
      value: 1,
      size: 100,
    }),
  });

  expect(data.preMarketVolume).toBe(100);

  // Update the first value
  updateTracker({
    data,
    marketOpen,
    marketClose,
    tick: createTick({
      time: marketOpen,
      type: 'TRADE',
      value: 1,
      size: 100,
    }),
  });

  expect(data.preMarketVolume).toBe(100);
});