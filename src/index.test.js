//
// Copyright 2019 Wireline, Inc.
//

import yaml from 'node-yaml';

import { Registry } from './index';

const PRIVATE_KEY = 'b1e4e95dd3e3294f15869b56697b5e3bdcaa24d9d0af1be9ee57d5a59457843a';

const YML_PATH = './testing/bot.yml';

jest.setTimeout(10 * 1000);

describe('Querying', () => {
  let bot;

  const registry = new Registry('http://localhost:9473/query');

  beforeAll(async () => {
    bot = await yaml.read(YML_PATH);
    try {
      await registry.setRecord(PRIVATE_KEY, bot.record, PRIVATE_KEY);
    } catch (err) {
      console.log('Record exists.');
    }
  });

  test('List records.', async () => {
    const records = await registry.queryRecords({});
    expect(records.length).toBeGreaterThanOrEqual(1);
  });

  test('Query records by reference.', async () => {
    const { attributes: { protocol } } = bot.record;
    const records = await registry.queryRecords({ protocol });
    expect(records.length).toBeGreaterThanOrEqual(1);

    const { attributes: { protocol: recordProtocol } } = records[0];
    expect(protocol.id).toBe(recordProtocol.id);
  });

  test('Query records by attributes.', async () => {
    const { attributes: { version, name } } = bot.record;
    const records = await registry.queryRecords({ version, name });
    expect(records.length).toBe(1);

    bot = records[0];
    const { version: recordVersion, name: recordName } = bot;
    expect(recordVersion).toBe(version);
    expect(recordName).toBe(name);
  });

  test('Query records by id.', async () => {
    let records = await registry.getRecordsByIds([bot.id]);
    expect(records.length).toBe(1);
    expect(records[0].id).toBe(bot.id);
  });
});
