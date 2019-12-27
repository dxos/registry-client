//
// Copyright 2019 Wireline, Inc.
//

import debug from 'debug';
import path from 'path';

import { Registry } from './index';
import { ensureUpdatedConfig, provisionBondId } from './testing/helper';
import { startMockServer } from './mock/server';

const PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';

const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');

const MOCK_SERVER = process.env.MOCK_SERVER || false;
const WNS_GQL_ENDPOINT = process.env.WNS_GQL_ENDPOINT || 'http://localhost:9473';

const log = debug('test');

jest.setTimeout(40 * 1000);

describe('Querying', () => {
  let bot;

  let mock;
  let registry;

  let firstVersion;

  let bondId;

  beforeAll(async () => {
    if (MOCK_SERVER) {
      mock = await startMockServer();
      log('Started mock server:', mock.serverInfo.url);
    }

    registry = new Registry(mock ? mock.serverInfo.url : WNS_GQL_ENDPOINT);
    bondId = await provisionBondId(registry, PRIVATE_KEY, MOCK_SERVER);

    const publishNewBotVersion = async () => {
      bot = await ensureUpdatedConfig(BOT_YML_PATH);
      await registry.setRecord(PRIVATE_KEY, bot.record, PRIVATE_KEY, bondId);
      return bot.record.version;
    };

    firstVersion = await publishNewBotVersion();
    await publishNewBotVersion();
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
    const { version: recordVersion, name: recordName } = bot;
    expect(recordVersion).toBe(version);
    expect(recordName).toBe(name);
  });

  test('Query records by id.', async () => {
    const records = await registry.getRecordsByIds([bot.id]);
    expect(records.length).toBe(1);
    expect(records[0].id).toBe(bot.id);
  });

  test('Query records using semver.', async () => {
    const { type, name } = bot;
    const records = await registry.queryRecords({ version: '^' + firstVersion, name, type });
    expect(records.length).toBe(1);
    expect(records[0].version).toBe(bot.version);
  });

  test('Query only latest version.', async () => {
    const { type, name } = bot;
    const records = await registry.queryRecords({ version: 'latest', name, type });
    expect(records.length).toBe(1);
    expect(records[0].version).toBe(bot.version);
  });

  test('Resolve records by refs - basic.', async () => {
    const ref = `${bot.type}:${bot.name}`;
    const records = await registry.resolveRecords([ref]);
    expect(records.length).toBe(1);
    expect(records[0].version).toBe(bot.version);
  });

  test('Resolve records by refs - specific version.', async () => {
    const ref = `${bot.type}:${bot.name}#${firstVersion}`;
    const records = await registry.resolveRecords([ref]);
    expect(records.length).toBe(1);
    expect(records[0].version).toBe(firstVersion);
  });

  test('Resolve records by refs - tilde range.', async () => {
    const ref = `${bot.type}:${bot.name}#~${firstVersion}`;
    const records = await registry.resolveRecords([ref]);
    expect(records.length).toBe(1);
    expect(records[0].version).toBe(bot.version);
  });

  test('Resolve records by refs - caret range.', async () => {
    const ref = `${bot.type}:${bot.name}#^${firstVersion}`;
    const records = await registry.resolveRecords([ref]);
    expect(records.length).toBe(1);
    expect(records[0].version).toBe(bot.version);
  });

  test('Unique index on type, name and version.', async () => {
    const { name, version, type } = bot;
    const record = {
      displayName: 'newName',
      name,
      version,
      type
    };
    try {
      await registry.setRecord(PRIVATE_KEY, record, PRIVATE_KEY, bondId);
    } catch (err) {
      expect(err.message.includes('exists')).toBe(true);
    }
  });

  afterAll(async () => {
    if (mock) {
      await mock.mockServer.stop();
    }
  });
});
