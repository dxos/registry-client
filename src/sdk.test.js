//
// Copyright 2020 DXOS.org
//

import debug from 'debug';
import path from 'path';

import { Registry } from './index';
import { getConfig, ensureUpdatedConfig, provisionBondId } from './testing/helper';
import { startMockServer } from './mock/server';

const BOT_YML_PATH = path.join(__dirname, './testing/data/bot.yml');

const log = debug('test');

jest.setTimeout(40 * 1000);

const { mockServer, registry: { chainId, endpoint, privateKey, fee } } = getConfig();

describe('Querying', () => {
  let bot;

  let mock;

  let registryEndpoint;
  let registry;

  let bondId;

  beforeAll(async () => {
    if (mockServer) {
      mock = await startMockServer();
      log('Started mock server:', mock.serverInfo.url);
    }

    registryEndpoint = mock ? mock.serverInfo.url : endpoint;
    registry = new Registry(registryEndpoint, chainId);
    bondId = await provisionBondId(registry, privateKey, mockServer);

    const publishNewBotVersion = async () => {
      bot = await ensureUpdatedConfig(BOT_YML_PATH);
      await registry.setRecord(privateKey, bot.record, privateKey, bondId, fee);
      return bot.record.version;
    };

    await publishNewBotVersion();
  });

  test('Endpoint and chain ID.', async () => {
    const expectedEndpoint = mockServer ? mock.serverInfo.url : endpoint;
    expect(registry.endpoint).toBe(expectedEndpoint);
    expect(registry.chainID).toBe(chainId);
  });

  test('Get status.', async () => {
    const status = await registry.getStatus();
    expect(status).toBeDefined();
    expect(status.version).toBeDefined();
  });

  test('List records.', async () => {
    const records = await registry.queryRecords({}, true);
    expect(records.length).toBeGreaterThanOrEqual(1);
  });

  test('Query records by reference.', async () => {
    const { protocol } = bot.record;
    const records = await registry.queryRecords({ protocol }, true);
    expect(records.length).toBeGreaterThanOrEqual(1);

    const { attributes: { protocol: recordProtocol } } = records[0];
    expect(protocol['/']).toBe(recordProtocol['/']);
  });

  test('Query records by attributes.', async () => {
    const { version, name } = bot.record;
    const records = await registry.queryRecords({ version, name }, true);
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

  afterAll(async () => {
    if (mock) {
      await mock.mockServer.stop();
    }
  });
});
