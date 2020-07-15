//
// Copyright 2019 Wireline, Inc.
//

import debug from 'debug';
import path from 'path';

import { Registry, DEFAULT_CHAIN_ID } from './index';
import { ensureUpdatedConfig, provisionBondId } from './testing/helper';
import { startMockServer } from './mock/server';

const PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';

const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');

const MOCK_SERVER = process.env.MOCK_SERVER || false;
const WIRE_WNS_ENDPOINT = process.env.WIRE_WNS_ENDPOINT || 'http://localhost:9473/api';
const WIRE_WNS_CHAIN_ID = process.env.WIRE_WNS_CHAIN_ID || DEFAULT_CHAIN_ID;

const FEE = {
  amount: [
    {
      amount: '200000',
      denom: 'uwire'
    }
  ],
  gas: '200000'
};

const log = debug('test');

jest.setTimeout(40 * 1000);

describe('Querying', () => {
  let bot;

  let mock;

  let endpoint;
  let registry;

  let bondId;

  beforeAll(async () => {
    if (MOCK_SERVER) {
      mock = await startMockServer();
      log('Started mock server:', mock.serverInfo.url);
    }

    endpoint = mock ? mock.serverInfo.url : WIRE_WNS_ENDPOINT;
    registry = new Registry(endpoint, WIRE_WNS_CHAIN_ID);
    bondId = await provisionBondId(registry, PRIVATE_KEY, MOCK_SERVER);

    const publishNewBotVersion = async () => {
      bot = await ensureUpdatedConfig(BOT_YML_PATH);
      await registry.setRecord(PRIVATE_KEY, bot.record, PRIVATE_KEY, bondId, FEE);
      return bot.record.version;
    };

    await publishNewBotVersion();
  });

  test('Endpoint and chain ID.', async () => {
    const expectedEndpoint = MOCK_SERVER ? mock.serverInfo.url : WIRE_WNS_ENDPOINT;
    expect(registry.endpoint).toBe(expectedEndpoint);
    expect(registry.chainID).toBe(WIRE_WNS_CHAIN_ID);
  });

  test('Get status.', async () => {
    const status = await registry.getStatus();
    expect(status).toBeDefined();
    expect(status.version).toBeDefined();
  });

  test('List records.', async () => {
    const records = await registry.queryRecords({});
    expect(records.length).toBeGreaterThanOrEqual(1);
  });

  test('Query records by reference.', async () => {
    const { protocol } = bot.record;
    const records = await registry.queryRecords({ protocol });
    expect(records.length).toBeGreaterThanOrEqual(1);

    const { attributes: { protocol: recordProtocol } } = records[0];
    expect(protocol.id).toBe(recordProtocol.id);
  });

  test('Query records by attributes.', async () => {
    const { version, name } = bot.record;
    const records = await registry.queryRecords({ version, name });
    expect(records.length).toBe(1);

    [ bot ] = records;
    const { attributes: { version: recordVersion, name: recordName } } = bot;
    expect(recordVersion).toBe(version);
    expect(recordName).toBe(name);
  });

  test('Query records by id.', async () => {
    const records = await registry.getRecordsByIds([bot.id]);
    expect(records.length).toBe(1);
    expect(records[0].id).toBe(bot.id);
  });

  // test('Resolve records by refs - basic.', async () => {
  //   const ref = `${bot.type}:${bot.name}`;
  //   const records = await registry.resolveRecords([ref]);
  //   expect(records.length).toBe(1);
  //   expect(records[0].version).toBe(bot.version);
  // });

  afterAll(async () => {
    if (mock) {
      await mock.mockServer.stop();
    }
  });
});
