import {fileExists, loadTsFile} from '../utils/data';

test('file does not exist', async () => {
  expect(await fileExists('./invalid-file')).toBe(false);
});

test('file exists', async () => {
  expect(await fileExists('./README.md')).toBe(true);
});

test('load valid ts data', async () => {
  const data = await loadTsFile('./src/tests/test-data/tick-data.csv');

  expect(data).toMatchInlineSnapshot(`
    Array [
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 0,
        "size": 15,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "TRADE",
        "value": 465.73,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 1,
        "size": 7,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "TRADE",
        "value": 466,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 2,
        "size": 7,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "TRADE",
        "value": 465.24,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 3,
        "size": 1,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "TRADE",
        "value": 465.46,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 4,
        "size": 1,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "TRADE",
        "value": 465.46,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 5,
        "size": 50,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "TRADE",
        "value": 465.1,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 6,
        "size": 3,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "TRADE",
        "value": 465.23,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 2,
        "size": 500,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "BID",
        "value": 464,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 2,
        "size": 100,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "ASK",
        "value": 466.98,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 3,
        "size": 1500,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "BID",
        "value": 464,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 3,
        "size": 100,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "ASK",
        "value": 466,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 4,
        "size": 100,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "BID",
        "value": 465,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 4,
        "size": 200,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "ASK",
        "value": 466,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 5,
        "size": 300,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "BID",
        "value": 465,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 5,
        "size": 500,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "ASK",
        "value": 465.78,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 6,
        "size": 300,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "BID",
        "value": 465,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 6,
        "size": 2500,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "ASK",
        "value": 465.61,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 7,
        "size": 300,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "BID",
        "value": 465,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 7,
        "size": 2500,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "ASK",
        "value": 465.43,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 8,
        "size": 300,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "BID",
        "value": 465,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 8,
        "size": 2400,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "ASK",
        "value": 465.24,
      },
      Object {
        "dateTime": 2021-11-04T08:00:00.000Z,
        "index": 9,
        "size": 300,
        "symbol": "SPY",
        "time": 1636012800,
        "type": "BID",
        "value": 465,
      },
    ]
  `);
});

test('return invalid ts file as an empty array', async () => {
  const data = await loadTsFile('./src/tests/test-data/invalid.csv');

  expect(data).toMatchInlineSnapshot(`null`);
});
